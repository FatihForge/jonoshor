import mongoose from 'mongoose';
import dns from 'dns';
import { ENV } from './env.js';
import { logger } from './logging.js';

// Configure public DNS resolvers for MongoDB Atlas SRV lookup (resolves querySrv in containerized environments)
if (ENV.MONGODB_URI.startsWith('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    logger.info('Applied DNS fallback resolver (8.8.8.8, 1.1.1.1) for MongoDB Atlas SRV lookup');
  } catch (err) {
    logger.warn('Failed to configure custom DNS servers, using system default:', err.message);
  }
}

export async function connectDatabase() {
  try {
    const options = {
      dbName: ENV.MONGODB_DB_NAME,
      autoIndex: ENV.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connection established successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection disconnected');
    });

    await mongoose.connect(ENV.MONGODB_URI, options);
    return mongoose.connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected cleanly');
  } catch (error) {
    logger.error('Error during MongoDB disconnect:', error.message);
  }
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
