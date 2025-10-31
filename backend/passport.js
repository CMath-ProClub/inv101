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

module.exports = passport;
