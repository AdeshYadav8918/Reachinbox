import nodemailer from 'nodemailer';
import { config } from '../config';
import logger from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

export const getEmailTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });

    logger.info('Email transporter created');
  }

  return transporter;
};

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

export const sendEmail = async (params: SendEmailParams): Promise<void> => {
  const transporter = getEmailTransporter();

  const mailOptions = {
    from: params.from || config.smtp.user,
    to: params.to,
    subject: params.subject,
    text: params.body,
    html: params.body.replace(/\n/g, '<br>'),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId} to ${params.to}`);
    
    // Log preview URL for Ethereal
    if (config.smtp.host === 'smtp.ethereal.email') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`Preview URL: ${previewUrl}`);
      }
    }
  } catch (error) {
    logger.error(`Failed to send email to ${params.to}:`, error);
    throw error;
  }
};

export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    const transporter = getEmailTransporter();
    await transporter.verify();
    logger.info('SMTP connection verified');
    return true;
  } catch (error) {
    logger.error('SMTP connection verification failed:', error);
    return false;
  }
};
