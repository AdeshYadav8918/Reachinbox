import mysql from 'mysql2/promise';
import { config } from '../config';
import logger from '../utils/logger';

let pool: mysql.Pool | null = null;

export const getDbPool = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    logger.info('Database pool created');
  }

  return pool;
};

export const testDbConnection = async (): Promise<boolean> => {
  try {
    const pool = getDbPool();
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
};

export const closeDbPool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    logger.info('Database pool closed');
  }
};
