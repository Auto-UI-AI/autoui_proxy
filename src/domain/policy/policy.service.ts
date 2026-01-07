import { APP_POLICIES } from "../../config.js";
import { AppRepo } from "../app/app.repo.js";

export type ResolvedPolicy = {
    model: string;
    maxTokens: number;
    temperature: number;
    allowTools: boolean;
    rateLimitPerMin: number;
};

export class PolicyService {
    constructor(private apps = new AppRepo()) {}

    async resolve(appId: string): Promise<ResolvedPolicy | null> {
        const base = APP_POLICIES[appId];
        const app = await this.apps.findByAppId(appId);

        if (!base && !app) return null;

        const merged: ResolvedPolicy = {
            model: base?.model ?? app?.policy?.model ?? "openai/chatgpt-4o-latest",
            maxTokens: base?.maxTokens ?? app?.policy?.maxTokens ?? 1024,
            temperature: base?.temperature ?? app?.policy?.temperature ?? 0.2,
            allowTools: base?.allowTools ?? app?.policy?.allowTools ?? true,
            rateLimitPerMin: base?.rateLimitPerMin ?? app?.policy?.rateLimitPerMin ?? 60,
        };

        return merged;
    }
}
