const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('../lib/bcrypt-wrapper');
const { issueTokens, clearAuthCookies } = require('../services/authTokens');

// Sign up with Investing101 account
router.post('/signup', async (req, res) => {
  try {
    const { email, displayName, password } = req.body;
    
    if (!email || !displayName || !password) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
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
    
    // Issue JWT tokens and set cookies
    await issueTokens(res, user, { rememberMe: true });
    
    res.status(201).json({ 
      success: true,
      message: 'Account created successfully', 
      user: { 
        id: user._id,
        email: user.email,
        displayName: user.displayName 
      } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, error: 'Failed to create account. Please try again.' });
  }
});

// Sign in with Investing101 account
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      provider: 'investing101' 
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Incorrect password' });
    }
    
    // Issue JWT tokens and set cookies
    await issueTokens(res, user, { rememberMe: true });
    
    res.json({ 
      success: true,
      message: 'Signed in successfully', 
      user: { 
        id: user._id,
        email: user.email,
        displayName: user.displayName 
      } 
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ success: false, error: 'Failed to sign in. Please try again.' });
  }
});

// Alias for signin (some frontend pages call /login)
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      provider: 'investing101' 
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Incorrect password' });
    }
    
    // Issue JWT tokens and set cookies
    await issueTokens(res, user, { rememberMe: rememberMe || true });
    
    res.json({ 
      success: true,
      message: 'Signed in successfully', 
      user: { 
        id: user._id,
        email: user.email,
        displayName: user.displayName 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Failed to sign in. Please try again.' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  clearAuthCookies(res);
  res.redirect('/signin.html');
});

module.exports = router;
