import { Hono } from "hono";
import { authAppAccess } from "../middlewares/auth.js";
import { ChatController } from "../controllers/chat.controller.js";
import type { ChatRequest } from "../../llm/openaiCompat.js";

export const chatRoutes = new Hono();
const ctrl = new ChatController();

chatRoutes.post("/create", async (c) => {
    let body: ChatRequest;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const appId = c.req.header("X-AUTOUI-APP-ID");
    if (!appId) {
        return c.json({ error: "Missing app id" }, { status: 400 });
    }

    const auth = await authAppAccess(c.req.raw, appId);
    if (!auth.ok) {
        return c.json({ error: auth.reason }, { status: 401 });
    }

    const result = await ctrl.handleChat(c.req.raw, appId, body, auth.tokenEntity);
    console.log("result", result);
    if (result.stream) {
        c.header("Content-Type", "text/event-stream");
        c.header("Cache-Control", "no-cache");
        c.header("Connection", "keep-alive");
        return c.body(result.stream);
    }
    console.log(result.json, { status: result.status });
    return c.json(result.json, { status: result.status } as any);
});

chatRoutes.post("/extraAnalysis", async (c) => {
    let body: { messages: ChatRequest["messages"]; temperature?: number; appId?: string };
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const appId = c.req.header("X-AUTOUI-APP-ID") || body.appId;
    if (!appId) {
        return c.json({ error: "Missing app id" }, { status: 400 });
    }

    if (!body.messages || !Array.isArray(body.messages)) {
        return c.json({ error: "Missing or invalid messages array" }, { status: 400 });
    }

    const auth = await authAppAccess(c.req.raw, appId);
    if (!auth.ok) {
        return c.json({ error: auth.reason }, { status: 401 });
    }

    const result = await ctrl.handleExtraAnalysis(c.req.raw, appId, body, auth.tokenEntity);
    console.log(result.json, { status: result.status }, 21312313123121);
    return c.json(result.json, { status: result.status } as any);
});

chatRoutes.post("/errorHandling", async (c) => {
    let body: { messages: ChatRequest["messages"]; temperature?: number; appId?: string };
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const appId = c.req.header("X-AUTOUI-APP-ID") || body.appId;
    if (!appId) {
        return c.json({ error: "Missing app id" }, { status: 400 });
    }

    if (!body.messages || !Array.isArray(body.messages)) {
        return c.json({ error: "Missing or invalid messages array" }, { status: 400 });
    }

    const auth = await authAppAccess(c.req.raw, appId);
    if (!auth.ok) {
        return c.json({ error: auth.reason }, { status: 401 });
    }

    const result = await ctrl.handleErrorHandling(c.req.raw, appId, body, auth.tokenEntity);
    return c.json(result.json, { status: result.status } as any);
});