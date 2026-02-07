import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import { config } from './config';
import logger from './utils/logger';
import { testDbConnection } from './db/connection';
import { runMigrations } from './db/migrate';
import { verifyEmailConnection } from './services/emailService';
import { initializeRateLimitFromDb } from './services/rateLimiter';
import { createEmailWorker } from './workers/emailWorker';

// Import routes
import authRoutes from './routes/auth';
import campaignRoutes from './routes/campaigns';

const app = express();

// Middleware
app.use(
  cors({
    origin: config.frontend.url,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.server.nodeEnv === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use('/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.server.nodeEnv === 'development' ? err.message : undefined,
  });
});

// Initialize and start server
const startServer = async () => {
  try {
    logger.info('Starting server initialization...');

    // Test database connection
    const dbConnected = await testDbConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Run migrations
    await runMigrations();

    // Verify email connection
    const emailConnected = await verifyEmailConnection();
    if (!emailConnected) {
      logger.warn('Email connection verification failed - continuing anyway');
    }

    // Initialize rate limiting from database
    await initializeRateLimitFromDb();

    // Start BullMQ worker
    createEmailWorker();

    // Start Express server
    app.listen(config.server.port, () => {
      logger.info(`Server running on port ${config.server.port}`);
      logger.info(`Environment: ${config.server.nodeEnv}`);
      logger.info(`Frontend URL: ${config.frontend.url}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  const { closeEmailQueue } = require('./queues/emailQueue');
  const { closeEmailWorker } = require('./workers/emailWorker');
  const { closeDbPool } = require('./db/connection');
  const { closeRedisClient } = require('./config/redis');

  await closeEmailWorker();
  await closeEmailQueue();
  await closeDbPool();
  await closeRedisClient();

  logger.info('Shutdown complete');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
startServer();

export default app;
