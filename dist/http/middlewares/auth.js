export async function authAppAccess(req, bodyAppId) {
    const secret = process.env.AUTOUI_PROXY_SHARED_SECRET;
    if (!secret) {
        console.warn("AUTOUI_PROXY_SHARED_SECRET is not set, skipping secret check!");
        return { ok: true, tokenEntity: null };
    }
    const gotSecret = req.headers.get("x-autoui-secret");
    const gotAppId = req.headers.get("x-autoui-app-id");
    if (!gotSecret || !gotAppId) {
        console.log("Missing headers", gotSecret, gotAppId);
        return { ok: false, reason: "Unauthorized" };
    }
    if (bodyAppId && bodyAppId !== gotAppId) {
        console.log("AppId mismatch", bodyAppId, gotAppId);
        return { ok: false, reason: "AppId mismatch" };
    }
    if (gotSecret !== secret) {
        console.log("Secret mismatch", gotSecret, secret);
        return { ok: false, reason: "Unauthorized" };
    }
    return { ok: true, tokenEntity: null };
}
//# sourceMappingURL=auth.js.map