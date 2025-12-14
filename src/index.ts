import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";

import { APP_POLICIES, parseOrigins } from "./config.js";
import { rateLimit } from "./rageLimit.js";
import { getClientIp, verifySharedSecret } from "./security.js";
import { callOpenRouterStream, type ChatRequest } from "./openaiCompat.js";

const app = new Hono();

function corsHeaders(origin?: string): Headers {
    const headers = new Headers();
    const allowed = parseOrigins();

    if (origin && (allowed.includes("*") || allowed.includes(origin))) {
        headers.set("Access-Control-Allow-Origin", origin);
        headers.set("Vary", "Origin");
    }

    headers.set("Access-Control-Allow-Headers", "content-type, x-autoui-secret");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Cache-Control", "no-cache");

    return headers;
}

app.options("/v1/chat", (c) => {
    const origin = c.req.header("origin");
    return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
    });
});

app.post("/v1/chat", async (c) => {
    const origin = c.req.header("origin");

    if (!verifySharedSecret(c.req.raw)) {
        const h = corsHeaders(origin);
        h.set("Content-Type", "application/json");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: h,
        });
    }

    let body: ChatRequest;
    try {
        body = await c.req.json();
    } catch {
        const h = corsHeaders(origin);
        h.set("Content-Type", "application/json");
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: h,
        });
    }

    const policy = APP_POLICIES[body.appId];
    if (!policy) {
        const h = corsHeaders(origin);
        h.set("Content-Type", "application/json");
        return new Response(JSON.stringify({ error: "Unknown appId" }), {
            status: 403,
            headers: h,
        });
    }

    const ip = getClientIp(c.req.raw);
    const rl = rateLimit(`${body.appId}:${ip}`, policy.rateLimitPerMin);
    if (!rl.ok) {
        const h = corsHeaders(origin);
        h.set("Content-Type", "application/json");
        h.set("Retry-After", String(rl.retryAfterSec));
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
            status: 429,
            headers: h,
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

    const h = corsHeaders(origin);
    h.set("Content-Type", "text/event-stream");
    h.set("Connection", "keep-alive");

    return new Response(llmResponse.body, {
        status: 200,
        headers: h,
    });
});

app.get("/health", () => {
    return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
    });
});

const port = Number(process.env.PORT ?? 8787);
console.log(`🚀 AutoUI Proxy running on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});
