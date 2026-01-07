import { getDb } from "../../db/mongo.js";
import type { AppEntity } from "./app.model.js";

export class AppRepo {
    async create(input: Omit<AppEntity, "_id">) {
        const db = await getDb();
        await db.collection<AppEntity>("apps").insertOne(input as any);
        return input;
    }

    async findByAppId(appId: string) {
        const db = await getDb();
        return db.collection<AppEntity>("apps").findOne({ appId });
    }

    async list() {
        const db = await getDb();
        return db.collection<AppEntity>("apps").find({}).sort({ createdAt: -1 }).toArray();
    }

    async updatePolicy(appId: string, policy: AppEntity["policy"]) {
        const db = await getDb();
        const now = new Date();
        await db
            .collection<AppEntity>("apps")
            .updateOne({ appId }, { $set: { policy, updatedAt: now } });
    }
}
