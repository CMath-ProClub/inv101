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
  provider: { type: String, enum: ['investing101', 'google', 'facebook', 'microsoft', 'clerk'], default: 'investing101' },
  providerId: { type: String }, // Reserved for legacy social logins
  createdAt: { type: Date, default: Date.now },
  // Profile features
  bio: { type: String, maxlength: 500 },
  avatar: { type: String }, // URL or path to avatar image
  location: { type: String, maxlength: 100 },
  website: { type: String, maxlength: 200 },
  isPublic: { type: Boolean, default: true }, // Whether profile is visible to others
  // Social features
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Stats
  totalTrades: { type: Number, default: 0 },
  portfolioValue: { type: Number, default: 100000 }, // Starting virtual cash
  performancePercent: { type: Number, default: 0 },
  rank: { type: Number },
  badges: [{ type: String }], // Achievement badges
  // Gamification & Progression
  skillLevel: { type: String, enum: ['new', 'beginner', 'intermediate', 'advanced', 'expert'], default: 'new' },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  longestStreak: { type: Number, default: 0 },
  lessonsCompleted: { type: Number, default: 0 },
  quizzesPassed: { type: Number, default: 0 },
  simulationsCompleted: { type: Number, default: 0 },
  calculationsRun: { type: Number, default: 0 },
  // Onboarding & Preferences
  onboardingCompleted: { type: Boolean, default: false },
  onboardingScore: { type: Number }, // Score from initial quiz (0-100)
  preferredTopics: [{ type: String }], // e.g., ['stocks', 'crypto', 'retirement']
  learningGoals: [{ type: String }], // e.g., ['build-wealth', 'retirement', 'passive-income']
  riskTolerance: { type: String, enum: ['conservative', 'moderate', 'aggressive'] },
  // Premium & Monetization
  subscriptionTier: { type: String, enum: ['free', 'basic', 'pro', 'expert'], default: 'free' },
  subscriptionExpiry: { type: Date },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCount: { type: Number, default: 0 },
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

// Gamification Methods
UserSchema.methods.addXP = async function(points, source = 'general') {
  this.xp += points;
  const newLevel = this.calculateLevel(this.xp);
  const leveledUp = newLevel > this.level;
  this.level = newLevel;
  
  // Track the activity for streaks
  this.updateStreak();
  
  await this.save();
  return { leveledUp, newLevel: this.level, totalXP: this.xp };
};

UserSchema.methods.calculateLevel = function(xp) {
  // Level formula: sqrt(xp / 100) + 1
  // Level 1: 0 XP, Level 2: 100 XP, Level 3: 400 XP, Level 4: 900 XP, etc.
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

UserSchema.methods.getXPForNextLevel = function() {
  const nextLevel = this.level + 1;
  return Math.pow(nextLevel - 1, 2) * 100;
};

UserSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.lastActiveDate) {
    this.streak = 1;
    this.lastActiveDate = today;
    this.longestStreak = Math.max(this.longestStreak, 1);
    return;
  }
  
  const lastActive = new Date(this.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);
  const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    // Same day, no change
    return;
  } else if (daysDiff === 1) {
    // Consecutive day
    this.streak += 1;
    this.longestStreak = Math.max(this.longestStreak, this.streak);
  } else {
    // Streak broken
    this.streak = 1;
  }
  
  this.lastActiveDate = today;
};

UserSchema.methods.completeLesson = async function(lessonId, earnedXP = 50) {
  this.lessonsCompleted += 1;
  return await this.addXP(earnedXP, 'lesson');
};

UserSchema.methods.passQuiz = async function(quizId, score, earnedXP = 100) {
  this.quizzesPassed += 1;
  return await this.addXP(earnedXP, 'quiz');
};

UserSchema.methods.completeSimulation = async function(simId, performance, earnedXP = 75) {
  this.simulationsCompleted += 1;
  return await this.addXP(earnedXP, 'simulation');
};

UserSchema.methods.runCalculation = async function(calcType, earnedXP = 10) {
  this.calculationsRun += 1;
  if (this.calculationsRun % 5 === 0) { // Bonus every 5 calculations
    return await this.addXP(earnedXP + 15, 'calculation');
  }
  return await this.addXP(earnedXP, 'calculation');
};

UserSchema.methods.updateSkillLevel = function() {
  // Auto-detect skill level based on progress
  const score = this.onboardingScore || 0;
  const lessonsCount = this.lessonsCompleted || 0;
  const quizzesCount = this.quizzesPassed || 0;
  const level = this.level || 1;
  
  if (level >= 20 || lessonsCount >= 50 || quizzesCount >= 30) {
    this.skillLevel = 'expert';
  } else if (level >= 10 || lessonsCount >= 25 || quizzesCount >= 15 || score >= 70) {
    this.skillLevel = 'advanced';
  } else if (level >= 5 || lessonsCount >= 10 || quizzesCount >= 5 || score >= 40) {
    this.skillLevel = 'intermediate';
  } else if (lessonsCount >= 3 || quizzesCount >= 1 || score >= 20) {
    this.skillLevel = 'beginner';
  } else {
    this.skillLevel = 'new';
  }
};

UserSchema.methods.generateReferralCode = function() {
  if (!this.referralCode) {
    this.referralCode = `INV${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
  return this.referralCode;
};

UserSchema.methods.canAccessFeature = function(feature) {
  const tierAccess = {
    free: ['lessons-basic', 'calculators-basic', 'simulator-basic'],
    basic: ['lessons-all', 'calculators-all', 'simulator-intermediate', 'ai-insights-basic'],
    pro: ['lessons-all', 'calculators-all', 'simulator-advanced', 'ai-insights-full', 'advanced-charts', 'leaderboards'],
    expert: ['all-features', 'priority-support', 'custom-analysis', 'api-access']
  };
  
  const allowedFeatures = tierAccess[this.subscriptionTier] || tierAccess.free;
  return allowedFeatures.includes(feature) || allowedFeatures.includes('all-features');
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
