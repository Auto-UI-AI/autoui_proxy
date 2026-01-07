import { TokenService } from "../../domain/token/token.service.js";
import { verifySharedSecret } from "../../security/sharedSecret.js";

export async function authAppAccess(req: Request, bodyAppId?: string) {
    const auth = req.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) {
        const token = auth.slice("Bearer ".length).trim();
        const tokenSvc = new TokenService();
        const tokenEntity = await tokenSvc.verifyToken(token);

        if (!tokenEntity) return { ok: false as const, reason: "Unauthorized" };

        if (bodyAppId && tokenEntity.appId !== bodyAppId) {
            return { ok: false as const, reason: "Token appId mismatch" };
        }

        return { ok: true as const, tokenEntity };
    }
    if (verifySharedSecret(req)) {
        return { ok: true as const, tokenEntity: null };
    }

    return { ok: false as const, reason: "Unauthorized" };
}
