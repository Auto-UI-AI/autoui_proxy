export function getClientIp(req) {
    return (req.headers.get("cf-connecting-ip") ||
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown");
}
//# sourceMappingURL=ip.js.map