import { getDb } from "../../db/mongo.js";
import type { AppEntity } from "./app.model.js";
import { ObjectId } from "mongodb";

export class AppRepo {
    async create(input: Omit<AppEntity, "_id">) {
        const db = await getDb();
        const result = await db.collection<AppEntity>("apps").insertOne(input as any);
        return { ...input, _id: result.insertedId };
    }

    async findByAppId(appId: string) {
        const db = await getDb();
        return db.collection<AppEntity>("apps").findOne({ appId });
    }

    async findByAppIdAndUserId(appId: string, userId: string) {
        const db = await getDb();
        return db.collection<AppEntity>("apps").findOne({ appId, userId });
    }

    async findById(id: string) {
        const db = await getDb();
        return db.collection<AppEntity>("apps").findOne({ _id: new ObjectId(id) });
    }

    async list() {
        const db = await getDb();
        return db.collection<AppEntity>("apps").find({}).sort({ createdAt: -1 }).toArray();
    }

    async listByUserId(userId: string) {
        const db = await getDb();
        return db.collection<AppEntity>("apps").find({ userId }).sort({ createdAt: -1 }).toArray();
    }

    async updatePolicy(appId: string, policy: AppEntity["policy"]) {
        const db = await getDb();
        const now = new Date();
        await db
            .collection<AppEntity>("apps")
            .updateOne({ appId }, { $set: { policy, updatedAt: now } });
    }

    async delete(appId: string) {
        const db = await getDb();
        const result = await db.collection<AppEntity>("apps").deleteOne({ appId });
        return result.deletedCount > 0;
    }
}
