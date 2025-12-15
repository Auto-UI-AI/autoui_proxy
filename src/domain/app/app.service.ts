import { AppRepo } from "./app.repo.js";
import type { AppEntity } from "./app.model.js";
import { decryptApiKey, encryptApiKey } from "../../security/crypto.js";

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
    async createAppWithYourApiKey(args: { appId: string; name: string; apiKey: string; policy?: AppEntity["policy"] }) {
        const now = new Date();
        let encryptedApiKey = encryptApiKey(args.apiKey);
        const entity: AppEntity = {
            appId: args.appId,
            apiKey: encryptedApiKey,
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
    async decryptApiKey(appId: string) {
            // const tokenHash = decryptApiKey(encryptedApiKey);
            let foundApp = await this.getApp(appId);
            // console.log("foundApp:", foundApp); 

            if(foundApp && foundApp.apiKey) {
                let decryptedApiKey = decryptApiKey(foundApp.apiKey);
                // console.log("decryptedApiKey:", decryptedApiKey);
                return decryptedApiKey;
            }

        }
}
