import mongoose from 'mongoose';




type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// We cache the connection in development so Next.js hot-reloads don't open thousands of connections
const globalWithMongoose = global as typeof globalThis & {
  mongoose?: MongooseCache;
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

const cached = globalWithMongoose.mongoose;

async function connectMongo() {
  if (cached.conn) {
    return cached.conn
  }


  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {serverSelectionTimeoutMS: 5000 })
    .catch((err) => {
      cached.promise = null //allows the next request to retry;
      throw err;
    });
  }

  cached.conn = await
    cached.promise;
  return cached.conn;
}

export default connectMongo;


/* Old code

const cached = globalThis as typeof globalThis & {
  mongoose?: typeof mongoose;
  promise?: Promise<typeof mongoose>;
if (!cached.mongoose) {
  cached.mongoose = mongoose;
  cached.promise = mongoose.connect(MONGODB_URI, {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
  });
}

export default cached.promise;*/
