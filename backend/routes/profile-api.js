/**
 * Profile API Routes
 * Handles profile management, friend requests, and social features
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to ensure user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// ============================================
// Profile Routes
// ============================================

/**
 * GET /api/profile
 * Get current user's profile
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .select('-password')
      .populate('friends', 'name userId avatar badge');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      userId: user.userId,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      badge: user.badge,
      level: user.level,
      lessonsCompleted: user.lessonsCompleted,
      totalLessons: 25,
      achievements: user.achievements,
      highScores: user.highScores,
      friends: user.friends,
      privacy: user.privacy,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * GET /api/profile/:userId
 * Get another user's profile (respects privacy settings)
 */
router.get('/profile/:userId', requireAuth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;
    
    const user = await User.findOne({ userId: targetUserId })
      .select('-password -email');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check privacy settings
    if (user.privacy === 'private' && user._id.toString() !== currentUserId.toString()) {
      return res.status(403).json({ error: 'This profile is private' });
    }

    if (user.privacy === 'friends') {
      const isFriend = user.friends.some(f => f.toString() === currentUserId.toString());
      if (!isFriend && user._id.toString() !== currentUserId.toString()) {
        return res.status(403).json({ error: 'This profile is only visible to friends' });
      }
    }

    res.json({
      id: user._id,
      name: user.name,
      userId: user.userId,
      avatar: user.avatar,
      bio: user.bio,
      badge: user.badge,
      level: user.level,
      achievements: user.achievements,
      highScores: user.highScores
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PATCH /api/profile/update
 * Update current user's profile
 */
router.patch('/profile/update', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, bio, privacy } = req.body;
    
    const updates = {};
    if (name) updates.name = name.trim().substring(0, 50);
    if (bio !== undefined) updates.bio = bio.trim().substring(0, 100);
    if (privacy && ['public', 'friends', 'private'].includes(privacy)) {
      updates.privacy = privacy;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        bio: user.bio,
        privacy: user.privacy
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * POST /api/profile/avatar
 * Upload profile picture
 */
router.post('/profile/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user._id;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select('avatar');

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

/**
 * Generate unique user ID for new users
 * Format: INV101-[Initials]-[Code]
 */
function generateUserId(firstName, lastName) {
  const initials = (firstName[0] + lastName[0]).toUpperCase();
  const code = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `INV101-${initials}-${code}`;
}

module.exports = { router, generateUserId };
