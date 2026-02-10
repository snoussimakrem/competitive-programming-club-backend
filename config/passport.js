// config/passport.js - Passport configuration
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.NODE_ENV === 'production' ? process.env.BACKEND_URL : 'http://localhost:5000'}/api/auth/google/callback`,
    passReqToCallback: true
  }, (req, accessToken, refreshToken, profile, done) => {
    try {
      // Extract user data from Google profile
      const user = {
        provider: 'google',
        providerId: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value || null,
        avatar: profile.photos?.[0]?.value || null,
        accessToken: accessToken,
        profile: {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value,
          photos: profile.photos
        }
      };
      
      console.log(`✅ Google OAuth successful for: ${user.email}`);
      return done(null, user);
    } catch (error) {
      console.error('❌ Google OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.warn('⚠️ Google OAuth credentials not configured');
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.NODE_ENV === 'production' ? process.env.BACKEND_URL : 'http://localhost:5000'}/api/auth/github/callback`,
    passReqToCallback: true,
    scope: ['user:email']
  }, (req, accessToken, refreshToken, profile, done) => {
    try {
      // Extract user data from GitHub profile
      const user = {
        provider: 'github',
        providerId: profile.id,
        name: profile.displayName || profile.username,
        email: profile.emails?.[0]?.value || null,
        avatar: profile.photos?.[0]?.value || profile._json.avatar_url || null,
        username: profile.username,
        accessToken: accessToken,
        profile: {
          id: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          profileUrl: profile.profileUrl
        }
      };
      
      console.log(`✅ GitHub OAuth successful for: ${user.username}`);
      return done(null, user);
    } catch (error) {
      console.error('❌ GitHub OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.warn('⚠️ GitHub OAuth credentials not configured');
}

module.exports = passport;