import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";

import { APP_POLICIES, parseOrigins } from "./config";
import { rateLimit } from "./rageLimit";
import { getClientIp, verifySharedSecret } from "./security";
import { callOpenRouterStream, type ChatRequest } from "./openaiCompat";

const app = new Hono();

function setCors(c: any) {
    const origins = parseOrigins();
    const origin = c.req.header("origin");

    if (!origin) return;

    if (origins.includes("*") || origins.includes(origin)) {
        c.header("Access-Control-Allow-Origin", origin);
        c.header("Vary", "Origin");
        c.header("Access-Control-Allow-Headers", "content-type, x-autoui-secret");
        c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    }
}

function corsHeaders(origin?: string) {
    return {
        "Access-Control-Allow-Origin": origin ?? "*",
        "Access-Control-Allow-Headers": "content-type, x-autoui-secret",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Credentials": "true",
        Vary: "Origin",
    };
}

app.options("/v1/chat", (c) => {
    setCors(c);
    return c.body(null, 204);
});

app.post("/v1/chat", async (c) => {
    const origin = c.req.header("origin");

    if (!verifySharedSecret(c.req.raw)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: {
                ...corsHeaders(origin),
                "Content-Type": "application/json",
            },
        });
    }

    let body: ChatRequest;
    try {
        body = await c.req.json();
    } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: {
                ...corsHeaders(origin),
                "Content-Type": "application/json",
            },
        });
    }

    const policy = APP_POLICIES[body.appId];
    if (!policy) {
        return new Response(JSON.stringify({ error: "Unknown appId" }), {
            status: 403,
            headers: {
                ...corsHeaders(origin),
                "Content-Type": "application/json",
            },
        });
    }

    const ip = getClientIp(c.req.raw);
    const rl = rateLimit(`${body.appId}:${ip}`, policy.rateLimitPerMin);
    if (!rl.ok) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
            status: 429,
            headers: {
                ...corsHeaders(origin),
                "Content-Type": "application/json",
                "Retry-After": String(rl.retryAfterSec),
            },
        });
    }

    const messages = [
        {
            role: "system" as const,
            content: [
                "You are AutoUI assistant.",
                "Help users discover available UI features and actions.",
                "Use tools ONLY when appropriate.",
                "Never invent tool names or arguments.",
            ].join("\n\n"),
        },
        ...body.messages,
    ];

    const llmResponse = await callOpenRouterStream({
        model: policy.model,
        maxTokens: policy.maxTokens,
        temperature: body.temperature ?? policy.temperature,
        messages,
        tools: policy.allowTools ? body.tools ?? [] : [],
    });

    return new Response(llmResponse.body, {
        status: 200,
        headers: {
            ...corsHeaders(origin),
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
});

app.get("/health", (c) => {
    return c.json({ ok: true });
});

const port = Number(process.env.PORT ?? 8787);

console.log(`🚀 AutoUI Proxy running at http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port,
});
