import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/** Reset the connection cache so the next call retries from scratch. */
function resetCache() {
  cached.conn = null;
  cached.promise = null;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  // Reuse only a fully-connected socket — readyState 1 === connected
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  // If the connection dropped (state 0=disconnected, 3=disconnecting), reset so we retry
  if (cached.conn && cached.conn.connection.readyState !== 2 /* connecting */) {
    resetCache();
  }

  let MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    return null;
  }
  if (!MONGODB_URI.includes("readPreference")) {
    MONGODB_URI += (MONGODB_URI.includes("?") ? "&" : "?") + "readPreference=primaryPreferred";
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 20000,
      readPreference: "primaryPreferred" as any,
      heartbeatFrequencyMS: 10_000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log(`[MongoDB] Connected: ${m.connection.name}`);
        return m;
      })
      .catch((err) => {
        console.warn("[MongoDB] Unavailable — falling back to seed data:", err.message);
        resetCache();
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch {
    resetCache();
  }

  return cached.conn;
}

/**
 * Race a Mongoose query promise against a hard wall-clock deadline.
 * If the query doesn't resolve in `ms` milliseconds, resolves to `fallback` instead.
 *
 * Usage:
 *   const docs = await withDbTimeout(BusinessModel.find({}).lean(), [], 15000);
 */
export async function withDbTimeout<T>(
  queryPromise: Promise<T>,
  fallback: T,
  ms = 15000
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`[MongoDB] Query exceeded ${ms}ms deadline — using fallback`);
      resolve(fallback);
    }, ms);
  });
  try {
    const result = await Promise.race([queryPromise, timeout]);
    clearTimeout(timer!);
    return result;
  } catch {
    clearTimeout(timer!);
    return fallback;
  }
}

