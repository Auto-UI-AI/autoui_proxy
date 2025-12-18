import { PolicyService } from "../../domain/policy/policy.service.js";
import { getClientIp } from "../../security/ip.js";
import { rateLimit } from "../middlewares/rateLimit.js";
import { callOpenRouterStream, type ChatRequest } from "../../llm/openaiCompat.js";
import { TokenRepo } from "../../domain/token/token.repo.js";

export class ChatController {
    private policies = new PolicyService();
    private tokenRepo = new TokenRepo();

    async handleChat(req: Request, appId: string, body: ChatRequest, tokenEntity: any) {
        const policy = await this.policies.resolve(appId);
        if (!policy) {
            return { status: 403, json: { error: "Unknown appId" } };
        }

        const ip = getClientIp(req);
        const rlKey = tokenEntity?._id ? `token:${String(tokenEntity._id)}` : `${appId}:${ip}`;

        const rl = rateLimit(rlKey, policy.rateLimitPerMin);

        if (!rl.ok) {
            return {
                status: 429,
                json: { error: "Rate limit exceeded" },
                retryAfter: rl.retryAfterSec,
            };
        }

        if (tokenEntity?._id) {
            await this.tokenRepo.touchLastUsed(tokenEntity._id);
        }

        const messages = [
            {
                role: "system" as const,
                content: [
                    "You are AutoUI assistant.",
                    "Help users discover available UI features and actions.",
                    "Use tools ONLY when appropriate.",
                    "Never invent tool names or arguments.",
                ].join("\n\n"),
            },
            ...body.messages,
        ];

        const llmResponse = await callOpenRouterStream({
            model: policy.model,
            maxTokens: policy.maxTokens,
            temperature: body.temperature ?? policy.temperature,
            messages,
            tools: policy.allowTools ? body.tools ?? [] : [],
        });

        return { status: 200, stream: llmResponse.body };
    }
}
