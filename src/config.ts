export type AppPolicy = {
    model: string;
    maxTokens: number;
    temperature: number;
    allowTools: boolean;
    rateLimitPerMin: number;
};

export const APP_POLICIES: Record<string, AppPolicy> = {
    "ecommerce-demo": {
        model: "openai/gpt-4o-mini",
        maxTokens: 2048,
        temperature: 0.2,
        allowTools: true,
        rateLimitPerMin: 60,
    },
    "prod-app": {
        model: "openai/gpt-4.1-mini",
        maxTokens: 1024,
        temperature: 0.2,
        allowTools: true,
        rateLimitPerMin: 120,
    },
};

export function getEnv(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env: ${name}`);
    return v;
}

export function parseOrigins(): string[] {
    const raw = process.env.CORS_ORIGINS ?? "";
    return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}
