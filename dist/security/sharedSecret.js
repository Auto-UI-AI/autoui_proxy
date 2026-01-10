export function verifySharedSecret(req, bodyAppId) {
    const gotSecret = req.headers.get("x-autoui-secret");
    const gotAppId = req.headers.get("x-autoui-app-id");
    if (bodyAppId && bodyAppId !== gotAppId)
        return false;
    return !!gotSecret;
}
//# sourceMappingURL=sharedSecret.js.map