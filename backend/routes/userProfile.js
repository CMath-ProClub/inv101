const express = require('express');
const router = express.Router();
const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');
const LessonProgress = require('../models/LessonProgress');

// Get user profile with gamification stats
router.get('/users/:userId/gamification', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-passwordHash -refreshTokens');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Get additional stats
    const lessonProgress = await LessonProgress.find({ userId });
    const quizAttempts = await QuizAttempt.find({ userId, passed: true });
    
    const stats = {
      lessonsCompleted: lessonProgress.filter(p => p.status === 'completed').length,
      lessonsInProgress: lessonProgress.filter(p => p.status === 'in-progress').length,
      quizzesPassed: quizAttempts.length,
      totalTimeSpent: lessonProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
      averageQuizScore: quizAttempts.length > 0 
        ? Math.round(quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length)
        : 0
    };
    
    res.json({
      success: true,
      user: {
        ...user.toObject(),
        stats,
        xpForNextLevel: user.getXPForNextLevel()
      }
    });
  } catch (error) {
    console.error('Error fetching user gamification:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user gamification' });
  }
});

// Update user skill level preferences
router.patch('/users/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    const { skillLevel, preferredTopics, learningGoals, riskTolerance } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    if (skillLevel) user.skillLevel = skillLevel;
    if (preferredTopics) user.preferredTopics = preferredTopics;
    if (learningGoals) user.learningGoals = learningGoals;
    if (riskTolerance) user.riskTolerance = riskTolerance;
    
    await user.save();
    
    res.json({ success: true, user: user.toObject() });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'xp', limit = 100 } = req.query;
    
    let sortBy = {};
    if (type === 'xp') sortBy = { xp: -1, level: -1 };
    else if (type === 'streak') sortBy = { streak: -1, xp: -1 };
    else if (type === 'lessons') sortBy = { lessonsCompleted: -1, xp: -1 };
    else if (type === 'performance') sortBy = { performancePercent: -1, portfolioValue: -1 };
    
    const users = await User.find({ isPublic: true })
      .select('username displayName avatar xp level streak lessonsCompleted portfolioValue performancePercent badges')
      .sort(sortBy)
      .limit(parseInt(limit));
    
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      username: user.username || user.displayName,
      avatar: user.avatar,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      lessonsCompleted: user.lessonsCompleted,
      portfolioValue: user.portfolioValue,
      performancePercent: user.performancePercent,
      badges: user.badges
    }));
    
    res.json({ success: true, leaderboard, type });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
});

// Award manual XP (for specific actions like calculations)
router.post('/users/:userId/award-xp', async (req, res) => {
  try {
    const { userId } = req.params;
    const { points, source = 'general', action } = req.body;
    
    if (!points || points <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid XP amount' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Handle specific actions
    if (action === 'calculation') {
      const result = await user.runCalculation(source, points);
      return res.json({
        success: true,
        xpAwarded: points,
        levelUp: result.leveledUp,
        newLevel: result.newLevel,
        user: {
          xp: user.xp,
          level: user.level,
          calculationsRun: user.calculationsRun
        }
      });
    } else if (action === 'simulation') {
      const result = await user.completeSimulation(source, {}, points);
      return res.json({
        success: true,
        xpAwarded: points,
        levelUp: result.leveledUp,
        newLevel: result.newLevel,
        user: {
          xp: user.xp,
          level: user.level,
          simulationsCompleted: user.simulationsCompleted
        }
      });
    }
    
    // General XP award
    const result = await user.addXP(points, source);
    
    res.json({
      success: true,
      xpAwarded: points,
      levelUp: result.leveledUp,
      newLevel: result.newLevel,
      user: {
        xp: user.xp,
        level: user.level,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
    res.status(500).json({ success: false, error: 'Failed to award XP' });
  }
});

// Generate and get referral code
router.post('/users/:userId/referral-code', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const referralCode = user.generateReferralCode();
    await user.save();
    
    res.json({
      success: true,
      referralCode,
      referralLink: `${req.protocol}://${req.get('host')}/signup?ref=${referralCode}`
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    res.status(500).json({ success: false, error: 'Failed to generate referral code' });
  }
});

// Check feature access
router.get('/users/:userId/can-access/:feature', async (req, res) => {
  try {
    const { userId, feature} = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const canAccess = user.canAccessFeature(feature);
    
    res.json({
      success: true,
      canAccess,
      subscriptionTier: user.subscriptionTier,
      feature
    });
  } catch (error) {
    console.error('Error checking feature access:', error);
    res.status(500).json({ success: false, error: 'Failed to check feature access' });
  }
});

module.exports = router;
