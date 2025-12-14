import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { ensureIndexes } from "./db/indexes.js";
import { chatRoutes } from "./http/routes/chat.routes.js";
import { uiRoutes } from "./http/routes/ui.routes.js";

const app = new Hono();

app.route("/", uiRoutes);
app.route("/", chatRoutes);

app.get("/health", () => {
    return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
    });
});

const port = Number(process.env.PORT ?? 8787);

await ensureIndexes();

console.log(`🚀 AutoUI Proxy running on port http://localhost:${port}`);
serve({ fetch: app.fetch, port });

