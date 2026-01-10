import { getDb } from "../../db/mongo.js";
import { ObjectId } from "mongodb";
export class TokenRepo {
    async create(input) {
        const db = await getDb();
        const res = await db.collection("tokens").insertOne(input);
        return { ...input, _id: res.insertedId };
    }
    async listByAppId(appId) {
        const db = await getDb();
        return db
            .collection("tokens")
            .find({ appId, revokedAt: null })
            .sort({ createdAt: -1 })
            .toArray();
    }
    async findActiveByHash(tokenHash) {
        const db = await getDb();
        return db.collection("tokens").findOne({
            tokenHash,
            revokedAt: null,
        });
    }
    async touchLastUsed(id) {
        const db = await getDb();
        await db
            .collection("tokens")
            .updateOne({ _id: id }, { $set: { lastUsedAt: new Date() } });
    }
    async revokeById(id) {
        const db = await getDb();
        await db
            .collection("tokens")
            .updateOne({ _id: new ObjectId(id) }, { $set: { revokedAt: new Date() } });
    }
}
//# sourceMappingURL=token.repo.js.map