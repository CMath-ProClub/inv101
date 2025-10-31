const mongoose = require('mongoose');
const bcrypt = require('../lib/bcrypt-wrapper');
const crypto = require('crypto');

const RefreshTokenSchema = new mongoose.Schema({
  id: { type: String, required: true },
  tokenHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  revokedAt: { type: Date }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true }, // For Investing101 and display
  displayName: { type: String },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  passwordHash: { type: String }, // Only for Investing101 accounts
  provider: { type: String, enum: ['investing101', 'google', 'facebook', 'microsoft'], default: 'investing101' },
  providerId: { type: String }, // For OAuth accounts
  createdAt: { type: Date, default: Date.now },
  // Refresh tokens stored as { id, tokenHash } for efficient lookup
  refreshTokens: [RefreshTokenSchema]
});

// Index refresh token ids for fast lookup
UserSchema.index({ 'refreshTokens.id': 1 });

UserSchema.methods.verifyPassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.statics.createWithPassword = async function(email, password) {
  const hash = await bcrypt.hash(password, 10);
  return this.create({ email, passwordHash: hash });
};

// Add a refresh token: store hash and return the token id. Caller is responsible for giving the
// plaintext token to the client (we store only the hash).
UserSchema.methods.addRefreshToken = async function(tokenPlain) {
  this.refreshTokens = this.refreshTokens || [];
  const id = crypto.randomBytes(12).toString('hex');
  const hash = await bcrypt.hash(tokenPlain, 12);
  this.refreshTokens.push({ id, tokenHash: hash, createdAt: new Date() });
  await this.save();
  return id; // caller will combine id + tokenPlain for cookie
};

UserSchema.methods.removeRefreshTokenById = async function(id) {
  if (!this.refreshTokens) return;
  this.refreshTokens = this.refreshTokens.filter(t => t.id !== id);
  await this.save();
};

// Static: find user by cookie-style refresh token 'id.tokenPlain'
UserSchema.statics.findByRefreshTokenCookie = async function(cookieValue) {
  if (!cookieValue || typeof cookieValue !== 'string') return null;
  const idx = cookieValue.indexOf('.');
  if (idx === -1) return null;
  const id = cookieValue.slice(0, idx);
  const tokenPlain = cookieValue.slice(idx + 1);
  if (!id || !tokenPlain) return null;
  const user = await this.findOne({ 'refreshTokens.id': id });
  if (!user) return null;
  const tokenDoc = (user.refreshTokens || []).find(t => t.id === id && !t.revokedAt);
  if (!tokenDoc) return null;
  try {
    const ok = await bcrypt.compare(tokenPlain, tokenDoc.tokenHash);
    if (ok) return { user, tokenId: id };
  } catch (e) {
    return null;
  }
  return null;
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
