const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('../lib/bcrypt-wrapper');
const passport = require('../passport');

// Sign up with Investing101 account
router.post('/signup', async (req, res) => {
  const { username, displayName, password } = req.body;
  if (!username || !displayName || !password) return res.status(400).json({ error: 'Missing fields' });
  const existing = await User.findOne({ username });
  if (existing) return res.status(409).json({ error: 'Username already taken' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, displayName, passwordHash, provider: 'investing101' });
  res.status(201).json({ message: 'Account created', user: { username, displayName } });
});

// Sign in with Investing101 account
router.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, provider: 'investing101' });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });
  res.json({ message: 'Signed in', user: { username: user.username, displayName: user.displayName } });
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/signin.html',
  successRedirect: '/profile-main.html'
}));

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: '/signin.html',
  successRedirect: '/profile-main.html'
}));

// Logout route
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/signin.html');
  });
});

// TODO: Add Microsoft OAuth routes

module.exports = router;
