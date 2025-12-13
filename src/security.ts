export function getClientIp(req: Request): string {
    return (
        req.headers.get("cf-connecting-ip") ||
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown"
    );
}

export function verifySharedSecret(req: Request): boolean {
    const secret = process.env.AUTOUI_PROXY_SHARED_SECRET;
    if (!secret) return true;

    const got = req.headers.get("x-autoui-secret");
    return got === secret;
}
