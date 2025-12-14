import crypto from "crypto";

export function generateToken(): string {
    const raw = crypto.randomBytes(32).toString("base64url");
    return `autoui_sk_${raw}`;
}

export function hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}
