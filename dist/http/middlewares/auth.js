export async function authAppAccess(req, bodyAppId) {
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
    return { ok: true, tokenEntity: null };
}
//# sourceMappingURL=auth.js.map