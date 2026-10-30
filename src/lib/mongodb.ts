import mongoose from 'mongoose';
import dns from 'dns';
import type { MongooseCache } from '@/types/models';

export type { MongooseCache };

// Ensure Node.js resolves MongoDB Atlas SRV records reliably across all Windows/ISP networks
if (typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Ignore if running in a restricted sandbox
  }
}



declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // Graceful fallback when MONGODB_URI is not yet provided in .env
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log('✓ Successfully connected to MongoDB Atlas (Al-Maktabah Cluster)');
      return mongooseInstance;
    }).catch((err) => {
      console.warn('⚠️ MongoDB connection error (falling back to local memory store):', err.message);
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);
}
