import { PolicyService } from "../../domain/policy/policy.service.js";
import { getClientIp } from "../../security/ip.js";
import { rateLimit } from "../middlewares/rateLimit.js";
import { callOpenRouterStream, callOpenRouterJson, } from "../../llm/openaiCompat.js";
import { TokenRepo } from "../../domain/token/token.repo.js";
export class ChatController {
    policies = new PolicyService();
    tokenRepo = new TokenRepo();
    async handleChat(req, appId, body, tokenEntity) {
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
                role: "system",
                content: [
                    "You are AutoUI assistant.",
                    "Help users discover available UI features and actions.",
                    "Use tools ONLY when appropriate.",
                    "Never invent tool names or arguments.",
                ].join("\n\n"),
            },
            ...body.messages,
        ];
        console.log(policy);
        const llmResponse = await callOpenRouterStream({
            model: policy.model,
            maxTokens: policy.maxTokens,
            temperature: body.temperature ?? policy.temperature,
            messages,
            tools: [],
            apiKey: policy.openRouterApiKey,
        });
        return { status: 200, stream: llmResponse.body };
    }
    async handleExtraAnalysis(req, appId, body, tokenEntity) {
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
        const temperature = body.temperature ?? policy.temperature;
        try {
            const llmResponse = await callOpenRouterJson({
                model: policy.model,
                maxTokens: policy.maxTokens,
                temperature,
                messages: body.messages,
                tools: [], // No tools for extra analysis
                apiKey: policy.openRouterApiKey,
            });
            // Extract the content from the response
            const content = llmResponse.choices?.[0]?.message?.content;
            if (!content) {
                return {
                    status: 500,
                    json: { error: "No content in LLM response" },
                };
            }
            // Try to parse as JSON if possible, otherwise return as string
            let parsedContent;
            try {
                parsedContent = JSON.parse(content);
            }
            catch {
                parsedContent = content;
            }
            return {
                status: 200,
                json: parsedContent,
            };
        }
        catch (error) {
            console.error("Extra analysis error:", error);
            return {
                status: 500,
                json: { error: error.message || "Failed to process extra analysis" },
            };
        }
    }
}
//# sourceMappingURL=chat.controller.js.map