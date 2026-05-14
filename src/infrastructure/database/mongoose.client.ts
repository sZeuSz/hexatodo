import mongoose from 'mongoose';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

export async function connectMongoose(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  logger.info('MongoDB conectado');
}

export async function disconnectMongoose(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB desconectado');
}
