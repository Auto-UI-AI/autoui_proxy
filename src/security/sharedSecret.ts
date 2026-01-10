export function verifySharedSecret(req: Request, bodyAppId?: string): boolean {
    const gotSecret = req.headers.get("x-autoui-secret");
    const gotAppId = req.headers.get("x-autoui-app-id");

    if (bodyAppId && bodyAppId !== gotAppId) return false;
    return !!gotSecret;
}
