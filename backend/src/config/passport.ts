import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from '../config';
import { findOrCreateUser } from '../services/userService';
import { User } from '../types';
import logger from '../utils/logger';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile);
        return done(null, user);
      } catch (error) {
        logger.error('Google OAuth error:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const { getUserById } = require('../services/userService');
    const user = await getUserById(id);
    done(null, user);
  } catch (error) {
    logger.error('Deserialize user error:', error);
    done(error, null);
  }
});

export default passport;
