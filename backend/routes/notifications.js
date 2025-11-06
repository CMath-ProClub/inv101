const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');

// Get user's notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type, isRead, limit = 50, offset = 0 } = req.query;
    
    const query = { userId: req.user.id };
    
    if (type) {
      query.type = type;
    }
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();
    
    const totalCount = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.id, 
      isRead: false 
    });
    
    res.json({
      success: true,
      notifications,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch notifications' 
    });
  }
});

// Mark notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        error: 'Notification not found' 
      });
    }
    
    await notification.markAsRead();
    
    res.json({ 
      success: true, 
      notification 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to mark notification as read' 
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { 
        $set: { 
          isRead: true, 
          readAt: new Date() 
        } 
      }
    );
    
    res.json({ 
      success: true, 
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to mark notifications as read' 
    });
  }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await Notification.deleteOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Notification not found' 
      });
    }
    
    res.json({ 
      success: true 
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete notification' 
    });
  }
});

// Get notification counts by type
router.get('/counts', authMiddleware, async (req, res) => {
  try {
    const counts = await Notification.aggregate([
      { $match: { userId: req.user.id, isRead: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    const countsByType = counts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    
    const totalUnread = counts.reduce((sum, item) => sum + item.count, 0);
    
    res.json({
      success: true,
      counts: countsByType,
      totalUnread
    });
  } catch (error) {
    console.error('Error fetching notification counts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch notification counts' 
    });
  }
});

module.exports = router;
