const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['friend_request', 'friend_accepted', 'achievement', 'lesson', 'portfolio', 'trade', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(userId, type, title, message, data = {}) {
  const notification = new this({
    userId,
    type,
    title,
    message,
    data,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expire after 30 days
  });
  
  await notification.save();
  
  // Emit socket event if socket service exists
  if (global.io) {
    global.io.to(`user_${userId}`).emit('new_notification', notification);
  }
  
  return notification;
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
