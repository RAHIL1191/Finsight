// lib/mongodb.ts

import mongoose, { Connection } from "mongoose";
import { env, features } from "./env";

/**
 * Shape of the cached mongoose connection in the Node.js global scope.
 * This prevents creating new connections on every hot reload / lambda invocation.
 */
interface MongooseCache {
    conn: Connection | null;
    promise: Promise<Connection> | null;
}

// Augment the global type so TypeScript knows about global.mongoose.
declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

// Use the existing global cache if present, otherwise initialize a new one.
const globalCache = global.mongoose ?? {
    conn: null,
    promise: null
};

if (!global.mongoose) {
    global.mongoose = globalCache;
}

/**
 * Connect to MongoDB using Mongoose, reusing an existing connection if available.
 * Throws in production if database is disabled (missing MONGODB_URI).
 */
export async function connectToDatabase(): Promise<Connection> {
    if (!features.database || !env.MONGODB_URI) {
        throw new Error(
            "Database is not enabled. Ensure MONGODB_URI is set in the environment."
        );
    }

    // Return existing connection if we already have one.
    if (globalCache.conn) {
        return globalCache.conn;
    }

    // If a connection is already in progress, reuse that promise.
    if (!globalCache.promise) {
        const uri = env.MONGODB_URI;

        // Connection options tuned for API-style usage; adjust as needed.
        const options: Parameters<typeof mongoose.connect>[1] = {
            bufferCommands: false,
            maxPoolSize: 10
        };

        globalCache.promise = mongoose
            .connect(uri, options)
            .then((mongooseInstance) => {
                return mongooseInstance.connection;
            })
            .catch((error) => {
                globalCache.promise = null;
                console.error("❌ Error connecting to MongoDB:", error);
                throw error;
            });
    }

    globalCache.conn = await globalCache.promise;
    return globalCache.conn;
}