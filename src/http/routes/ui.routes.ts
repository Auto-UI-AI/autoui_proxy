import { Hono } from "hono";
import { corsHeaders } from "../middlewares/cors.js";
import { UiController } from "../controllers/ui.controller.js";
import { authMiddleware } from "../middlewares/jwtAuth.js";
import { FREE_AI_MODELS } from "../../config.js";

export const uiRoutes = new Hono();
const ctrl = new UiController();

uiRoutes.get("/models", async (c) => {
    const origin = c.req.header("origin");
    const h = corsHeaders(origin);
    h.set("Content-Type", "application/json");
    return new Response(JSON.stringify({ models: FREE_AI_MODELS }), { headers: h });
});

uiRoutes.get("/apps", authMiddleware, async (c) => {
    const origin = c.req.header("origin");
    const h = corsHeaders(origin);
    h.set("Content-Type", "application/json");
    const res = await ctrl.listApps(c);
    if ("error" in res) {
        return new Response(JSON.stringify(res), { status: 401, headers: h });
    }
    return new Response(JSON.stringify({ items: res }), { headers: h });
});

uiRoutes.post("/apps", authMiddleware, async (c) => {
    const origin = c.req.header("origin");
    const h = corsHeaders(origin);
    h.set("Content-Type", "application/json");

    const body = await c.req.json();
    const res = await ctrl.createApp(c, body);
    if (res.error) {
        const status = res.error === "Unauthorized" ? 401 : 400;
        return new Response(JSON.stringify(res), { status, headers: h });
    }
    return new Response(JSON.stringify(res), { status: 201, headers: h });
});

uiRoutes.get("/tokens", authMiddleware, async (c) => {
    const origin = c.req.header("origin");
    const h = corsHeaders(origin);
    h.set("Content-Type", "application/json");

    const appId = c.req.query("appId");
    if (!appId)
        return new Response(JSON.stringify({ error: "Missing appId" }), {
            status: 400,
            headers: h,
        });

    const res = await ctrl.listTokens(c, appId);
    if (res.error) {
        const status =
            res.error === "Unauthorized" ? 401 : res.error === "App not found" ? 404 : 400;
        return new Response(JSON.stringify(res), { status, headers: h });
    }
    return new Response(JSON.stringify(res), { headers: h });
});

uiRoutes.post("/tokens", authMiddleware, async (c) => {
    const origin = c.req.header("origin");
    const h = corsHeaders(origin);
    h.set("Content-Type", "application/json");

    const body = await c.req.json();
    const res = await ctrl.createToken(c, body);
    if ("error" in res) {
        const status =
            res.error === "Unauthorized" ? 401 : res.error === "App not found" ? 404 : 400;
        return new Response(JSON.stringify(res), { status, headers: h });
    }

    return new Response(JSON.stringify(res), { status: 201, headers: h });
});

uiRoutes.delete("/tokens/:id", authMiddleware, async (c) => {
    const origin = c.req.header("origin");
    const h = corsHeaders(origin);
    h.set("Content-Type", "application/json");

    const id = c.req.param("id");
    const res = await ctrl.revokeToken(c, id);
    if (res.error) {
        return new Response(JSON.stringify(res), { status: 401, headers: h });
    }
    return new Response(null, { status: 204, headers: h });
});

uiRoutes.get("/apps/:appId/shared-secret", authMiddleware, async (c) => {
    const origin = c.req.header("origin");
    const h = corsHeaders(origin);
    h.set("Content-Type", "application/json");

    const appId = c.req.param("appId");
    const res = await ctrl.getSharedSecret(c, appId);
    if (res.error) {
        const status = res.error === "Unauthorized" ? 401 : res.error === "App not found" ? 404 : 400;
        return new Response(JSON.stringify(res), { status, headers: h });
    }
    return new Response(JSON.stringify(res), { headers: h });
});

uiRoutes.delete("/apps/:appId", authMiddleware, async (c) => {
    const origin = c.req.header("origin");
    const h = corsHeaders(origin);
    h.set("Content-Type", "application/json");

    const appId = c.req.param("appId");
    const res = await ctrl.deleteApp(c, appId);
    if (res.error) {
        const status = res.error === "Unauthorized" ? 401 : res.error === "App not found" ? 404 : 400;
        return new Response(JSON.stringify(res), { status, headers: h });
    }
    return new Response(JSON.stringify(res), { status: 200, headers: h });
});
