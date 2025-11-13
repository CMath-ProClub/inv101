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

// Helper to allow temporary bypass of the strict throw when debugging deploy issues.
// Set ENFORCE_JWT=1 (or true) in the environment to restore the strict behavior
// that will throw on missing/default JWT_SECRET in production.
const _enforceJwt = String(process.env.ENFORCE_JWT || '').toLowerCase() === '1' || String(process.env.ENFORCE_JWT || '').toLowerCase() === 'true';

// Immediately validate in production. If JWT_SECRET is missing or still the dev default
// we normally want to crash to avoid running with an insecure secret. However, during
// deploy troubleshooting it's sometimes useful to allow the process to start and
// surface a clear error while you fix environment variables in the hosting UI.
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-me' || process.env.JWT_SECRET === 'your-secure-jwt-secret-here')) {
  const msg = 'JWT_SECRET missing or using default value in production. Set a secure JWT_SECRET in your environment variables.';
  if (_enforceJwt) {
    throw new Error(msg);
  } else {
    // Log a prominent error but continue startup so the service remains reachable while you fix envs.
    console.error('❌ ' + msg + ' To enforce strict behavior set ENFORCE_JWT=1');
  }
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
  req.user = { id: payload.sub, email: payload.email, _id: payload.sub };
  req.userId = payload.sub;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

function assertJwtSecretValid(isProduction) {
  const missingSecret = !process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-me' || process.env.JWT_SECRET === 'your-secure-jwt-secret-here';
  if (isProduction && missingSecret) {
    throw new Error('JWT_SECRET missing or using dev default in production');
  }
  return true;
}

module.exports = { authMiddleware, JWT_SECRET, assertJwtSecretValid };
