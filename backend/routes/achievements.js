const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const { getClerkUser } = require('../clerkAuth');

// Get all achievements with user progress
router.get('/', ...getClerkUser, async (req, res) => {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { category } = req.query;
    
    const query = { isActive: true };
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const achievements = await Achievement.find(query).sort({ rarity: 1, name: 1 });
    
    // Get user's progress for these achievements
    const userAchievements = await UserAchievement.find({
      userId,
      achievementId: { $in: achievements.map(a => a._id) }
    });
    
    // Merge achievements with user progress
    const achievementsWithProgress = achievements.map(achievement => {
      const userAchievement = userAchievements.find(
        ua => ua.achievementId.toString() === achievement._id.toString()
      );
      
      return {
        ...achievement.toObject(),
        progress: userAchievement?.progress || 0,
        isUnlocked: userAchievement?.isUnlocked || false,
        unlockedAt: userAchievement?.unlockedAt
      };
    });
    
    // Calculate stats
    const totalAchievements = achievements.length;
    const unlockedCount = userAchievements.filter(ua => ua.isUnlocked).length;
    const totalPoints = userAchievements
      .filter(ua => ua.isUnlocked)
      .reduce((sum, ua) => {
        const achievement = achievements.find(a => a._id.toString() === ua.achievementId.toString());
        return sum + (achievement?.points || 0);
      }, 0);
    
    res.json({
      success: true,
      achievements: achievementsWithProgress,
      stats: {
        total: totalAchievements,
        unlocked: unlockedCount,
        completion: totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0,
        totalPoints
      }
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch achievements' 
    });
  }
});

// Get specific achievement with progress
router.get('/:id', ...getClerkUser, async (req, res) => {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ 
        success: false, 
        error: 'Achievement not found' 
      });
    }
    
    const userAchievement = await UserAchievement.findOne({
      userId,
      achievementId: achievement._id
    });
    
    res.json({
      success: true,
      achievement: {
        ...achievement.toObject(),
        progress: userAchievement?.progress || 0,
        isUnlocked: userAchievement?.isUnlocked || false,
        unlockedAt: userAchievement?.unlockedAt
      }
    });
  } catch (error) {
    console.error('Error fetching achievement:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch achievement' 
    });
  }
});

// Update achievement progress (internal use, could be protected)
router.post('/:id/progress', ...getClerkUser, async (req, res) => {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { progress } = req.body;
    
    if (typeof progress !== 'number') {
      return res.status(400).json({ 
        success: false, 
        error: 'Progress must be a number' 
      });
    }
    
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ 
        success: false, 
        error: 'Achievement not found' 
      });
    }
    
    let userAchievement = await UserAchievement.findOne({
      userId,
      achievementId: achievement._id
    });
    
    if (!userAchievement) {
      userAchievement = new UserAchievement({
        userId,
        achievementId: achievement._id,
        progress: 0
      });
    }
    
    await userAchievement.updateProgress(progress);
    
    // Check if just unlocked
    const justUnlocked = userAchievement.isUnlocked && 
      userAchievement.unlockedAt > new Date(Date.now() - 1000); // Within last second
    
    if (justUnlocked) {
      // Create notification
      const Notification = require('../models/Notification');
      await Notification.createNotification(
        userId,
        'achievement',
        'Achievement Unlocked!',
        `You've unlocked the "${achievement.title}" achievement!`,
        { achievementId: achievement._id, name: achievement.name }
      );
      
      // Create activity
      const Activity = require('../models/Activity');
      await Activity.createActivity(
        userId,
        'achievement',
        `Unlocked the "${achievement.title}" achievement`,
        { achievementId: achievement._id, rarity: achievement.rarity }
      );
    }
    
    res.json({ 
      success: true, 
      userAchievement,
      justUnlocked
    });
  } catch (error) {
    console.error('Error updating achievement progress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update achievement progress' 
    });
  }
});

// Get recently unlocked achievements
router.get('/recent/unlocked', ...getClerkUser, async (req, res) => {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { limit = 10 } = req.query;
    
    const recentAchievements = await UserAchievement.find({
      userId,
      isUnlocked: true
    })
      .sort({ unlockedAt: -1 })
      .limit(parseInt(limit))
      .populate('achievementId');
    
    res.json({
      success: true,
      achievements: recentAchievements.map(ua => ({
        ...ua.achievementId.toObject(),
        unlockedAt: ua.unlockedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching recent achievements:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch recent achievements' 
    });
  }
});

module.exports = router;
