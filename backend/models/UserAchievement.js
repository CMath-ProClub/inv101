const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  isUnlocked: {
    type: Boolean,
    default: false
  },
  unlockedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for user-specific achievement queries
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
userAchievementSchema.index({ userId: 1, isUnlocked: 1 });

// Method to unlock achievement
userAchievementSchema.methods.unlock = function() {
  if (!this.isUnlocked) {
    this.isUnlocked = true;
    this.unlockedAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to update progress
userAchievementSchema.methods.updateProgress = async function(newProgress) {
  this.progress = newProgress;
  
  // Auto-unlock if criteria met
  const achievement = await mongoose.model('Achievement').findById(this.achievementId);
  if (achievement && this.progress >= achievement.criteria.target && !this.isUnlocked) {
    return this.unlock();
  }
  
  return this.save();
};

const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);

module.exports = UserAchievement;
