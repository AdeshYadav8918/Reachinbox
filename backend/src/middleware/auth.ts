import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    avatar?: string;
  };
}

export const isAuthenticated = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  logger.warn('Unauthorized access attempt');
  res.status(401).json({ error: 'Unauthorized' });
};
