import { getDb } from "./mongo.js";

export async function ensureIndexes() {
    const db = await getDb();

    await db.collection("apps").createIndex({ appId: 1 }, { unique: true });
    await db.collection("tokens").createIndex({ appId: 1 });
    await db.collection("tokens").createIndex({ tokenHash: 1 }, { unique: true });
    await db.collection("tokens").createIndex({ revokedAt: 1 });
}
