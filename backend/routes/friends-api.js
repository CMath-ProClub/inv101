/**
 * Friends API Routes
 * Handles friend requests, friend lists, and social features
 */

const express = require('express');
const router = express.Router();

// Middleware to ensure user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

/**
 * GET /api/friends/list
 * Get user's friends list
 */
router.get('/list', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const User = require('../models/User');
    
    const user = await User.findById(userId)
      .populate({
        path: 'friends',
        select: 'name userId avatar badge lastActive portfolioValue portfolioChange',
        options: { sort: { lastActive: -1 } }
      });

    const friends = user.friends.map(friend => ({
      id: friend._id,
      name: friend.name,
      userId: friend.userId,
      avatar: friend.avatar,
      badge: friend.badge,
      isOnline: friend.lastActive && (Date.now() - friend.lastActive.getTime()) < 300000, // 5 min
      lastActive: friend.lastActive,
      portfolioValue: friend.portfolioValue,
      portfolioChange: friend.portfolioChange
    }));

    res.json({ friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

/**
 * POST /api/friends/request/:targetUserId
 * Send friend request
 */
router.post('/request/:targetUserId', requireAuth, async (req, res) => {
  try {
    const senderId = req.user._id;
    const targetUserId = req.params.targetUserId;
    
    const User = require('../models/User');
    const FriendRequest = require('../models/FriendRequest');

    // Find target user by custom userId
    const targetUser = await User.findOne({ userId: targetUserId });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already friends
    const sender = await User.findById(senderId);
    if (sender.friends.includes(targetUser._id)) {
      return res.status(400).json({ error: 'Already friends' });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      recipient: targetUser._id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }

    // Create friend request
    const friendRequest = new FriendRequest({
      sender: senderId,
      recipient: targetUser._id,
      status: 'pending'
    });

    await friendRequest.save();

    res.json({
      message: 'Friend request sent successfully',
      request: {
        id: friendRequest._id,
        recipientName: targetUser.name,
        recipientUserId: targetUser.userId
      }
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

/**
 * GET /api/friends/requests
 * Get friend requests (incoming and sent)
 */
router.get('/requests', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const FriendRequest = require('../models/FriendRequest');

    // Get incoming requests
    const incomingRequests = await FriendRequest.find({
      recipient: userId,
      status: 'pending'
    })
      .populate('sender', 'name userId avatar badge')
      .sort({ createdAt: -1 });

    // Get sent requests
    const sentRequests = await FriendRequest.find({
      sender: userId,
      status: 'pending'
    })
      .populate('recipient', 'name userId avatar badge')
      .sort({ createdAt: -1 });

    res.json({
      incoming: incomingRequests.map(req => ({
        id: req._id,
        sender: {
          id: req.sender._id,
          name: req.sender.name,
          userId: req.sender.userId,
          avatar: req.sender.avatar,
          badge: req.sender.badge
        },
        createdAt: req.createdAt
      })),
      sent: sentRequests.map(req => ({
        id: req._id,
        recipient: {
          id: req.recipient._id,
          name: req.recipient.name,
          userId: req.recipient.userId,
          avatar: req.recipient.avatar,
          badge: req.recipient.badge
        },
        createdAt: req.createdAt
      }))
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
});

/**
 * POST /api/friends/accept/:requestId
 * Accept friend request
 */
router.post('/accept/:requestId', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const requestId = req.params.requestId;
    
    const User = require('../models/User');
    const FriendRequest = require('../models/FriendRequest');

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Verify user is the recipient
    if (friendRequest.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    // Add to friends list (both users)
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friends: friendRequest.sender }
    });

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: userId }
    });

    // Update request status
    friendRequest.status = 'accepted';
    await friendRequest.save();

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

/**
 * POST /api/friends/decline/:requestId
 * Decline friend request
 */
router.post('/decline/:requestId', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const requestId = req.params.requestId;
    
    const FriendRequest = require('../models/FriendRequest');

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (friendRequest.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    friendRequest.status = 'declined';
    await friendRequest.save();

    res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('Decline friend request error:', error);
    res.status(500).json({ error: 'Failed to decline friend request' });
  }
});

/**
 * DELETE /api/friends/:friendId
 * Remove friend
 */
router.delete('/:friendId', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const friendId = req.params.friendId;
    
    const User = require('../models/User');

    // Remove from both users' friends lists
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId }
    });

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

/**
 * GET /api/friends/search
 * Search for users by userId
 */
router.get('/search', requireAuth, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const User = require('../models/User');

    const users = await User.find({
      userId: { $regex: query, $options: 'i' },
      _id: { $ne: req.user._id } // Exclude current user
    })
      .select('name userId avatar badge')
      .limit(10);

    res.json({
      results: users.map(user => ({
        id: user._id,
        name: user.name,
        userId: user.userId,
        avatar: user.avatar,
        badge: user.badge
      }))
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

module.exports = router;
