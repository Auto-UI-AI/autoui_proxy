import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { ensureIndexes } from "./db/indexes.js";
import { chatRoutes } from "./http/routes/chat.routes.js";
import { cors } from "hono/cors";
import { uiRoutes } from "./http/routes/ui.routes.js";

const app = new Hono();

app.use(
    "*",
    cors({
        origin: "*", // або ["http://localhost:5173"]
        allowMethods: ["GET", "POST", "OPTIONS", "DELETE"],
        allowHeaders: ["Content-Type", "X-AUTOUI-APP-ID", "X-AUTOUI-SECRET", "Authorization"],
        exposeHeaders: [],
        credentials: false,
    })
);

app.route("/ui", uiRoutes);
app.route("/chat", chatRoutes);

app.get("/health", () => {
    return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
    });
});

const port = Number(process.env.PORT ?? 8787);

await ensureIndexes();

console.log(`running on port http://localhost:${port}`);
serve({ fetch: app.fetch, port });
