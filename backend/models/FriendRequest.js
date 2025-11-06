/**
 * FriendRequest Model
 * Handles friend request data structure
 */

const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
friendRequestSchema.index({ sender: 1, recipient: 1 });
friendRequestSchema.index({ recipient: 1, status: 1 });
friendRequestSchema.index({ sender: 1, status: 1 });

// Update the updatedAt timestamp before saving
friendRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FriendRequest', friendRequestSchema);
