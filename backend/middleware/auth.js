const path = require('path');
let jwt;
try {
  jwt = require('jsonwebtoken');
} catch (err) {
  // In some deployment environments the module resolver may not locate
  // packages installed inside the backend folder when starting from the
  // repository root. Try a safe fallback to the backend/node_modules path.
  try {
    jwt = require(path.join(__dirname, '..', 'node_modules', 'jsonwebtoken'));
  } catch (err2) {
    // Re-throw the original error for visibility if both attempts fail
    throw err;
  }
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Immediately throw if in production and JWT_SECRET is missing or default
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-me' || process.env.JWT_SECRET === 'your-secure-jwt-secret-here')) {
  throw new Error('JWT_SECRET missing or using default value in production. Set a secure JWT_SECRET in your environment variables.');
}

function authMiddleware(req, res, next) {
  // Support Authorization header or HttpOnly cookie `inv101_token`
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (authHeader || '');

  if (!token && req.cookies && req.cookies.inv101_token) {
    token = req.cookies.inv101_token;
  }

  if (!token) return res.status(401).json({ success: false, error: 'Authorization token missing' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

function assertJwtSecretValid(isProduction) {
  if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-me')) {
    throw new Error('JWT_SECRET missing or using dev default in production');
  }
  return true;
}

module.exports = { authMiddleware, JWT_SECRET, assertJwtSecretValid };
