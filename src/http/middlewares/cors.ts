import { parseOrigins } from "../../config.js";

export function corsHeaders(origin?: string): Headers {
    const headers = new Headers();
    const allowed = parseOrigins();

    if (origin && (allowed.includes("*") || allowed.includes(origin))) {
        headers.set("Access-Control-Allow-Origin", origin);
        headers.set("Vary", "Origin");
    }

    headers.set("Access-Control-Allow-Headers", "content-type, x-autoui-secret, authorization ",);
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, DELETE");
    headers.set("Cache-Control", "no-cache");

    return headers;
}
