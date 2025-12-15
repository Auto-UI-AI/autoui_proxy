import crypto from "crypto";

export function generateToken(): string {
    const raw = crypto.randomBytes(32).toString("base64url");
    return `autoui_sk_${raw}`;
}

export function hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}
function loadEncryptionKey(): Buffer {
  const b64 = process.env.ENCRYPTION_KEY;
  if (!b64) throw new Error("Missing ENCRYPTION_KEY env var");

  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) {
    throw new Error(`ENCRYPTION_KEY must decode to 32 bytes (got ${key.length})`);
  }
  return key;
}
const ENC_KEY = loadEncryptionKey();

type EncPayloadV1 = {
  v: 1;
  alg: "A256GCM";
  iv: string;  // base64
  tag: string; // base64
  ct: string;  // base64
};

export function encryptApiKey(apiKey: string, aad?: string): string {
  // 12-byte IV is the standard for GCM
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv);
  if (aad) cipher.setAAD(Buffer.from(aad, "utf8"));

  const ciphertext = Buffer.concat([cipher.update(apiKey, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  const payload: EncPayloadV1 = {
    v: 1,
    alg: "A256GCM",
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ct: ciphertext.toString("base64"),
  };

  return `enc_v1.${Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")}`;
}

export function decryptApiKey(encrypted: string, aad?: string): string {
  const prefix = "enc_v1.";
  if (!encrypted.startsWith(prefix)) throw new Error("Unsupported encrypted format");

  const json = Buffer.from(encrypted.slice(prefix.length), "base64url").toString("utf8");
  const payload = JSON.parse(json) as EncPayloadV1;

  if (payload.v !== 1 || payload.alg !== "A256GCM") {
    throw new Error("Unsupported payload version/algorithm");
  }

  const iv = Buffer.from(payload.iv, "base64");
  const tag = Buffer.from(payload.tag, "base64");
  const ct = Buffer.from(payload.ct, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, iv);
  if (aad) decipher.setAAD(Buffer.from(aad, "utf8"));
  decipher.setAuthTag(tag);

  // If key/tag/aad are wrong or data is tampered, this throws
  const plaintext = Buffer.concat([decipher.update(ct), decipher.final()]);
  return plaintext.toString("utf8");
}

//The reencryption of the existing API keys would be necessary if I ever change the ENCRYPTION_KEY.