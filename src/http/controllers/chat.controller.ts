import { PolicyService } from "../../domain/policy/policy.service.js";
import { getClientIp } from "../../security/ip.js";
import { rateLimit } from "../middlewares/rateLimit.js";
import { callOpenRouterStream, type ChatRequest } from "../../llm/openaiCompat.js";
import { TokenRepo } from "../../domain/token/token.repo.js";
import { AppService } from "../../domain/app/app.service.js";

export class ChatController {
    private policies = new PolicyService();
    private tokenRepo = new TokenRepo();

    async handleChat(req: Request, body: ChatRequest , tokenEntity: any) {
        const policy = await this.policies.resolve(body.appId);
        if (!policy) return { status: 403, json: { error: "Unknown appId" } };

        const ip = getClientIp(req);
        const rlKey = tokenEntity?._id ? `token:${String(tokenEntity._id)}` : `${body.appId}:${ip}`;
        const rl = rateLimit(rlKey, policy.rateLimitPerMin);

        if (!rl.ok)
            return {
                status: 429,
                json: { error: "Rate limit exceeded" },
                retryAfter: rl.retryAfterSec,
            };

        if (tokenEntity?._id) await this.tokenRepo.touchLastUsed(tokenEntity._id);
        let decryptedApiKey =  await new AppService().decryptApiKey(body.appId);
        console.log("decryptedApiKey in chat.controller:", decryptedApiKey);
        if(!decryptedApiKey) return { status: 404, json: { error: "Error with decrypted key, it has not been found ot not acceptable" } };
        const messages = [
            {
                role: "system" as const,
                content: body.intent!='extraAnalysis' ?[ 
                    "You are AutoUI assistant.",
                    "Help users discover available UI features and actions.",
                    "Use tools ONLY when appropriate.",
                    "Never invent tool names or arguments."
                ].join("\n\n"):[ 
                    "You are AutoUI assistant.",
                    "Help analyze passed inside data",
                    "Do not use or suggest any tools.",
                    "Focus on providing the data in a properly structured format which aligns with the needs."
                ].join("\n\n"),
            },
            ...body.messages,
        ];

        const llmResponse = await callOpenRouterStream({
            decryptedApiKey: decryptedApiKey,
            model: policy.model,
            maxTokens: policy.maxTokens,
            temperature: body.temperature ?? policy.temperature,
            messages,
            tools: policy.allowTools ? body.tools ?? [] : [],
        });
        if (!llmResponse.body) {
            return { status: 500, json: { error: "LLM service error" } };
        }
        return { status: 200, stream: llmResponse.body };
    }
}
