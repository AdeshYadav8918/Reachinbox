export interface User {
  id: number;
  google_id: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: Date;
  updated_at: Date;
}

export interface EmailCampaign {
  id: number;
  user_id: number;
  subject: string;
  body: string;
  start_time: Date;
  delay_between_emails_ms: number;
  hourly_limit: number;
  total_emails: number;
  sent_count: number;
  failed_count: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export interface ScheduledEmail {
  id: number;
  campaign_id: number;
  user_id: number;
  recipient_email: string;
  subject: string;
  body: string;
  scheduled_time: Date;
  status: 'scheduled' | 'queued' | 'sent' | 'failed';
  job_id?: string;
  sent_at?: Date;
  error_message?: string;
  attempts: number;
  created_at: Date;
  updated_at: Date;
}

export interface RateLimitTracking {
  id: number;
  user_id: number;
  hour_window: Date;
  email_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface EmailJobData {
  emailId: number;
  userId: number;
  campaignId: number;
  recipientEmail: string;
  subject: string;
  body: string;
  scheduledTime: Date;
}

export interface CreateCampaignRequest {
  subject: string;
  body: string;
  recipients: string[];
  start_time: string;
  delay_between_emails_ms: number;
  hourly_limit: number;
}

export interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  scheduled: number;
  queued: number;
}
