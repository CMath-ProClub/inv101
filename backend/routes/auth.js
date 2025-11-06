const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('../lib/bcrypt-wrapper');
const passport = require('../passport');

// Sign up with Investing101 account
router.post('/signup', async (req, res) => {
  try {
    const { email, displayName, password } = req.body;
    
    if (!email || !displayName || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      email: email.toLowerCase(),
      username: email.split('@')[0],
      displayName, 
      passwordHash, 
      provider: 'investing101' 
    });
    
    res.status(201).json({ 
      message: 'Account created successfully', 
      user: { 
        email: user.email,
        displayName: user.displayName 
      } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// Sign in with Investing101 account
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      provider: 'investing101' 
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    
    res.json({ 
      message: 'Signed in successfully', 
      user: { 
        email: user.email,
        displayName: user.displayName 
      } 
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Failed to sign in. Please try again.' });
  }
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
