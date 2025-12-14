import { Hono } from "hono";
import { corsHeaders } from "../middlewares/cors.js";
import { UiController } from "../controllers/ui.controller.js";

export const uiRoutes = new Hono();
const ctrl = new UiController();

uiRoutes.options("*", (c) => {
    const origin = c.req.header("origin");
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
});

uiRoutes.get("/ui/apps", async (c) => {
    const origin = c.req.header("origin");
    const h = corsHeaders(origin);
    h.set("Content-Type", "application/json");
    return new Response(JSON.stringify({ items: await ctrl.listApps() }), { headers: h });
});

uiRoutes.post("/ui/apps", async (c) => {
    const origin = c.req.header("origin");
    const h = corsHeaders(origin);
    h.set("Content-Type", "application/json");

    const body = await c.req.json();
    const res = await ctrl.createApp(body);
    return new Response(JSON.stringify(res), { status: 201, headers: h });
});

uiRoutes.get("/ui/tokens", async (c) => {
    const origin = c.req.header("origin");
    const h = corsHeaders(origin);
    h.set("Content-Type", "application/json");

    const appId = c.req.query("appId");
    if (!appId)
        return new Response(JSON.stringify({ error: "Missing appId" }), {
            status: 400,
            headers: h,
        });

    const res = await ctrl.listTokens(appId);
    return new Response(JSON.stringify(res), { headers: h });
});

uiRoutes.post("/ui/tokens", async (c) => {
    const origin = c.req.header("origin");
    const h = corsHeaders(origin);
    h.set("Content-Type", "application/json");

    const body = await c.req.json();
    const res = await ctrl.createToken(body);
    return new Response(JSON.stringify(res), { status: 201, headers: h });
});

uiRoutes.delete("/ui/tokens/:id", async (c) => {
    const origin = c.req.header("origin");
    const h = corsHeaders(origin);
    h.set("Content-Type", "application/json");

    const id = c.req.param("id");
    await ctrl.revokeToken(id);
    return new Response(null, { status: 204, headers: h });
});
