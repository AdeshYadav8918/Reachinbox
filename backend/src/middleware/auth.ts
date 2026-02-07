import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

import { User as AppUser } from '../types';

declare global {
  namespace Express {
    interface User extends AppUser { }
  }
}

export type AuthenticatedRequest = Request;


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
