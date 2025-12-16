import { AppRepo } from "../app/app.repo";
import type { UserEntity } from "./user.model";
import { UserRepo } from "./user.repo";


export class UserService {
    constructor(private repo = new UserRepo()) {}
    async signUp(args:{email: string, password: string}) {
        const now = new Date();
        const entity: UserEntity = {
            displayName: args.email.split("@")[0],
            email: args.email.toLowerCase(),
            status: "active",
            createdAt: now,
            updatedAt: now,
        };
       return this.repo.signUp(entity, args.password);
    }
    async logIn(args:{email: string, password: string}) {
        return this.repo.logIn(args.email.toLowerCase(), args.password);
    }
}