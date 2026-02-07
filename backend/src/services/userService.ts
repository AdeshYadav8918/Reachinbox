import { getDbPool } from '../db/connection';
import { User } from '../types';
import logger from '../utils/logger';

export const findOrCreateUser = async (profile: {
  id: string;
  emails: { value: string }[];
  displayName: string;
  photos?: { value: string }[];
}): Promise<User> => {
  const pool = getDbPool();

  try {
    const googleId = profile.id;
    const email = profile.emails[0].value;
    const name = profile.displayName;
    const avatar = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

    // Check if user exists
    const [existingUsers] = await pool.query<any[]>(
      'SELECT * FROM users WHERE google_id = ?',
      [googleId]
    );

    if (existingUsers.length > 0) {
      // Update user info
      await pool.query(
        'UPDATE users SET email = ?, name = ?, avatar = ?, updated_at = NOW() WHERE google_id = ?',
        [email, name, avatar, googleId]
      );

      const [updatedUsers] = await pool.query<any[]>(
        'SELECT * FROM users WHERE google_id = ?',
        [googleId]
      );

      logger.info(`User updated: ${email}`);
      return updatedUsers[0];
    } else {
      // Create new user
      const [result] = await pool.query<any>(
        'INSERT INTO users (google_id, email, name, avatar) VALUES (?, ?, ?, ?)',
        [googleId, email, name, avatar]
      );

      const [newUsers] = await pool.query<any[]>(
        'SELECT * FROM users WHERE id = ?',
        [result.insertId]
      );

      logger.info(`User created: ${email}`);
      return newUsers[0];
    }
  } catch (error) {
    logger.error('Error in findOrCreateUser:', error);
    throw error;
  }
};

export const getUserById = async (userId: number): Promise<User | null> => {
  const pool = getDbPool();

  try {
    const [users] = await pool.query<any[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    return users.length > 0 ? users[0] : null;
  } catch (error) {
    logger.error('Error in getUserById:', error);
    throw error;
  }
};
