import bcrypt from "bcrypt";
import { UserRepository } from "./user.repo.js";
import type { UserEntity } from "./user.model.js";

export class UserService {
    private userRepo: UserRepository;

    constructor() {
        this.userRepo = new UserRepository();
    }

    async register(
        name: string,
        email: string,
        password: string
    ): Promise<{ success: boolean; userId?: string; error?: string }> {
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
        } catch (error) {
            return { success: false, error: "Failed to create user" };
        }
    }

    async login(
        email: string,
        password: string
    ): Promise<{ success: boolean; user?: Omit<UserEntity, "password">; error?: string }> {
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

    async getUserById(id: string): Promise<UserEntity | null> {
        return this.userRepo.findById(id);
    }
}


