import { AppRepo } from "./app.repo.js";
import { generateSharedSecret, encryptApiKey } from "../../security/crypto.js";
export class AppService {
    repo;
    constructor(repo = new AppRepo()) {
        this.repo = repo;
    }
    async createApp(args) {
        const existing = await this.repo.findByAppIdAndUserId(args.appId, args.userId);
        if (existing) {
            throw new Error("App with this ID already exists for this user");
        }
        const existingGlobal = await this.repo.findByAppId(args.appId);
        if (existingGlobal) {
            throw new Error("App with this ID already exists");
        }
        const sharedSecret = generateSharedSecret();
        const encryptedApiKey = args.openRouterApiKey ? encryptApiKey(args.openRouterApiKey) : undefined;
        const now = new Date();
        const entity = {
            appId: args.appId,
            name: args.name,
            userId: args.userId,
            openRouterApiKey: encryptedApiKey,
            sharedSecret,
            policy: args.policy,
            createdAt: now,
            updatedAt: now,
        };
        return this.repo.create(entity);
    }
    async getApp(appId) {
        return this.repo.findByAppId(appId);
    }
    async getAppByUser(appId, userId) {
        return this.repo.findByAppIdAndUserId(appId, userId);
    }
    async listApps() {
        return this.repo.list();
    }
    async listAppsByUser(userId) {
        return this.repo.listByUserId(userId);
    }
    async deleteApp(appId, userId) {
        const app = await this.repo.findByAppIdAndUserId(appId, userId);
        if (!app) {
            throw new Error("App not found or access denied");
        }
        return this.repo.delete(appId);
    }
}
//# sourceMappingURL=app.service.js.map