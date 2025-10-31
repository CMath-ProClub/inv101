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

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
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
}));

// If Google credentials are missing, remove the strategy to avoid startup crash
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth will be disabled');
  try {
    // passport._strategies may hold the strategy; remove if present
    if (passport && passport._strategies && passport._strategies.google) {
      delete passport._strategies.google;
    }
  } catch (e) {
    // ignore
  }
}

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'emails']
}, async (accessToken, refreshToken, profile, done) => {
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
}));

// If Facebook credentials are missing, disable the strategy to avoid startup crash
if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
  console.warn('⚠️ FACEBOOK_APP_ID or FACEBOOK_APP_SECRET not set — Facebook OAuth will be disabled');
  try {
    if (passport && passport._strategies && passport._strategies.facebook) {
      delete passport._strategies.facebook;
    }
  } catch (e) {
    // ignore
  }
}

module.exports = passport;
