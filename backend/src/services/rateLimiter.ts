import { getRedisClient, getRateLimitKey } from '../config/redis';
import { getDbPool } from '../db/connection';
import { config } from '../config';
import logger from '../utils/logger';

/**
 * Get the current hour window as a string (e.g., "2024-01-15T10:00:00")
 */
export const getCurrentHourWindow = (date: Date = new Date()): string => {
  const hourWindow = new Date(date);
  hourWindow.setMinutes(0, 0, 0);
  return hourWindow.toISOString();
};

/**
 * Check if user can send an email within rate limit
 * Returns true if allowed, false if rate limit exceeded
 */
export const checkRateLimit = async (userId: number): Promise<boolean> => {
  const redis = getRedisClient();
  const hourWindow = getCurrentHourWindow();
  const key = getRateLimitKey(userId, hourWindow);

  try {
    // Get current count from Redis
    const currentCount = await redis.get(key);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    // Check against limit
    if (count >= config.rateLimiting.maxEmailsPerHour) {
      logger.warn(`Rate limit exceeded for user ${userId} in window ${hourWindow}`);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error checking rate limit:', error);
    // In case of error, allow the email to prevent system deadlock
    return true;
  }
};

/**
 * Increment the rate limit counter for a user
 */
export const incrementRateLimit = async (userId: number): Promise<number> => {
  const redis = getRedisClient();
  const pool = getDbPool();
  const hourWindow = getCurrentHourWindow();
  const key = getRateLimitKey(userId, hourWindow);

  try {
    // Increment Redis counter
    const newCount = await redis.incr(key);

    // Set expiration to 2 hours (to clean up old keys)
    if (newCount === 1) {
      await redis.expire(key, 7200); // 2 hours in seconds
    }

    // Also update database for persistence
    await pool.query(
      `INSERT INTO rate_limit_tracking (user_id, hour_window, email_count)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE email_count = email_count + 1`,
      [userId, hourWindow]
    );

    logger.info(`Rate limit incremented for user ${userId}: ${newCount}/${config.rateLimiting.maxEmailsPerHour}`);
    return newCount;
  } catch (error) {
    logger.error('Error incrementing rate limit:', error);
    throw error;
  }
};

/**
 * Get current rate limit count for a user
 */
export const getRateLimitCount = async (userId: number): Promise<number> => {
  const redis = getRedisClient();
  const hourWindow = getCurrentHourWindow();
  const key = getRateLimitKey(userId, hourWindow);

  try {
    const count = await redis.get(key);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    logger.error('Error getting rate limit count:', error);
    return 0;
  }
};

/**
 * Calculate when the next email can be sent based on rate limiting
 * Returns the timestamp when an email slot will be available
 */
export const getNextAvailableSlot = async (userId: number): Promise<Date> => {
  const currentCount = await getRateLimitCount(userId);
  
  if (currentCount < config.rateLimiting.maxEmailsPerHour) {
    // Can send now
    return new Date();
  }

  // Need to wait until next hour
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1);
  nextHour.setMinutes(0, 0, 0);

  return nextHour;
};

/**
 * Initialize rate limit tracking from database on server restart
 */
export const initializeRateLimitFromDb = async (): Promise<void> => {
  const pool = getDbPool();
  const redis = getRedisClient();
  const hourWindow = getCurrentHourWindow();

  try {
    const [rows] = await pool.query<any[]>(
      `SELECT user_id, email_count FROM rate_limit_tracking WHERE hour_window = ?`,
      [hourWindow]
    );

    for (const row of rows) {
      const key = getRateLimitKey(row.user_id, hourWindow);
      await redis.set(key, row.email_count.toString(), 'EX', 7200);
    }

    logger.info(`Initialized rate limiting from database: ${rows.length} entries`);
  } catch (error) {
    logger.error('Error initializing rate limit from database:', error);
  }
};
