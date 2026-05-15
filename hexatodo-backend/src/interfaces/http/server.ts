import {
  connectMongoose,
  disconnectMongoose,
} from '@infrastructure/database/mongoose/mongoose.client.js';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { app } from './app.js';

const redis = new RedisCacheService();

async function bootstrap(): Promise<void> {
  await connectMongoose();
  await redis.connect();

  const server = app.listen(env.PORT, () => {
    logger.info(`Servidor rodando na porta ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} recebido — encerrando servidor`);
    server.close(async () => {
      await disconnectMongoose();
      await redis.disconnect();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('unhandledRejection — encerrando processo', { reason });
    process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    logger.error('uncaughtException — encerrando processo', {
      error: err.message,
    });
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.error('Falha ao iniciar o servidor', { error: err });
  process.exit(1);
});
