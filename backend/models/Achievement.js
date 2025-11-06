const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
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
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['trading', 'learning', 'social', 'milestones'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  criteria: {
    type: {
      type: String,
      enum: ['count', 'value', 'streak', 'completion', 'custom'],
      required: true
    },
    metric: String, // e.g., 'trades', 'portfolio_value', 'lessons'
    target: Number, // target value to achieve
    comparison: {
      type: String,
      enum: ['gte', 'lte', 'eq'],
      default: 'gte'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
achievementSchema.index({ category: 1, isActive: 1 });
achievementSchema.index({ name: 1 });

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;
