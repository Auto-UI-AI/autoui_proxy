import type { Context } from "hono";
import { AppService } from "../../domain/app/app.service.js";
import { TokenService } from "../../domain/token/token.service.js";

export class UiController {
    private apps = new AppService();
    private tokens = new TokenService();

    async listApps(c: Context) {
        const userId = c.get("userId") as string | undefined;
        if (!userId) {
            return { error: "Unauthorized" };
        }
        const items = await this.apps.listAppsByUser(userId);
        return items.map((a) => ({
            id: a._id?.toString(),
            appId: a.appId,
            name: a.name,
            policy: a.policy,
            createdAt: a.createdAt,
        }));
    }

    async createApp(
        c: Context,
        body: {
            appId?: string;
            name: string;
            openRouterApiKey: string;
            model?: string;
            primaryModel?: string;
            policy?: any;
        }
    ) {
        const userId = c.get("userId") as string | undefined;
        if (!userId) {
            return { error: "Unauthorized" };
        }

        try {
            let appId = body.appId;
            if (!appId) {
                appId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            }

            let policy = body.policy;
            if (body.model) {
                policy = {
                    ...policy,
                    model: body.model,
                    primaryModel: body.primaryModel || body.model,
                    maxTokens: policy?.maxTokens ?? 2048,
                    temperature: policy?.temperature ?? 0.2,
                    allowTools: policy?.allowTools ?? true,
                    rateLimitPerMin: policy?.rateLimitPerMin ?? 60,
                };
            }

            const created = await this.apps.createApp({
                appId,
                name: body.name,
                userId,
                openRouterApiKey: body.openRouterApiKey,
                policy,
            });
            return {
                appId: created.appId,
                name: created.name,
                policy: created.policy,
                sharedSecret: created.sharedSecret, 
            };
        } catch (error: any) {
            return { error: error.message || "Failed to create app" };
        }
    }

    async getSharedSecret(c: Context, appId: string) {
        const userId = c.get("userId") as string | undefined;
        if (!userId) {
            return { error: "Unauthorized" };
        }

        const app = await this.apps.getAppByUser(appId, userId);
        if (!app) {
            return { error: "App not found" };
        }

        return { sharedSecret: app.sharedSecret };
    }

    async deleteApp(c: Context, appId: string) {
        const userId = c.get("userId") as string | undefined;
        if (!userId) {
            return { error: "Unauthorized" };
        }

        try {
            await this.apps.deleteApp(appId, userId);
            return { success: true };
        } catch (error: any) {
            return { error: error.message || "Failed to delete app" };
        }
    }

    async listTokens(c: Context, appId: string) {
        const userId = c.get("userId") as string | undefined;
        if (!userId) {
            return { error: "Unauthorized" };
        }

        const app = await this.apps.getAppByUser(appId, userId);
        if (!app) {
            return { error: "App not found" };
        }

        return { items: await this.tokens.listTokens(appId) };
    }

    async createToken(c: Context, body: { appId: string; label?: string }) {
        const userId = c.get("userId") as string | undefined;
        if (!userId) {
            return { error: "Unauthorized" };
        }

        const app = await this.apps.getAppByUser(body.appId, userId);
        if (!app) {
            return { error: "App not found" };
        }

        return await this.tokens.issueToken(body);
    }

    async revokeToken(c: Context, tokenId: string) {
        const userId = c.get("userId") as string | undefined;
        if (!userId) {
            return { error: "Unauthorized" };
        }

        await this.tokens.revokeToken(tokenId);
        return { ok: true };
    }
}
