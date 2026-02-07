import { Worker, Job } from 'bullmq';
import { getRedisClient, getProcessingKey } from '../config/redis';
import { getDbPool } from '../db/connection';
import { config } from '../config';
import logger from '../utils/logger';
import { sendEmail } from '../services/emailService';
import { checkRateLimit, incrementRateLimit, getNextAvailableSlot } from '../services/rateLimiter';
import { EmailJobData } from '../types';

let emailWorker: Worker<EmailJobData> | null = null;

export const createEmailWorker = (): Worker<EmailJobData> => {
  if (emailWorker) {
    return emailWorker;
  }

  const redisConnection = getRedisClient();
  const pool = getDbPool();

  emailWorker = new Worker<EmailJobData>(
    'email-queue',
    async (job: Job<EmailJobData>) => {
      const { emailId, userId, recipientEmail, subject, body } = job.data;

      logger.info(`Processing email job: emailId=${emailId}, recipient=${recipientEmail}`);

      // Check for idempotency - ensure this email hasn't been processed
      const processKey = getProcessingKey(emailId);
      const redis = getRedisClient();
      
      const isProcessing = await redis.get(processKey);
      if (isProcessing) {
        logger.warn(`Email ${emailId} is already being processed, skipping`);
        return { success: false, reason: 'already_processing' };
      }

      // Set processing lock (expires in 5 minutes)
      await redis.set(processKey, '1', 'EX', 300);

      try {
        // Check current status
        const [rows] = await pool.query<any[]>(
          'SELECT status FROM scheduled_emails WHERE id = ?',
          [emailId]
        );

        if (rows.length === 0) {
          logger.warn(`Email ${emailId} not found in database`);
          await redis.del(processKey);
          return { success: false, reason: 'not_found' };
        }

        if (rows[0].status === 'sent') {
          logger.info(`Email ${emailId} already sent, skipping`);
          await redis.del(processKey);
          return { success: true, reason: 'already_sent' };
        }

        // Check rate limit
        const canSend = await checkRateLimit(userId);
        
        if (!canSend) {
          logger.warn(`Rate limit exceeded for user ${userId}, rescheduling email ${emailId}`);
          
          // Calculate next available slot
          const nextSlot = await getNextAvailableSlot(userId);
          const delay = Math.max(0, nextSlot.getTime() - Date.now());
          
          // Update status to scheduled and reschedule
          await pool.query(
            `UPDATE scheduled_emails 
             SET status = 'scheduled', scheduled_time = ?, updated_at = NOW()
             WHERE id = ?`,
            [nextSlot, emailId]
          );

          await redis.del(processKey);
          
          // Reschedule the job
          throw new Error(`RATE_LIMIT_EXCEEDED:${delay}`);
        }

        // Add minimum delay between emails
        if (config.rateLimiting.minDelayBetweenEmailsMs > 0) {
          await new Promise(resolve => 
            setTimeout(resolve, config.rateLimiting.minDelayBetweenEmailsMs)
          );
        }

        // Update status to queued
        await pool.query(
          `UPDATE scheduled_emails SET status = 'queued', updated_at = NOW() WHERE id = ?`,
          [emailId]
        );

        // Send the email
        await sendEmail({
          to: recipientEmail,
          subject,
          body,
        });

        // Increment rate limit counter
        await incrementRateLimit(userId);

        // Update email status to sent
        await pool.query(
          `UPDATE scheduled_emails 
           SET status = 'sent', sent_at = NOW(), updated_at = NOW()
           WHERE id = ?`,
          [emailId]
        );

        // Update campaign sent count
        await pool.query(
          `UPDATE email_campaigns 
           SET sent_count = sent_count + 1, updated_at = NOW()
           WHERE id = ?`,
          [job.data.campaignId]
        );

        logger.info(`Email sent successfully: emailId=${emailId}`);

        // Release processing lock
        await redis.del(processKey);

        return { success: true };
      } catch (error: any) {
        logger.error(`Error processing email ${emailId}:`, error);

        // Handle rate limit exceeded - reschedule
        if (error.message && error.message.startsWith('RATE_LIMIT_EXCEEDED:')) {
          const delay = parseInt(error.message.split(':')[1], 10);
          await redis.del(processKey);
          throw new Error(`Rescheduling due to rate limit: delay=${delay}ms`);
        }

        // Update email status to failed
        await pool.query(
          `UPDATE scheduled_emails 
           SET status = 'failed', 
               error_message = ?, 
               attempts = attempts + 1,
               updated_at = NOW()
           WHERE id = ?`,
          [error.message || 'Unknown error', emailId]
        );

        // Update campaign failed count
        await pool.query(
          `UPDATE email_campaigns 
           SET failed_count = failed_count + 1, updated_at = NOW()
           WHERE id = ?`,
          [job.data.campaignId]
        );

        // Release processing lock
        await redis.del(processKey);

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: config.rateLimiting.workerConcurrency,
      limiter: {
        max: config.rateLimiting.maxEmailsPerHour,
        duration: 3600 * 1000, // 1 hour in milliseconds
      },
    }
  );

  emailWorker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed`);
  });

  emailWorker.on('failed', (job, error) => {
    logger.error(`Job ${job?.id} failed:`, error);
  });

  emailWorker.on('error', (error) => {
    logger.error('Worker error:', error);
  });

  logger.info('Email worker created with concurrency:', config.rateLimiting.workerConcurrency);

  return emailWorker;
};

export const closeEmailWorker = async (): Promise<void> => {
  if (emailWorker) {
    await emailWorker.close();
    logger.info('Email worker closed');
  }
};

// Start worker if this file is run directly
if (require.main === module) {
  logger.info('Starting email worker...');
  createEmailWorker();

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, closing worker...');
    await closeEmailWorker();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, closing worker...');
    await closeEmailWorker();
    process.exit(0);
  });
}
