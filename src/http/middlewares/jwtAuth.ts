import type{ Context, Next } from "hono";
import jwt from "jsonwebtoken";
import { getEnv } from "../../config.js";

const JWT_SECRET = getEnv("JWT_SECRET");

export async function authMiddleware(c: Context, next: Next) {
    try {
        const authHeader = c.req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return c.json({ error: "Unauthorized - No token provided" }, 401);
        }

        const token = authHeader.slice("Bearer ".length).trim();

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
            c.set("userId", decoded.userId);
            c.set("userEmail", decoded.email);
            await next();
        } catch (error) {
            return c.json({ error: "Unauthorized - Invalid token" }, 401);
        }
    } catch (error) {
        return c.json({ error: "Unauthorized" }, 401);
    }
}



