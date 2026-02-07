import { getDbPool } from '../db/connection';
import { scheduleEmail } from '../queues/emailQueue';
import logger from '../utils/logger';
import { CreateCampaignRequest, EmailCampaign, ScheduledEmail } from '../types';

export const createCampaign = async (
  userId: number,
  campaignData: CreateCampaignRequest
): Promise<EmailCampaign> => {
  const pool = getDbPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      subject,
      body,
      recipients,
      start_time,
      delay_between_emails_ms,
      hourly_limit,
    } = campaignData;

    // Validate recipients
    if (!recipients || recipients.length === 0) {
      throw new Error('No recipients provided');
    }

    // Helper to format Date to MySQL DATETIME string
    const toMysqlDatetime = (date: Date) => {
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    // Create campaign
    const [campaignResult] = await connection.query<any>(
      `INSERT INTO email_campaigns 
       (user_id, subject, body, start_time, delay_between_emails_ms, hourly_limit, total_emails, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        subject,
        body,
        toMysqlDatetime(new Date(start_time)),
        delay_between_emails_ms,
        hourly_limit,
        recipients.length
      ]
    );

    const campaignId = campaignResult.insertId;

    // Calculate scheduled times for each email
    const startTime = new Date(start_time);
    let currentScheduledTime = new Date(startTime);

    const scheduledEmails: ScheduledEmail[] = [];

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i].trim();

      // Insert scheduled email
      const [emailResult] = await connection.query<any>(
        `INSERT INTO scheduled_emails 
         (campaign_id, user_id, recipient_email, subject, body, scheduled_time, status)
         VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
        [
          campaignId,
          userId,
          recipient,
          subject,
          body,
          toMysqlDatetime(currentScheduledTime)
        ]
      );

      const emailId = emailResult.insertId;

      // Schedule in BullMQ
      const jobId = await scheduleEmail(
        {
          emailId,
          userId,
          campaignId,
          recipientEmail: recipient,
          subject,
          body,
          scheduledTime: currentScheduledTime,
        },
        currentScheduledTime
      );

      // Update job_id in database
      await connection.query(
        'UPDATE scheduled_emails SET job_id = ? WHERE id = ?',
        [jobId, emailId]
      );

      scheduledEmails.push({
        id: emailId,
        campaign_id: campaignId,
        user_id: userId,
        recipient_email: recipient,
        subject,
        body,
        scheduled_time: new Date(currentScheduledTime),
        status: 'scheduled',
        job_id: jobId,
        attempts: 0,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Increment scheduled time for next email
      currentScheduledTime = new Date(currentScheduledTime.getTime() + delay_between_emails_ms);
    }

    // Update campaign status
    await connection.query(
      `UPDATE email_campaigns SET status = 'in_progress', updated_at = NOW() WHERE id = ?`,
      [campaignId]
    );

    await connection.commit();

    logger.info(`Campaign created: id=${campaignId}, emails=${recipients.length}`);

    // Fetch and return the created campaign
    const [campaigns] = await pool.query<any[]>(
      'SELECT * FROM email_campaigns WHERE id = ?',
      [campaignId]
    );

    return campaigns[0];
  } catch (error) {
    await connection.rollback();
    logger.error('Error creating campaign:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export const getCampaigns = async (userId: number): Promise<EmailCampaign[]> => {
  const pool = getDbPool();

  const [campaigns] = await pool.query<any[]>(
    `SELECT * FROM email_campaigns 
     WHERE user_id = ? 
     ORDER BY created_at DESC`,
    [userId]
  );

  return campaigns;
};

export const getCampaignById = async (
  campaignId: number,
  userId: number
): Promise<EmailCampaign | null> => {
  const pool = getDbPool();

  const [campaigns] = await pool.query<any[]>(
    'SELECT * FROM email_campaigns WHERE id = ? AND user_id = ?',
    [campaignId, userId]
  );

  return campaigns.length > 0 ? campaigns[0] : null;
};

export const getScheduledEmails = async (userId: number): Promise<ScheduledEmail[]> => {
  const pool = getDbPool();

  const [emails] = await pool.query<any[]>(
    `SELECT * FROM scheduled_emails 
     WHERE user_id = ? AND status IN ('scheduled', 'queued')
     ORDER BY scheduled_time ASC`,
    [userId]
  );

  return emails;
};

export const getSentEmails = async (userId: number): Promise<ScheduledEmail[]> => {
  const pool = getDbPool();

  const [emails] = await pool.query<any[]>(
    `SELECT * FROM scheduled_emails 
     WHERE user_id = ? AND status IN ('sent', 'failed')
     ORDER BY sent_at DESC, updated_at DESC`,
    [userId]
  );

  return emails;
};
