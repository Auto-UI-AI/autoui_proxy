import "dotenv/config";
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
    "financial-demo": {
        model: "openai/gpt-4.1-mini",
        maxTokens: 1024,
        temperature: 0.2,
        allowTools: true,
        rateLimitPerMin: 120,
    },
    "tasks-demo": {
        model: "openai/gpt-4.1-mini",
        maxTokens: 1024,
        temperature: 0.2,
        allowTools: true,
        rateLimitPerMin: 120,
    },
};

export type FreeAIModel = {
    id: string;
    name: string;
    provider: string;
    model: string;
    maxTokens: number;
    description?: string;
};

export const FREE_AI_MODELS: FreeAIModel[] = [
    {
        id: "tng-r1t-chimera",
        name: "TNG R1T Chimera",
        provider: "OpenRouter",
        model: "tngtech/tng-r1t-chimera:free",
        maxTokens: 8192,
        description: "High-quality free model from TNG Tech",
    },
    {
        id: "amazon-nova-2-lite",
        name: "Amazon Nova 2 Lite",
        provider: "OpenRouter",
        model: "amazon/nova-2-lite-v1:free",
        maxTokens: 8192,
        description: "Amazon's efficient Nova 2 Lite model",
    },
    {
        id: "openai-gpt-5-chat",
        name: "GPT-5 Chat",
        provider: "OpenRouter",
        model: "openai/gpt-5-chat",
        maxTokens: 16384,
        description: "Latest GPT-5 model from OpenAI",
    },
    {
        id: "kat-coder-pro",
        name: "Kat Coder Pro",
        provider: "OpenRouter",
        model: "kwaipilot/kat-coder-pro:free",
        maxTokens: 8192,
        description: "Free coding-focused model from KwaiPilot",
    },
];

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
