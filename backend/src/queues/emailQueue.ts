import { Queue } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { config } from '../config';
import logger from '../utils/logger';
import { EmailJobData } from '../types';

let emailQueue: Queue<EmailJobData> | null = null;

export const getEmailQueue = (): Queue<EmailJobData> => {
  if (!emailQueue) {
    const redisConnection = getRedisClient();

    emailQueue = new Queue<EmailJobData>('email-queue', {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: {
          count: 1000, // Keep last 1000 completed jobs
          age: 24 * 3600, // Keep for 24 hours
        },
        removeOnFail: {
          count: 5000, // Keep last 5000 failed jobs
        },
      },
    });

    emailQueue.on('error', (error) => {
      logger.error('Email queue error:', error);
    });

    logger.info('Email queue initialized');
  }

  return emailQueue;
};

export const closeEmailQueue = async (): Promise<void> => {
  if (emailQueue) {
    await emailQueue.close();
    logger.info('Email queue closed');
  }
};

// Add email to queue with delay
export const scheduleEmail = async (
  emailData: EmailJobData,
  scheduledTime: Date
): Promise<string> => {
  const queue = getEmailQueue();
  const now = new Date();
  const delay = Math.max(0, scheduledTime.getTime() - now.getTime());

  const job = await queue.add(
    'send-email',
    emailData,
    {
      delay,
      jobId: `email-${emailData.emailId}`, // Ensures idempotency
    }
  );

  logger.info(`Email scheduled: emailId=${emailData.emailId}, jobId=${job.id}, delay=${delay}ms`);
  return job.id as string;
};
