import { getEnv } from "../config.js";
export async function callOpenRouterStream(args) {
    const baseUrl = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
    const apiKey = args.apiKey;
    const body = {
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
export async function callOpenRouterJson(args) {
    const baseUrl = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
    const apiKey = args.apiKey || getEnv("OPENROUTER_API_KEY");
    const body = {
        model: args.model,
        messages: args.messages,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
        stream: false,
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
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`LLM error ${res.status}: ${text}`);
    }
    return res.json();
}
//# sourceMappingURL=openaiCompat.js.map