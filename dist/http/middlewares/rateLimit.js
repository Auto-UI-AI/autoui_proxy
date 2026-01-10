const buckets = new Map();
export function rateLimit(key, limitPerMin) {
    const now = Date.now();
    const windowMs = 60_000;
    const b = buckets.get(key);
    if (!b || now >= b.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true, retryAfterSec: 0 };
    }
    if (b.count >= limitPerMin) {
        return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
    }
    b.count += 1;
    return { ok: true, retryAfterSec: 0 };
}
//# sourceMappingURL=rateLimit.js.map