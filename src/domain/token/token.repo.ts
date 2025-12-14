import { getDb } from "../../db/mongo.js";
import type { TokenEntity } from "./token.model.js";
import { ObjectId } from "mongodb";

export class TokenRepo {
    async create(input: Omit<TokenEntity, "_id">) {
        const db = await getDb();
        const res = await db.collection<TokenEntity>("tokens").insertOne(input as any);
        return { ...input, _id: res.insertedId };
    }

    async listByAppId(appId: string) {
        const db = await getDb();
        return db
            .collection<TokenEntity>("tokens")
            .find({ appId, revokedAt: null })
            .sort({ createdAt: -1 })
            .toArray();
    }

    async findActiveByHash(tokenHash: string) {
        const db = await getDb();
        return db.collection<TokenEntity>("tokens").findOne({
            tokenHash,
            revokedAt: null,
        });
    }

    async touchLastUsed(id: ObjectId) {
        const db = await getDb();
        await db
            .collection<TokenEntity>("tokens")
            .updateOne({ _id: id }, { $set: { lastUsedAt: new Date() } });
    }

    async revokeById(id: string) {
        const db = await getDb();
        await db
            .collection<TokenEntity>("tokens")
            .updateOne({ _id: new ObjectId(id) }, { $set: { revokedAt: new Date() } });
    }
}
