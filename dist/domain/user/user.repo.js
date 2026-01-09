import { getDb } from "../../db/mongo.js";
import { ObjectId } from "mongodb";
export class UserRepository {
    async getCollection() {
        const db = await getDb();
        return db.collection("users");
    }
    async findByEmail(email) {
        const collection = await this.getCollection();
        return collection.findOne({ email });
    }
    async findById(id) {
        const collection = await this.getCollection();
        return collection.findOne({ _id: new ObjectId(id) });
    }
    async create(user) {
        const collection = await this.getCollection();
        const now = new Date();
        const userEntity = {
            ...user,
            createdAt: now,
            updatedAt: now,
        };
        const result = await collection.insertOne(userEntity);
        return { ...userEntity, _id: result.insertedId };
    }
    async update(id, updates) {
        const collection = await this.getCollection();
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: new Date() } });
    }
}
//# sourceMappingURL=user.repo.js.map