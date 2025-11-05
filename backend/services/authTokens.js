const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const isProduction = process.env.NODE_ENV === 'production';
const ACCESS_TOKEN_SECONDS = parseInt(process.env.JWT_ACCESS_TTL || '900', 10);
const ACCESS_TOKEN_REMEMBER_SECONDS = parseInt(process.env.JWT_ACCESS_REMEMBER_SECONDS || '2592000', 10);
const REFRESH_TOKEN_DAYS = parseInt(process.env.JWT_REFRESH_TTL_DAYS || '30', 10);

function buildAccessToken(user, expiresInSeconds) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, {
    expiresIn: expiresInSeconds,
  });
}

function buildRefreshTokenPlain() {
  return crypto.randomBytes(24).toString('hex');
}

function setAuthCookies(res, accessToken, options = {}) {
  const baseCookie = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  };

  if (options.maxAgeMs) {
    baseCookie.maxAge = options.maxAgeMs;
  }

  res.cookie('inv101_token', accessToken, baseCookie);

  if (options.refreshValue) {
    const refreshCookie = {
      ...baseCookie,
      maxAge: options.refreshMaxAgeMs || REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    };
    res.cookie('inv101_refresh', options.refreshValue, refreshCookie);
  } else {
    // Clear any lingering refresh cookie when remember me is not set
    res.cookie('inv101_refresh', '', { ...baseCookie, maxAge: 0 });
  }
}

function clearAuthCookies(res) {
  const baseCookie = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0,
  };
  res.cookie('inv101_token', '', baseCookie);
  res.cookie('inv101_refresh', '', baseCookie);
}

async function issueTokens(res, user, options = {}) {
  const rememberMe = Boolean(options.rememberMe);
  const accessTtlSeconds = rememberMe ? ACCESS_TOKEN_REMEMBER_SECONDS : ACCESS_TOKEN_SECONDS;
  const accessToken = buildAccessToken(user, accessTtlSeconds);

  let refreshCookieValue;

  if (rememberMe) {
    const refreshPlain = buildRefreshTokenPlain();
    const refreshId = await user.addRefreshToken(refreshPlain);
    refreshCookieValue = `${refreshId}.${refreshPlain}`;
  }

  setAuthCookies(res, accessToken, {
    maxAgeMs: rememberMe ? accessTtlSeconds * 1000 : undefined,
    refreshValue: refreshCookieValue,
    refreshMaxAgeMs: rememberMe ? REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000 : undefined,
  });

  return { accessToken, refreshCookieValue };
}

module.exports = {
  ACCESS_TOKEN_SECONDS,
  ACCESS_TOKEN_REMEMBER_SECONDS,
  REFRESH_TOKEN_DAYS,
  buildAccessToken,
  buildRefreshTokenPlain,
  clearAuthCookies,
  issueTokens,
  setAuthCookies,
};
