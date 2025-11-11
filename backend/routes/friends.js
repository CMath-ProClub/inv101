const express = require('express');
const router = express.Router();
const { FriendRequest, Friendship } = require('../models/Friend');
const User = require('../models/User');

/**
 * GET /api/friends/:userId
 * Get user's friends list
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const friends = await Friendship.getFriends(userId);
    
    res.json({
      success: true,
      friends: friends.map(f => ({
        userId: f._id,
        username: f.username,
        email: f.email
      }))
    });
  } catch (error) {
    console.error('Error getting friends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get friends list'
    });
  }
});

/**
 * GET /api/friends/:userId/count
 * Get friend count
 */
router.get('/:userId/count', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const count = await Friendship.getFriendCount(userId);
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting friend count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get friend count'
    });
  }
});

/**
 * GET /api/friends/search?q=username
 * Search for users by username
 */
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        users: []
      });
    }
    
    // Search for users by username (case-insensitive)
    const users = await User.find({
      username: { $regex: q, $options: 'i' }
    })
    .select('username email')
    .limit(parseInt(limit));
    
    res.json({
      success: true,
      users: users.map(u => ({
        userId: u._id,
        username: u.username,
        email: u.email
      }))
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search users'
    });
  }
});

/**
 * POST /api/friends/request
 * Send friend request
 */
router.post('/request', async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    
    // Check if users exist
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    
    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Can't friend yourself
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot send friend request to yourself'
      });
    }
    
    // Check if already friends
    const alreadyFriends = await Friendship.areFriends(senderId, receiverId);
    if (alreadyFriends) {
      return res.status(400).json({
        success: false,
        error: 'Already friends'
      });
    }
    
    // Check for existing pending request
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { 'sender.userId': senderId, 'receiver.userId': receiverId, status: 'pending' },
        { 'sender.userId': receiverId, 'receiver.userId': senderId, status: 'pending' }
      ]
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: 'Friend request already pending'
      });
    }
    
    // Create friend request
    const requestId = `friend-req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const friendRequest = new FriendRequest({
      requestId,
      sender: {
        userId: senderId,
        username: sender.username || `User ${senderId.slice(-4)}`
      },
      receiver: {
        userId: receiverId,
        username: receiver.username || `User ${receiverId.slice(-4)}`
      },
      message
    });
    
    await friendRequest.save();
    
    // TODO: Send notification to receiver
    
    res.json({
      success: true,
      request: friendRequest
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send friend request'
    });
  }
});

/**
 * POST /api/friends/request/:requestId/accept
 * Accept friend request
 */
router.post('/request/:requestId/accept', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.body;
    
    const request = await FriendRequest.findOne({ requestId });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Friend request not found'
      });
    }
    
    // Must be the receiver
    if (request.receiver.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to accept this request'
      });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Request is no longer pending'
      });
    }
    
    // Create friendship
    const friendship = new Friendship({
      user1: request.sender.userId,
      user2: request.receiver.userId
    });
    
    await friendship.save();
    
    // Update request status
    request.status = 'accepted';
    request.respondedAt = new Date();
    await request.save();
    
    res.json({
      success: true,
      message: 'Friend request accepted',
      friendship
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept friend request'
    });
  }
});

/**
 * POST /api/friends/request/:requestId/decline
 * Decline friend request
 */
router.post('/request/:requestId/decline', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.body;
    
    const request = await FriendRequest.findOne({ requestId });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Friend request not found'
      });
    }
    
    // Must be the receiver
    if (request.receiver.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }
    
    request.status = 'declined';
    request.respondedAt = new Date();
    await request.save();
    
    res.json({
      success: true,
      message: 'Friend request declined'
    });
  } catch (error) {
    console.error('Error declining friend request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to decline friend request'
    });
  }
});

/**
 * DELETE /api/friends/request/:requestId/cancel
 * Cancel friend request (sender only)
 */
router.delete('/request/:requestId/cancel', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.body;
    
    const request = await FriendRequest.findOne({ requestId });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Friend request not found'
      });
    }
    
    // Must be the sender
    if (request.sender.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }
    
    request.status = 'cancelled';
    await request.save();
    
    res.json({
      success: true,
      message: 'Friend request cancelled'
    });
  } catch (error) {
    console.error('Error cancelling friend request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel friend request'
    });
  }
});

/**
 * GET /api/friends/requests/:userId
 * Get user's friend requests
 */
router.get('/requests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'received' } = req.query; // 'received' or 'sent'
    
    let query;
    if (type === 'sent') {
      query = { 'sender.userId': userId, status: 'pending' };
    } else {
      query = { 'receiver.userId': userId, status: 'pending' };
    }
    
    const requests = await FriendRequest.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error getting friend requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get friend requests'
    });
  }
});

/**
 * DELETE /api/friends/:userId/:friendId
 * Remove friend
 */
router.delete('/:userId/:friendId', async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    
    const result = await Friendship.deleteOne({
      $or: [
        { user1: userId, user2: friendId },
        { user1: friendId, user2: userId }
      ]
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Friendship not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Friend removed'
    });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove friend'
    });
  }
});

module.exports = router;
