import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
function getEncryptionKey() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error("ENCRYPTION_KEY environment variable is required");
    }
    return key.slice(0, 32).padEnd(32, "0");
}
const ALGORITHM = "aes-256-cbc";
export function generateToken() {
    const raw = crypto.randomBytes(32).toString("base64url");
    return `autoui_sk_${raw}`;
}
export function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
export function generateSharedSecret() {
    const raw = crypto.randomBytes(32).toString("base64url");
    return `autoui_shared_${raw}`;
}
export function encryptApiKey(apiKey) {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);
    let encrypted = cipher.update(apiKey, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
}
export function decryptApiKey(encryptedApiKey) {
    const key = getEncryptionKey();
    const parts = encryptedApiKey.split(":");
    if (parts.length !== 2) {
        throw new Error("Invalid encrypted API key format");
    }
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
//# sourceMappingURL=crypto.js.map