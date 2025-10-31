const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.APP_URL ? `${process.env.APP_URL.replace(/\/$/, '')}/auth/google/callback` : '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ provider: 'google', providerId: profile.id });
      if (!user) {
        user = await User.create({
          username: profile.emails?.[0]?.value || profile.id,
          displayName: profile.displayName,
          provider: 'google',
          providerId: profile.id
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
} else {
  console.warn('⚠️ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth disabled');
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.APP_URL ? `${process.env.APP_URL.replace(/\/$/, '')}/auth/facebook/callback` : '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'emails']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ provider: 'facebook', providerId: profile.id });
      if (!user) {
        user = await User.create({
          username: profile.emails?.[0]?.value || profile.id,
          displayName: profile.displayName,
          provider: 'facebook',
          providerId: profile.id
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
} else {
  console.warn('⚠️ FACEBOOK_APP_ID or FACEBOOK_APP_SECRET not set — Facebook OAuth disabled');
}

module.exports = passport;
