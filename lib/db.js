import mongoose from "mongoose";

if (!process.env.MONGO_URI) {
  try {
    process.loadEnvFile?.(".env.local");
  } catch {}
}

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn("⚠️ Warning: MONGO_URI is not set in environment variables.");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  const uri = process.env.MONGO_URI || MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI must be set in the environment variables");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
