import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * NextJS can suck my fucking balls
 */
async function dbConnectServerAction() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false, dbName: process.env.MONGODB_DB_NAME };

    const MONGODB_HOST = process.env.NODE_ENV == "development" ? "localhost" : "mongo"

    const MONGODB_URL = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${MONGODB_HOST}:${process.env.MONGODB_HOST_PORT}`
    console.log(`MONGODB_URL: mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:**************@${MONGODB_HOST}:${process.env.MONGODB_HOST_PORT}`)

    cached.promise = mongoose.connect(MONGODB_URL, opts).then((mongooseInstance) => {
      console.log('Mongoose connected!');
      return mongooseInstance;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnectServerAction;
