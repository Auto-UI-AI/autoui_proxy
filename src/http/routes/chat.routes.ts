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

    if (result.stream) {
        c.header("Content-Type", "text/event-stream");
        c.header("Cache-Control", "no-cache");
        c.header("Connection", "keep-alive");
        return c.body(result.stream);
    }

    return c.json(result.json, { status: result.status } as any);
});
