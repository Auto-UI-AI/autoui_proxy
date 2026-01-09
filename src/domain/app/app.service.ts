import { AppRepo } from "./app.repo.js";
import type { AppEntity } from "./app.model.js";
import { generateSharedSecret, encryptApiKey } from "../../security/crypto.js";

export class AppService {
    constructor(private repo = new AppRepo()) {}

    async createApp(args: {
        appId: string;
        name: string;
        userId: string;
        openRouterApiKey?: string;
        policy?: AppEntity["policy"];
    }) {
      
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
        const entity: AppEntity = {
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

    async getApp(appId: string) {
        return this.repo.findByAppId(appId);
    }

    async getAppByUser(appId: string, userId: string) {
        return this.repo.findByAppIdAndUserId(appId, userId);
    }

    async listApps() {
        return this.repo.list();
    }

    async listAppsByUser(userId: string) {
        return this.repo.listByUserId(userId);
    }

    async deleteApp(appId: string, userId: string) {
        const app = await this.repo.findByAppIdAndUserId(appId, userId);
        if (!app) {
            throw new Error("App not found or access denied");
        }
        return this.repo.delete(appId);
    }
}
