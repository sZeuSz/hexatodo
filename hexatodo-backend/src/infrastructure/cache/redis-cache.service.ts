import type { CacheService } from '@domain/ports/services/cache.service.js';
import { Redis } from 'ioredis';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

export class RedisCacheService implements CacheService {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => logger.info('Redis conectado'));
    this.client.on('error', (err: Error) =>
      logger.error('Redis erro', { error: err.message }),
    );
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
    logger.info('Redis desconectado');
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) await this.client.del(...keys);
  }
}
