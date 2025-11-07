const express = require('express');
const router = express.Router();
const LessonProgress = require('../models/LessonProgress');
const User = require('../models/User');

// Get user's lesson progress (all or filtered by category)
router.get('/users/:userId/lesson-progress', async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, status } = req.query;
    
    const filter = { userId };
    if (category) filter.lessonCategory = category;
    if (status) filter.status = status;
    
    const progress = await LessonProgress.find(filter).sort({ lastAccessedAt: -1 });
    
    // Calculate stats
    const stats = {
      total: progress.length,
      completed: progress.filter(p => p.status === 'completed').length,
      inProgress: progress.filter(p => p.status === 'in-progress').length,
      totalTimeSpent: progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0)
    };
    
    res.json({ success: true, progress, stats });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch lesson progress' });
  }
});

// Get specific lesson progress
router.get('/users/:userId/lessons/:lessonId', async (req, res) => {
  try {
    const { userId, lessonId } = req.params;
    
    let progress = await LessonProgress.findOne({ userId, lessonId });
    
    // Create if doesn't exist
    if (!progress) {
      progress = new LessonProgress({
        userId,
        lessonId,
        status: 'not-started'
      });
    }
    
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch lesson progress' });
  }
});

// Update lesson progress
router.post('/users/:userId/lessons/:lessonId/progress', async (req, res) => {
  try {
    const { userId, lessonId } = req.params;
    const { status, progress, timeSpent, lessonTitle, lessonCategory, checkpointId, bookmarked, rating } = req.body;
    
    // Find or create progress entry
    let lessonProgress = await LessonProgress.findOne({ userId, lessonId });
    
    if (!lessonProgress) {
      lessonProgress = new LessonProgress({
        userId,
        lessonId,
        lessonTitle,
        lessonCategory: lessonCategory || 'foundations'
      });
    }
    
    // Update fields
    if (status) lessonProgress.status = status;
    if (typeof progress === 'number') lessonProgress.progress = Math.min(100, Math.max(0, progress));
    if (typeof timeSpent === 'number') lessonProgress.timeSpent += timeSpent;
    if (lessonTitle) lessonProgress.lessonTitle = lessonTitle;
    if (lessonCategory) lessonProgress.lessonCategory = lessonCategory;
    if (typeof bookmarked === 'boolean') lessonProgress.bookmarked = bookmarked;
    if (rating) lessonProgress.rating = rating;
    
    // Add checkpoint if provided
    if (checkpointId && !lessonProgress.checkpointsCompleted.includes(checkpointId)) {
      lessonProgress.checkpointsCompleted.push(checkpointId);
    }
    
    // Mark as completed if progress is 100%
    if (lessonProgress.progress >= 100 && lessonProgress.status !== 'completed') {
      lessonProgress.status = 'completed';
      lessonProgress.completedAt = new Date();
      
      // Award XP to user
      const user = await User.findById(userId);
      if (user) {
        const xpResult = await user.completeLesson(lessonId, 50);
        
        return res.json({
          success: true,
          progress: lessonProgress,
          xpAwarded: 50,
          levelUp: xpResult.leveledUp,
          newLevel: xpResult.newLevel
        });
      }
    }
    
    lessonProgress.lastAccessedAt = new Date();
    await lessonProgress.save();
    
    res.json({ success: true, progress: lessonProgress });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({ success: false, error: 'Failed to update lesson progress' });
  }
});

// Mark lesson as complete
router.post('/users/:userId/lessons/:lessonId/complete', async (req, res) => {
  try {
    const { userId, lessonId } = req.params;
    const { timeSpent, lessonTitle, lessonCategory } = req.body;
    
    let lessonProgress = await LessonProgress.findOne({ userId, lessonId });
    
    if (!lessonProgress) {
      lessonProgress = new LessonProgress({
        userId,
        lessonId,
        lessonTitle: lessonTitle || 'Lesson',
        lessonCategory: lessonCategory || 'foundations'
      });
    }
    
    lessonProgress.status = 'completed';
    lessonProgress.progress = 100;
    lessonProgress.completedAt = new Date();
    if (timeSpent) lessonProgress.timeSpent += timeSpent;
    
    await lessonProgress.save();
    
    // Award XP
    const user = await User.findById(userId);
    if (user) {
      const xpResult = await user.completeLesson(lessonId, 50);
      
      return res.json({
        success: true,
        progress: lessonProgress,
        xpAwarded: 50,
        levelUp: xpResult.leveledUp,
        newLevel: xpResult.newLevel,
        user: {
          xp: user.xp,
          level: user.level,
          lessonsCompleted: user.lessonsCompleted,
          streak: user.streak
        }
      });
    }
    
    res.json({ success: true, progress: lessonProgress });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({ success: false, error: 'Failed to complete lesson' });
  }
});

// Get lesson completion stats by category
router.get('/users/:userId/lesson-stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const allProgress = await LessonProgress.find({ userId });
    
    const statsByCategory = {
      foundations: { total: 0, completed: 0, inProgress: 0 },
      instruments: { total: 0, completed: 0, inProgress: 0 },
      market: { total: 0, completed: 0, inProgress: 0 },
      practical: { total: 0, completed: 0, inProgress: 0 },
      advanced: { total: 0, completed: 0, inProgress: 0 }
    };
    
    allProgress.forEach(p => {
      const cat = p.lessonCategory || 'foundations';
      if (statsByCategory[cat]) {
        statsByCategory[cat].total++;
        if (p.status === 'completed') statsByCategory[cat].completed++;
        if (p.status === 'in-progress') statsByCategory[cat].inProgress++;
      }
    });
    
    const totalTimeSpent = allProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const completedCount = allProgress.filter(p => p.status === 'completed').length;
    
    res.json({
      success: true,
      stats: {
        byCategory: statsByCategory,
        overall: {
          totalLessons: allProgress.length,
          completed: completedCount,
          inProgress: allProgress.filter(p => p.status === 'in-progress').length,
          totalTimeSpent,
          averageTimePerLesson: allProgress.length > 0 ? Math.round(totalTimeSpent / allProgress.length) : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching lesson stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch lesson stats' });
  }
});

module.exports = router;
