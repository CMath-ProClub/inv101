const express = require('express');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { issueTokens, clearAuthCookies } = require('../services/authTokens');

const router = express.Router();

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user._id.toString(),
    email: user.email,
    displayName: user.displayName || user.username || user.email?.split('@')[0] || null
  };
}

router.post('/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Account already exists for this email.' });
    }

    const user = await User.createWithPassword(normalizedEmail, password);
    if (displayName) {
      user.displayName = displayName;
    }
    user.username = user.username || normalizedEmail.split('@')[0];
    await user.save();

    await issueTokens(res, user);

    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, error: 'Unable to create account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Account not found.' });
    }

    const ok = await user.verifyPassword(password);
    if (!ok) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    await issueTokens(res, user, { rememberMe: Boolean(rememberMe) });
    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Unable to sign in.' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const refreshCookie = req.cookies?.inv101_refresh;
    if (refreshCookie) {
      const dotIndex = refreshCookie.indexOf('.');
      if (dotIndex !== -1) {
        const refreshId = refreshCookie.slice(0, dotIndex);
        const user = await User.findOne({ 'refreshTokens.id': refreshId });
        if (user) {
          await user.removeRefreshTokenById(refreshId);
        }
      }
    }

    clearAuthCookies(res);
    return res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, error: 'Unable to logout.' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const refreshCookie = req.cookies?.inv101_refresh;
    if (!refreshCookie) {
      return res.status(401).json({ success: false, error: 'Refresh token missing.' });
    }

    const lookup = await User.findByRefreshTokenCookie(refreshCookie);
    if (!lookup) {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, error: 'Refresh token invalid.' });
    }

    const { user, tokenId } = lookup;
    await user.removeRefreshTokenById(tokenId);
    await issueTokens(res, user, { rememberMe: true });

    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Refresh error:', error);
    clearAuthCookies(res);
    return res.status(500).json({ success: false, error: 'Unable to refresh session.' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, error: 'User not found.' });
    }
    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return res.status(500).json({ success: false, error: 'Unable to load account.' });
  }
});

module.exports = router;
