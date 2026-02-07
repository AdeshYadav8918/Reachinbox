import { Router } from 'express';
import passport from '../config/passport';
import { config } from '../config';

const router = Router();

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Guest Login Route (Skip Login)
if (process.env.NODE_ENV === 'development') {
  router.get('/guest', async (req, res) => {
    try {
      const { findOrCreateUser } = require('../services/userService');
      const guestProfile = {
        id: 'guest-user-123',
        emails: [{ value: 'guest@example.com' }],
        displayName: 'Guest User',
        photos: [{ value: 'https://via.placeholder.com/150' }],
      };

      const user = await findOrCreateUser(guestProfile);

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Login failed' });
        }
        res.redirect(`${config.frontend.url}/dashboard`);
      });
    } catch (error) {
      console.error('Guest login error:', error);
      res.status(500).json({ error: 'Guest login error' });
    }
  });
}

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${config.frontend.url}/login?error=auth_failed`,
  }),
  (req, res) => {
    // Successful authentication, redirect to frontend dashboard
    res.redirect(`${config.frontend.url}/dashboard`);
  }
);

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

export default router;
