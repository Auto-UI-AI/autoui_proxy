import { AppRepo } from "./app.repo.js";
import type { AppEntity } from "./app.model.js";

export class AppService {
    constructor(private repo = new AppRepo()) {}

    async createApp(args: { appId: string; name: string; policy?: AppEntity["policy"] }) {
        const now = new Date();
        const entity: AppEntity = {
            appId: args.appId,
            name: args.name,
            policy: args.policy,
            createdAt: now,
            updatedAt: now,
        };
        return this.repo.create(entity);
    }

    async getApp(appId: string) {
        return this.repo.findByAppId(appId);
    }

    async listApps() {
        return this.repo.list();
    }
}
