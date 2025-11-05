const express = require('express');
const path = require('path');
let jwt;
try {
  jwt = require('jsonwebtoken');
} catch (err) {
  try {
    jwt = require(path.join(__dirname, '..', 'node_modules', 'jsonwebtoken'));
  } catch (err2) {
    throw err;
  }
}
const crypto = require('crypto');
const User = require('../models/User');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const isProduction = process.env.NODE_ENV === 'production';
const ACCESS_TOKEN_SECONDS = parseInt(process.env.JWT_ACCESS_TTL || '900', 10); // 15 minutes
const REFRESH_TOKEN_DAYS = parseInt(process.env.JWT_REFRESH_TTL_DAYS || '30', 10);

function buildAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_SECONDS
  });
}

function buildRefreshTokenPlain() {
  return crypto.randomBytes(24).toString('hex');
}

function setAuthCookies(res, accessToken, refreshCookieValue) {
  res.cookie('inv101_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_SECONDS * 1000
  });

  res.cookie('inv101_refresh', refreshCookieValue, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  });
}

function clearAuthCookies(res) {
  res.cookie('inv101_token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0
  });
  res.cookie('inv101_refresh', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0
  });
}

async function issueTokens(res, user) {
  const accessToken = buildAccessToken(user);
  const refreshPlain = buildRefreshTokenPlain();
  const refreshId = await user.addRefreshToken(refreshPlain);
  const refreshCookieValue = `${refreshId}.${refreshPlain}`;
  setAuthCookies(res, accessToken, refreshCookieValue);
  return { accessToken, refreshCookieValue };
}

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
    const { email, password } = req.body || {};
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

    await issueTokens(res, user);
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
    await issueTokens(res, user);

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
