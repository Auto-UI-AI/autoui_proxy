import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";

import { APP_POLICIES, parseOrigins } from "./config";
import { rateLimit } from "./rageLimit";
import { getClientIp, verifySharedSecret } from "./security";
import { callOpenRouterStream } from "./openaiCompat";
import type { ChatRequest } from "./openaiCompat";

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

app.options("/v1/chat", (c) => {
    setCors(c);
    return c.body(null, 204);
});

app.post("/v1/chat", async (c) => {
    setCors(c);

    if (!verifySharedSecret(c.req.raw)) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    let body: ChatRequest;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON" }, 400);
    }

    if (!body.appId || !Array.isArray(body.messages)) {
        return c.json({ error: "Missing appId or messages" }, 400);
    }

    const policy = APP_POLICIES[body.appId];
    if (!policy) {
        return c.json({ error: "Unknown appId" }, 403);
    }

    const ip = getClientIp(c.req.raw);
    const rateKey = `${body.appId}:${ip}`;
    const rl = rateLimit(rateKey, policy.rateLimitPerMin);

    if (!rl.ok) {
        c.header("Retry-After", String(rl.retryAfterSec));
        return c.json({ error: "Rate limit exceeded" }, 429);
    }

    const systemPromptParts: string[] = [];

    if (body.appDescriptionPrompt) {
        systemPromptParts.push(`App context: ${body.appDescriptionPrompt}`);
    }

    systemPromptParts.push(
        "You are AutoUI assistant.",
        "Help users discover available UI features and actions.",
        "Use tools ONLY when appropriate.",
        "Never invent tool names or arguments."
    );

    const messages = [
        {
            role: "system" as const,
            content: systemPromptParts.join("\n\n"),
        },
        ...body.messages,
    ];

    const temperature =
        typeof body.temperature === "number" ? body.temperature : policy.temperature;

    try {
        const llmResponse = await callOpenRouterStream({
            model: policy.model,
            maxTokens: policy.maxTokens,
            temperature,
            messages,
            tools: policy.allowTools ? body.tools ?? [] : [],
        });

        c.header("Content-Type", "text/event-stream");
        c.header("Cache-Control", "no-cache");
        c.header("Connection", "keep-alive");

       return c.newResponse(llmResponse.body, 200);
    } catch (err: any) {
        console.error("Proxy error:", err);
        return c.json({ error: err?.message ?? "Internal proxy error" }, 500);
    }
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
