import { getEnv } from "../config.js";

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
    intent?: string;
};

export async function callOpenRouterStream(args: {
    model: string;
    maxTokens: number;
    temperature: number;
    messages: ChatMessage[];
    decryptedApiKey?: string;
    tools?: ToolSchema[];
}) {
    const baseUrl = process.env.OPENROUTER_BASE_URL;
    const apiKey = args.decryptedApiKey;

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
console.log("🔥 OpenRouter CALL", {
  baseUrl,
  model: args.model,
  maxTokens: args.maxTokens,
  temperature: args.temperature,
});
    const res = await fetch(`${baseUrl}`, {
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
        throw new Error(`LLM error ${JSON.stringify(res)} ${res.status}: ${text}`);
    }

    return res;
}
