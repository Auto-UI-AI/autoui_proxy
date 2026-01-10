import type { Request } from "@hono/node-server/dist/request.js";

export async function authAppAccess(req: Request, bodyAppId?: string) {
    const gotSecret = req.headers.get("x-autoui-secret");
    const gotAppId = req.headers.get("x-autoui-app-id");

    if (!gotSecret || !gotAppId) {
        console.log("Missing headers", gotSecret, gotAppId);
        return { ok: false as const, reason: "Unauthorized" };
    }

    if (bodyAppId && bodyAppId !== gotAppId) {
        console.log("AppId mismatch", bodyAppId, gotAppId);
        return { ok: false as const, reason: "AppId mismatch" };
    }

    return { ok: true as const, tokenEntity: null };
}
