import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { chatRoutes } from "./http/routes/chat.routes.js";
import { uiRoutes } from "./http/routes/ui.routes.js";

import { APP_POLICIES, parseOrigins } from "./config";
import { rateLimit } from "./rageLimit";
import { getClientIp, verifySharedSecret } from "./security";
import { callOpenRouterStream } from "./openaiCompat";
import type { ChatRequest } from "./openaiCompat";

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

console.log(`running on port http://localhost:${port}`);
serve({ fetch: app.fetch, port });
