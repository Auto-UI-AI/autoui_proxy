export function verifySharedSecret(req, bodyAppId) {
    const secret = process.env.AUTOUI_PROXY_SHARED_SECRET;
    if (!secret)
        return true;
    const gotSecret = req.headers.get("x-autoui-secret");
    const gotAppId = req.headers.get("x-autoui-app-id");
    if (bodyAppId && bodyAppId !== gotAppId)
        return false;
    return gotSecret === secret;
}
//# sourceMappingURL=sharedSecret.js.map