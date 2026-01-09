import { MongoClient, Db } from "mongodb";
import { getEnv } from "../config.js";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
    if (db) return db;

    const uri = getEnv("MONGODB_URI");
    const dbName = getEnv("MONGODB_DB");

    client = new MongoClient(uri, {
        retryWrites: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db(dbName);

    return db;
}

export async function closeDb() {
    await client?.close();
    client = null;
    db = null;
}
