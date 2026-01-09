import bcrypt from "bcrypt";
import { UserRepository } from "./user.repo.js";
export class UserService {
    userRepo;
    constructor() {
        this.userRepo = new UserRepository();
    }
    async register(name, email, password) {
        const existingUser = await this.userRepo.findByEmail(email);
        if (existingUser) {
            return { success: false, error: "User with this email already exists" };
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        try {
            const user = await this.userRepo.create({
                name,
                email,
                password: hashedPassword,
            });
            return { success: true, userId: user._id?.toString() };
        }
        catch (error) {
            return { success: false, error: "Failed to create user" };
        }
    }
    async login(email, password) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            return { success: false, error: "Invalid email or password" };
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return { success: false, error: "Invalid email or password" };
        }
        const { password: _, ...userWithoutPassword } = user;
        return { success: true, user: userWithoutPassword };
    }
    async getUserById(id) {
        return this.userRepo.findById(id);
    }
}
//# sourceMappingURL=user.service.js.map