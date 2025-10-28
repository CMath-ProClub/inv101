const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

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
