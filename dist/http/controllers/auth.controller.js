import { UserService } from "../../domain/user/user.service.js";
import { getEnv } from "../../config.js";
import jwt, {} from "jsonwebtoken";
const JWT_SECRET = getEnv("JWT_SECRET");
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
if (!JWT_SECRET)
    throw new Error("JWT_SECRET is not defined");
export class AuthController {
    userService;
    constructor() {
        this.userService = new UserService();
    }
    async register(c) {
        try {
            const body = await c.req.json();
            const { name, email, password, confirmPassword } = body;
            if (!name || !email || !password || !confirmPassword) {
                return c.json({ error: "All fields are required" }, 400);
            }
            if (password !== confirmPassword) {
                return c.json({ error: "Passwords do not match" }, 400);
            }
            if (password.length < 6) {
                return c.json({ error: "Password must be at least 6 characters" }, 400);
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return c.json({ error: "Invalid email format" }, 400);
            }
            const result = await this.userService.register(name, email, password);
            if (!result.success) {
                return c.json({ error: result.error }, 400);
            }
            const user = await this.userService.getUserById(result.userId);
            if (!user) {
                return c.json({ error: "Failed to create user" }, 500);
            }
            const token = jwt.sign({ userId: user._id?.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            return c.json({
                success: true,
                token,
                user: {
                    id: user._id?.toString(),
                    name: user.name,
                    email: user.email,
                },
            });
        }
        catch (error) {
            console.error("Register error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
    }
    async login(c) {
        try {
            const body = await c.req.json();
            const { email, password } = body;
            if (!email || !password) {
                return c.json({ error: "Email and password are required" }, 400);
            }
            const result = await this.userService.login(email, password);
            if (!result.success || !result.user) {
                return c.json({ error: result.error || "Invalid credentials" }, 401);
            }
            const token = jwt.sign({ userId: result.user._id?.toString(), email: result.user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            return c.json({
                success: true,
                token,
                user: {
                    id: result.user._id?.toString(),
                    name: result.user.name,
                    email: result.user.email,
                },
            });
        }
        catch (error) {
            console.error("Login error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
    }
    async me(c) {
        try {
            const userId = c.get("userId");
            if (!userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }
            const user = await this.userService.getUserById(userId);
            if (!user) {
                return c.json({ error: "User not found" }, 404);
            }
            return c.json({
                user: {
                    id: user._id?.toString(),
                    name: user.name,
                    email: user.email,
                },
            });
        }
        catch (error) {
            console.error("Me error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
    }
}
//# sourceMappingURL=auth.controller.js.map