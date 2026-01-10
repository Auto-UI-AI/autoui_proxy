import { TokenRepo } from "./token.repo.js";
import { generateToken, hashToken } from "../../security/crypto.js";
export class TokenService {
    repo;
    constructor(repo = new TokenRepo()) {
        this.repo = repo;
    }
    async issueToken(args) {
        const token = generateToken();
        const tokenHash = hashToken(token);
        const entity = {
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
    async listTokens(appId) {
        const items = await this.repo.listByAppId(appId);
        return items.map((t) => ({
            id: String(t._id),
            label: t.label,
            createdAt: t.createdAt,
            lastUsedAt: t.lastUsedAt ?? null,
        }));
    }
    async revokeToken(tokenId) {
        await this.repo.revokeById(tokenId);
    }
    async verifyToken(rawToken) {
        const tokenHash = hashToken(rawToken);
        return this.repo.findActiveByHash(tokenHash);
    }
}
//# sourceMappingURL=token.service.js.map