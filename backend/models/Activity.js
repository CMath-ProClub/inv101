const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['trade', 'lesson', 'achievement', 'friend', 'milestone'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  visibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'friends'
  }
}, {
  timestamps: true
});

// Index for efficient queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

// Static method to create activity
activitySchema.statics.createActivity = async function(userId, type, action, data = {}, visibility = 'friends') {
  const activity = new this({
    userId,
    type,
    action,
    data,
    visibility
  });
  
  await activity.save();
  
  // Emit socket event for real-time updates
  if (global.io) {
    // Get user's friends to broadcast activity
    const User = mongoose.model('User');
    const user = await User.findById(userId).select('friends');
    
    if (user && user.friends) {
      user.friends.forEach(friendId => {
        global.io.to(`user_${friendId}`).emit('friend_activity', {
          activity: activity.toObject(),
          user: { id: userId }
        });
      });
    }
  }
  
  return activity;
};

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
