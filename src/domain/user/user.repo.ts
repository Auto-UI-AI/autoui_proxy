import { getDb } from "../../db/mongo";
import { decryptUserPassword, encryptUserPassword } from "../../security/userPasswordEncryption";
import type { UserEntity } from "./user.model";


export class UserRepo{
    async signUp(input: Omit<UserEntity, "_id">, password:string){
        const db = await getDb();
        const hashedPassword = encryptUserPassword(password);
        await db.collection<UserEntity>("users").insertOne({...input, password: hashedPassword} as any);
        return input;
        //todo
    }
    async logIn(email: string, password: string){
        const db = await getDb();
        let user =  await db.collection<UserEntity>("users").findOne({email});
        const hashedPassword = user?.passwordHash;
        const unhashedPassword = hashedPassword&&decryptUserPassword(hashedPassword);
        
        if(password===unhashedPassword){
            return user;
        }
        return null;
    }
    async findById(id: string){
        const db = await getDb();
        return db.collection<UserEntity>("users").findOne({id});
        //todo
    }
}