import { APP_POLICIES } from "../../config.js";
import { AppRepo } from "../app/app.repo.js";
import { decryptApiKey } from "../../security/crypto.js";
export class PolicyService {
    apps;
    constructor(apps = new AppRepo()) {
        this.apps = apps;
    }
    async resolve(appId) {
        const base = APP_POLICIES[appId];
        const app = await this.apps.findByAppId(appId);
        if (!base && !app)
            return null;
        let decryptedApiKey;
        if (app?.openRouterApiKey) {
            try {
                decryptedApiKey = decryptApiKey(app.openRouterApiKey);
            }
            catch (error) {
                console.error("Failed to decrypt API key:", error);
            }
        }
        const merged = {
            model: base?.model ?? app?.policy?.model ?? "openai/gpt-4.1-mini",
            maxTokens: base?.maxTokens ?? app?.policy?.maxTokens ?? 1024,
            temperature: base?.temperature ?? app?.policy?.temperature ?? 0.2,
            allowTools: base?.allowTools ?? app?.policy?.allowTools ?? true,
            rateLimitPerMin: base?.rateLimitPerMin ?? app?.policy?.rateLimitPerMin ?? 60,
            openRouterApiKey: decryptedApiKey,
        };
        return merged;
    }
}
//# sourceMappingURL=policy.service.js.map