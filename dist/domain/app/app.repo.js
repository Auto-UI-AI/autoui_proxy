import { getDb } from "../../db/mongo.js";
import { ObjectId } from "mongodb";
export class AppRepo {
    async create(input) {
        const db = await getDb();
        const result = await db.collection("apps").insertOne(input);
        return { ...input, _id: result.insertedId };
    }
    async findByAppId(appId) {
        const db = await getDb();
        return db.collection("apps").findOne({ appId });
    }
    async findByAppIdAndUserId(appId, userId) {
        const db = await getDb();
        return db.collection("apps").findOne({ appId, userId });
    }
    async findById(id) {
        const db = await getDb();
        return db.collection("apps").findOne({ _id: new ObjectId(id) });
    }
    async list() {
        const db = await getDb();
        return db.collection("apps").find({}).sort({ createdAt: -1 }).toArray();
    }
    async listByUserId(userId) {
        const db = await getDb();
        return db.collection("apps").find({ userId }).sort({ createdAt: -1 }).toArray();
    }
    async updatePolicy(appId, policy) {
        const db = await getDb();
        const now = new Date();
        await db
            .collection("apps")
            .updateOne({ appId }, { $set: { policy, updatedAt: now } });
    }
    async delete(appId) {
        const db = await getDb();
        const result = await db.collection("apps").deleteOne({ appId });
        return result.deletedCount > 0;
    }
}
//# sourceMappingURL=app.repo.js.map