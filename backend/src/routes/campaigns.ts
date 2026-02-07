import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { isAuthenticated, AuthenticatedRequest } from '../middleware/auth';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  getScheduledEmails,
  getSentEmails,
} from '../services/campaignService';
import logger from '../utils/logger';

const router = Router();

// Validation middleware
const validateCampaign = [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('body').notEmpty().withMessage('Body is required'),
  body('recipients')
    .isArray({ min: 1 })
    .withMessage('Recipients must be a non-empty array'),
  body('recipients.*').isEmail().withMessage('Each recipient must be a valid email'),
  body('start_time').isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
  body('delay_between_emails_ms')
    .isInt({ min: 0 })
    .withMessage('Delay must be a positive integer'),
  body('hourly_limit')
    .isInt({ min: 1 })
    .withMessage('Hourly limit must be at least 1'),
];

// Create campaign
router.post(
  '/',
  isAuthenticated,
  validateCampaign,
  async (req: AuthenticatedRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.id;
      const campaign = await createCampaign(userId, req.body);

      res.status(201).json({
        message: 'Campaign created successfully',
        campaign,
      });
    } catch (error: any) {
      logger.error('Error creating campaign:', error);
      res.status(500).json({
        error: 'Failed to create campaign',
        message: error.message,
      });
    }
  }
);

// Get all campaigns for user
router.get('/', isAuthenticated, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const campaigns = await getCampaigns(userId);

    res.json({ campaigns });
  } catch (error: any) {
    logger.error('Error fetching campaigns:', error);
    res.status(500).json({
      error: 'Failed to fetch campaigns',
      message: error.message,
    });
  }
});

// Get campaign by ID
router.get('/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const campaignId = parseInt(req.params.id, 10);

    const campaign = await getCampaignById(campaignId, userId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({ campaign });
  } catch (error: any) {
    logger.error('Error fetching campaign:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign',
      message: error.message,
    });
  }
});

// Get scheduled emails
router.get('/emails/scheduled', isAuthenticated, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const emails = await getScheduledEmails(userId);

    res.json({ emails });
  } catch (error: any) {
    logger.error('Error fetching scheduled emails:', error);
    res.status(500).json({
      error: 'Failed to fetch scheduled emails',
      message: error.message,
    });
  }
});

// Get sent emails
router.get('/emails/sent', isAuthenticated, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const emails = await getSentEmails(userId);

    res.json({ emails });
  } catch (error: any) {
    logger.error('Error fetching sent emails:', error);
    res.status(500).json({
      error: 'Failed to fetch sent emails',
      message: error.message,
    });
  }
});

export default router;
