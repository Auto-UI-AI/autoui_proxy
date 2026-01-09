import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/jwtAuth.js";

const authRoutes = new Hono();
const authController = new AuthController();

authRoutes.post("/register", (c) => authController.register(c));
authRoutes.post("/login", (c) => authController.login(c));

authRoutes.get("/me", authMiddleware, (c) => authController.me(c));

export { authRoutes };



