import { getDb } from "../../db/mongo.js";
import type { UserEntity } from "./user.model.js";
import { ObjectId } from "mongodb";

export class UserRepository {
    private async getCollection() {
        const db = await getDb();
        return db.collection<UserEntity>("users");
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const collection = await this.getCollection();
        return collection.findOne({ email });
    }

    async findById(id: string): Promise<UserEntity | null> {
        const collection = await this.getCollection();
        return collection.findOne({ _id: new ObjectId(id) });
    }

    async create(user: Omit<UserEntity, "_id" | "createdAt" | "updatedAt">): Promise<UserEntity> {
        const collection = await this.getCollection();
        const now = new Date();
        const userEntity: UserEntity = {
            ...user,
            createdAt: now,
            updatedAt: now,
        };
        const result = await collection.insertOne(userEntity);
        return { ...userEntity, _id: result.insertedId };
    }

    async update(
        id: string,
        updates: Partial<Omit<UserEntity, "_id" | "createdAt">>
    ): Promise<void> {
        const collection = await this.getCollection();
        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updates, updatedAt: new Date() } }
        );
    }
}


