import jwt from "jsonwebtoken";
import { getEnv } from "../../config.js";
const JWT_SECRET = getEnv("JWT_SECRET");
export async function authMiddleware(c, next) {
    try {
        const authHeader = c.req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return c.json({ error: "Unauthorized - No token provided" }, 401);
        }
        const token = authHeader.slice("Bearer ".length).trim();
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            c.set("userId", decoded.userId);
            c.set("userEmail", decoded.email);
            await next();
        }
        catch (error) {
            return c.json({ error: "Unauthorized - Invalid token" }, 401);
        }
    }
    catch (error) {
        return c.json({ error: "Unauthorized" }, 401);
    }
}
//# sourceMappingURL=jwtAuth.js.map