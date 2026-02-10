// routes/auth.js - Authentication routes
const express = require('express');
const router = express.Router();
const passport = require('passport');

// Helper middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    success: false,
    message: 'Authentication required. Please login first.'
  });
};

// ======================
// GOOGLE AUTH
// ======================

// Start Google OAuth flow
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/join?error=auth_failed&provider=google`,
    failureMessage: true
  }),
  (req, res) => {
    try {
      // Successful authentication
      console.log(`✅ User authenticated via Google: ${req.user.email}`);

      // Redirect to frontend home page
      res.redirect(`${process.env.FRONTEND_URL}/`);
    } catch (error) {
      console.error('❌ Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/join?error=callback_failed&provider=google`);
    }
  }
);

// ======================
// GITHUB AUTH
// ======================

// Start GitHub OAuth flow
router.get('/github',
  passport.authenticate('github', {
    scope: ['user:email']
  })
);

// GitHub OAuth callback
router.get('/github/callback',
  passport.authenticate('github', {
    failureRedirect: `${process.env.FRONTEND_URL}/join?error=auth_failed&provider=github`,
    failureMessage: true
  }),
  (req, res) => {
    try {
      // Successful authentication
      console.log(`✅ User authenticated via GitHub: ${req.user.name}`);

      // Redirect to frontend home page
      res.redirect(`${process.env.FRONTEND_URL}/`);
    } catch (error) {
      console.error('❌ GitHub callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/join?error=callback_failed&provider=github`);
    }
  }
);

// ======================
// USER SESSION
// ======================

// Get current user info
router.get('/me', (req, res) => {
  try {
    if (req.isAuthenticated()) {
      // Return user data without sensitive information
      const safeUser = {
        isAuthenticated: true,
        provider: req.user.provider,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        username: req.user.username,
        hasApplication: false // Will be set by frontend after checking
      };

      res.json({
        success: true,
        message: 'User is authenticated',
        data: safeUser
      });
    } else {
      res.json({
        success: false,
        message: 'No active session',
        data: { isAuthenticated: false }
      });
    }
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user information'
    });
  }
});

// Logout user
router.get('/logout', (req, res) => {
  try {
    const userName = req.user?.name || 'User';

    req.logout((err) => {
      if (err) {
        console.error('❌ Logout error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error during logout'
        });
      }

      // Destroy session
      req.session.destroy((err) => {
        if (err) {
          console.error('❌ Session destroy error:', err);
        }

        console.log(`✅ User logged out: ${userName}`);

        // Clear session cookie
        res.clearCookie('cpc.sid');

        res.json({
          success: true,
          message: 'Successfully logged out'
        });
      });
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout process'
    });
  }
});

// ======================
// AUTH STATUS
// ======================

// Check if user is authenticated (for frontend)
router.get('/check', (req, res) => {
  res.json({
    success: true,
    data: {
      isAuthenticated: req.isAuthenticated(),
      timestamp: new Date().toISOString()
    }
  });
});

// Get available auth providers
router.get('/providers', (req, res) => {
  const providers = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push({
      name: 'google',
      displayName: 'Google',
      url: '/api/auth/google',
      icon: 'google'
    });
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push({
      name: 'github',
      displayName: 'GitHub',
      url: '/api/auth/github',
      icon: 'github'
    });
  }

  res.json({
    success: true,
    data: providers
  });
});

module.exports = router;
