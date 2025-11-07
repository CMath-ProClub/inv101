const mongoose = require('mongoose');

/**
 * Challenge Model
 * Defines daily/weekly challenges for gamification
 */

const ChallengeSchema = new mongoose.Schema({
  challengeId: {
    type: String,
    required: true,
    unique: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: ['daily', 'weekly', 'special', 'community'],
    default: 'daily'
  },
  
  category: {
    type: String,
    enum: ['lessons', 'quizzes', 'calculations', 'simulations', 'streak', 'mixed'],
    required: true
  },
  
  // Challenge requirements
  requirement: {
    action: {
      type: String,
      required: true
      // e.g., 'complete-lessons', 'pass-quizzes', 'use-calculators', 'maintain-streak'
    },
    target: {
      type: Number,
      required: true
      // e.g., 3 (complete 3 lessons)
    },
    specificIds: [String]
    // Optional: specific lesson IDs, quiz IDs, etc.
  },
  
  // Rewards
  xpReward: {
    type: Number,
    default: 100
  },
  
  bonusMultiplier: {
    type: Number,
    default: 1
    // e.g., 2 for double XP challenges
  },
  
  // Challenge validity
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  // Access control
  minLevel: {
    type: Number,
    default: 1
  },
  
  requiredTier: {
    type: String,
    enum: ['free', 'basic', 'pro', 'expert'],
    default: 'free'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Tracking
  participantCount: {
    type: Number,
    default: 0
  },
  
  completionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ChallengeSchema.index({ type: 1, startDate: -1, endDate: -1 });
ChallengeSchema.index({ isActive: 1, startDate: 1 });
ChallengeSchema.index({ challengeId: 1 });

/**
 * User Challenge Progress Model
 * Tracks user progress on challenges
 */

const UserChallengeProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  challengeId: {
    type: String,
    required: true
  },
  
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'expired'],
    default: 'not-started'
  },
  
  progress: {
    current: {
      type: Number,
      default: 0
    },
    target: {
      type: Number,
      required: true
    }
  },
  
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: Date,
  
  xpAwarded: {
    type: Number,
    default: 0
  },
  
  // Track specific actions completed for this challenge
  actionsCompleted: [{
    actionType: String,
    actionId: String,
    completedAt: Date
  }]
}, {
  timestamps: true
});

// Compound index to ensure unique user-challenge pairs
UserChallengeProgressSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
UserChallengeProgressSchema.index({ userId: 1, status: 1 });
UserChallengeProgressSchema.index({ challengeId: 1, status: 1 });

// Virtual for progress percentage
UserChallengeProgressSchema.virtual('progressPercentage').get(function() {
  return Math.min(100, Math.round((this.progress.current / this.progress.target) * 100));
});

const Challenge = mongoose.model('Challenge', ChallengeSchema);
const UserChallengeProgress = mongoose.model('UserChallengeProgress', UserChallengeProgressSchema);

module.exports = {
  Challenge,
  UserChallengeProgress
};
