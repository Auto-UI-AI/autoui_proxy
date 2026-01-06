import { Hono } from "hono";
import { corsHeaders } from "../middlewares/cors.js";
import { authAppAccess } from "../middlewares/auth.js";
import { ChatController } from "../controllers/chat.controller.js";
import type { ChatRequest } from "../../llm/openaiCompat.js";

export const chatRoutes = new Hono();
const ctrl = new ChatController();

chatRoutes.options("/v1/chat", (c) => {
    const origin = c.req.header("origin");
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
});

chatRoutes.post("/v1/chat", async (c) => {
  const origin = c.req.header("origin");

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

  const auth = await authAppAccess(c.req.raw, body.appId);
  if (!auth.ok) {
    const h = corsHeaders(origin);
    h.set("Content-Type", "application/json");
    return new Response(JSON.stringify({ error: auth.reason }), {
      status: 401,
      headers: h,
    });
  }

  try {
    const result = await ctrl.handleChat(c.req.raw, body, auth.tokenEntity);

    const h = corsHeaders(origin);
    if (result.retryAfter) h.set("Retry-After", String(result.retryAfter));

    if (result.stream) {
      h.set("Content-Type", "text/event-stream");
      h.set("Connection", "keep-alive");
      return new Response(result.stream, { status: 200, headers: h });
    }

    h.set("Content-Type", "application/json");
    return new Response(JSON.stringify(result.json), {
      status: result.status,
      headers: h,
    });
  } catch (err) {
    console.error("handleChat error:", err);

    const h = corsHeaders(origin);
    h.set("Content-Type", "application/json");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: h }
    );
  }
});

chatRoutes.options("/v1/chat/extraAnalysis", (c) => {
    const origin = c.req.header("origin");
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
});
chatRoutes.post("/v1/chat/extraAnalysis", async (c) => {
    const origin = c.req.header("origin");
    console.log('fethed to /v1/chat/extraAnalysis endpoint');
    let body: ChatRequest;
    try {
        body = await c.req.json();
    } catch {
        const h = corsHeaders(origin);
        h.set("Content-Type", "application/json");
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: h });
    }

    const auth = await authAppAccess(c.req.raw, body.appId);
    if (!auth.ok) {
        const h = corsHeaders(origin);
        h.set("Content-Type", "application/json");
        return new Response(JSON.stringify({ error: auth.reason }), { status: 401, headers: h });
    }

    const result = await ctrl.handleExtraAnalysisNonStream(c.req.raw, body={...body}, auth.tokenEntity);

    const h = corsHeaders(origin);
    if (result.retryAfter) h.set("Retry-After", String(result.retryAfter));

    if (!result) {
        return new Response(JSON.stringify({ error: "Internal server error" }),{ status: 500, headers: h });
    }

    h.set("Content-Type", "application/json");
    console.log('result from /v1/chat/extraAnalysis:', JSON.stringify(result));
    return new Response(JSON.stringify(result.llmResponse.choices[0].message.content), {
      status: result.status,
      headers: h,
    });
});
