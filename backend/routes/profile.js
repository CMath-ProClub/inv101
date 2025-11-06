const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Get current user's profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-passwordHash -refreshTokens')
      .populate('following', 'username displayName avatar')
      .populate('followers', 'username displayName avatar');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        location: user.location,
        website: user.website,
        isPublic: user.isPublic,
        provider: user.provider,
        createdAt: user.createdAt,
        totalTrades: user.totalTrades,
        portfolioValue: user.portfolioValue,
        performancePercent: user.performancePercent,
        rank: user.rank,
        badges: user.badges,
        following: user.following,
        followers: user.followers,
        followingCount: user.following.length,
        followersCount: user.followers.length
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Unable to load profile' });
  }
});

// Update current user's profile
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const {
      displayName,
      bio,
      avatar,
      location,
      website,
      isPublic
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update allowed fields
    if (displayName !== undefined) user.displayName = displayName.trim();
    if (bio !== undefined) user.bio = bio.trim().substring(0, 500);
    if (avatar !== undefined) user.avatar = avatar;
    if (location !== undefined) user.location = location.trim().substring(0, 100);
    if (website !== undefined) user.website = website.trim().substring(0, 200);
    if (isPublic !== undefined) user.isPublic = Boolean(isPublic);

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        location: user.location,
        website: user.website,
        isPublic: user.isPublic
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Unable to update profile' });
  }
});

// Get any user's public profile
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-passwordHash -refreshTokens -email')
      .populate('following', 'username displayName avatar')
      .populate('followers', 'username displayName avatar');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if profile is public
    if (!user.isPublic && (!req.userId || req.userId !== user._id.toString())) {
      return res.status(403).json({ success: false, error: 'This profile is private' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        location: user.location,
        website: user.website,
        createdAt: user.createdAt,
        totalTrades: user.totalTrades,
        portfolioValue: user.portfolioValue,
        performancePercent: user.performancePercent,
        rank: user.rank,
        badges: user.badges,
        followingCount: user.following.length,
        followersCount: user.followers.length,
        isFollowing: req.userId ? user.followers.some(f => f._id.toString() === req.userId) : false
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ success: false, error: 'Unable to load profile' });
  }
});

// Follow a user
router.post('/:username/follow', authMiddleware, async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    const currentUser = await User.findById(req.userId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (targetUser._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ success: false, error: 'Cannot follow yourself' });
    }

    // Check if already following
    if (currentUser.following.includes(targetUser._id)) {
      return res.status(400).json({ success: false, error: 'Already following this user' });
    }

    // Add to following/followers
    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUser._id);

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ success: true, message: 'Now following ' + targetUser.displayName });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ success: false, error: 'Unable to follow user' });
  }
});

// Unfollow a user
router.post('/:username/unfollow', authMiddleware, async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    const currentUser = await User.findById(req.userId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Remove from following/followers
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== targetUser._id.toString()
    );
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ success: true, message: 'Unfollowed ' + targetUser.displayName });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ success: false, error: 'Unable to unfollow user' });
  }
});

// Get leaderboard
router.get('/leaderboard/top', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);

    const users = await User.find({ isPublic: true })
      .select('username displayName avatar portfolioValue performancePercent totalTrades rank badges')
      .sort({ performancePercent: -1, portfolioValue: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      leaderboard: users.map((user, index) => ({
        rank: skip + index + 1,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        portfolioValue: user.portfolioValue,
        performancePercent: user.performancePercent,
        totalTrades: user.totalTrades,
        badges: user.badges
      }))
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Unable to load leaderboard' });
  }
});

// Search users
router.get('/search/users', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.status(400).json({ success: false, error: 'Search query required' });
    }

    const users = await User.find({
      isPublic: true,
      $or: [
        { username: new RegExp(query, 'i') },
        { displayName: new RegExp(query, 'i') }
      ]
    })
    .select('username displayName avatar bio performancePercent')
    .limit(20);

    res.json({
      success: true,
      users: users.map(user => ({
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        performancePercent: user.performancePercent
      }))
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, error: 'Unable to search users' });
  }
});

module.exports = router;
