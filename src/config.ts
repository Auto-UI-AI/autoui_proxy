import "dotenv/config";
export type AppPolicy = {
    model: string;
    maxTokens: number;
    temperature: number;
    allowTools: boolean;
    rateLimitPerMin: number;
};

export const APP_POLICIES: Record<string, AppPolicy> = {
    "tasks-demo4": {
        model: "openai/chatgpt-4o-latest",
        maxTokens: 2048,
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
        .map((s: string) => s.trim())
        .filter(Boolean);
}
