import { getEnv } from "./config.js";

type ChatMessage = { role: "system" | "user" | "assistant" | "tool"; content: string };

type ToolSchema = {
    name: string;
    description?: string;
    parameters: any;
};

export type ChatRequest = {
    appId: string;
    sessionId?: string;
    messages: ChatMessage[];
    appDescriptionPrompt?: string;
    tools?: ToolSchema[];
    temperature?: number;
};

export async function callOpenRouterStream(args: {
    model: string;
    maxTokens: number;
    temperature: number;
    messages: ChatMessage[];
    tools?: ToolSchema[];
}) {
    const baseUrl = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
    const apiKey = getEnv("OPENROUTER_API_KEY");

    const body: any = {
        model: args.model,
        messages: args.messages,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
        stream: true,
    };

    if (args.tools?.length) {
        body.tools = args.tools.map((t) => ({
            type: "function",
            function: {
                name: t.name,
                description: t.description ?? "",
                parameters: t.parameters,
            },
        }));
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://autoui.dev",
            "X-Title": "AutoUI Proxy",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(`LLM error ${res.status}: ${text}`);
    }

    return res;
}
