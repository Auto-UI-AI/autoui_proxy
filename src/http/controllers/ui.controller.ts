import { AppService } from "../../domain/app/app.service.js";
import { TokenService } from "../../domain/token/token.service.js";

export class UiController {
    private apps = new AppService();
    private tokens = new TokenService();
    
    async listApps() {
        const items = await this.apps.listApps();
        return items.map((a) => ({ appId: a.appId, name: a.name, policy: a.policy }));
    }

    async createApp(body: { appId: string; name: string; policy?: any }) {
        const created = await this.apps.createApp(body);
        return { appId: created.appId, name: created.name };
    }
    async createAppWithYourApiKey(body: { appId: string; name: string; apiKey: string; policy?: any }) {
        const created = await this.apps.createAppWithYourApiKey(body);
        return { appId: created.appId, name: created.name};
    }
    async listTokens(appId: string) {
        return { items: await this.tokens.listTokens(appId) };
    }

    async createToken(body: { appId: string; apiKey?:string; label?: string }) {
        return await this.tokens.issueToken(body);
    }   
      async createTokenWithApiKey(body: { appId: string; apiKey?:string; label?: string }) {
        return await this.tokens.issueToken(body);
    }

    async revokeToken(tokenId: string) {
        await this.tokens.revokeToken(tokenId);
        return { ok: true };
    }
}
