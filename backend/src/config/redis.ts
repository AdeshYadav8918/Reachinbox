import Redis from 'ioredis';
import { config } from '../config';
import logger from '../utils/logger';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });
  }

  return redisClient;
};

export const closeRedisClient = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis client closed');
  }
};

// Redis key generators
export const getRateLimitKey = (userId: number, hourWindow: string): string => {
  return `rate_limit:user:${userId}:hour:${hourWindow}`;
};

export const getProcessingKey = (emailId: number): string => {
  return `processing:email:${emailId}`;
};
