const mongoose = require('mongoose');

/**
 * Friend Request Schema
 */
const FriendRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: String
  },
  receiver: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'cancelled'],
    default: 'pending'
  },
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: Date
});

// Indexes
FriendRequestSchema.index({ 'sender.userId': 1, status: 1 });
FriendRequestSchema.index({ 'receiver.userId': 1, status: 1 });
// Removed explicit index on requestId (duplicate). Mongoose creates a unique index automatically from the field definition.

/**
 * Friendship Schema
 */
const FriendshipSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique friendships (prevent duplicates)
FriendshipSchema.index({ user1: 1, user2: 1 }, { unique: true });

/**
 * Helper method to check if friendship exists
 */
FriendshipSchema.statics.areFriends = async function(userId1, userId2) {
  const friendship = await this.findOne({
    $or: [
      { user1: userId1, user2: userId2 },
      { user1: userId2, user2: userId1 }
    ]
  });
  return !!friendship;
};

/**
 * Get all friends of a user
 */
FriendshipSchema.statics.getFriends = async function(userId) {
  const friendships = await this.find({
    $or: [
      { user1: userId },
      { user2: userId }
    ]
  }).populate('user1 user2', 'username email');
  
  // Extract friend user objects
  return friendships.map(f => {
    if (f.user1._id.toString() === userId.toString()) {
      return f.user2;
    } else {
      return f.user1;
    }
  });
};

/**
 * Get friend count
 */
FriendshipSchema.statics.getFriendCount = async function(userId) {
  return await this.countDocuments({
    $or: [
      { user1: userId },
      { user2: userId }
    ]
  });
};

const FriendRequest = mongoose.model('FriendRequest', FriendRequestSchema);
const Friendship = mongoose.model('Friendship', FriendshipSchema);

module.exports = {
  FriendRequest,
  Friendship
};
