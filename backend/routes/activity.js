const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Get activity feed (friends' activities)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type, limit = 50, offset = 0 } = req.query;
    
    // Get user's friends
    const user = await User.findById(req.user.id).select('friends');
    
    if (!user || !user.friends || user.friends.length === 0) {
      return res.json({
        success: true,
        activities: [],
        pagination: {
          total: 0,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    }
    
    const query = {
      userId: { $in: user.friends },
      visibility: { $in: ['public', 'friends'] }
    };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('userId', 'username email profilePicture')
      .lean();
    
    const totalCount = await Activity.countDocuments(query);
    
    res.json({
      success: true,
      activities,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch activity feed' 
    });
  }
});

// Get user's own activities
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { type, limit = 50, offset = 0 } = req.query;
    
    const query = { userId: req.user.id };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();
    
    const totalCount = await Activity.countDocuments(query);
    
    res.json({
      success: true,
      activities,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user activities' 
    });
  }
});

// Create activity (internal use)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, action, data, visibility = 'friends' } = req.body;
    
    if (!type || !action) {
      return res.status(400).json({ 
        success: false, 
        error: 'Type and action are required' 
      });
    }
    
    const activity = await Activity.createActivity(
      req.user.id,
      type,
      action,
      data,
      visibility
    );
    
    res.json({ 
      success: true, 
      activity 
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create activity' 
    });
  }
});

module.exports = router;
