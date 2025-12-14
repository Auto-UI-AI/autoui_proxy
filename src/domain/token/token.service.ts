import { TokenRepo } from "./token.repo.js";
import { generateToken, hashToken } from "../../security/crypto.js";
import type { TokenEntity } from "./token.model.js";

export class TokenService {
    constructor(private repo = new TokenRepo()) {}

    async issueToken(args: { appId: string; label?: string }) {
        const token = generateToken();
        const tokenHash = hashToken(token);

        const entity: Omit<TokenEntity, "_id"> = {
            appId: args.appId,
            label: args.label,
            tokenHash,
            createdAt: new Date(),
            lastUsedAt: null,
            revokedAt: null,
        };

        const created = await this.repo.create(entity);
        return {
            token,
            tokenId: String(created._id),
        };
    }

    async listTokens(appId: string) {
        const items = await this.repo.listByAppId(appId);
        return items.map((t) => ({
            id: String(t._id),
            label: t.label,
            createdAt: t.createdAt,
            lastUsedAt: t.lastUsedAt ?? null,
        }));
    }

    async revokeToken(tokenId: string) {
        await this.repo.revokeById(tokenId);
    }

    async verifyToken(rawToken: string) {
        const tokenHash = hashToken(rawToken);
        return this.repo.findActiveByHash(tokenHash);
    }
}
