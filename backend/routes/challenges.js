const express = require('express');
const router = express.Router();
const { Challenge, UserChallengeProgress } = require('../models/Challenge');
const User = require('../models/User');

/**
 * GET /api/challenges/active
 * Get all active challenges
 */
router.get('/active', async (req, res) => {
  try {
    const { type, userId } = req.query;
    const now = new Date();
    
    let query = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    };
    
    if (type) {
      query.type = type;
    }
    
    const challenges = await Challenge.find(query).sort({ startDate: -1 });
    
    // If userId provided, get user's progress for each challenge
    if (userId) {
      const progressRecords = await UserChallengeProgress.find({
        userId: userId,
        challengeId: { $in: challenges.map(c => c.challengeId) }
      });
      
      const progressMap = {};
      progressRecords.forEach(p => {
        progressMap[p.challengeId] = p;
      });
      
      const challengesWithProgress = challenges.map(challenge => {
        const progress = progressMap[challenge.challengeId];
        return {
          ...challenge.toObject(),
          userProgress: progress || null
        };
      });
      
      return res.json({
        success: true,
        challenges: challengesWithProgress
      });
    }
    
    res.json({
      success: true,
      challenges
    });
  } catch (error) {
    console.error('Error fetching active challenges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch challenges'
    });
  }
});

/**
 * GET /api/challenges/daily
 * Get today's daily challenge
 */
router.get('/daily', async (req, res) => {
  try {
    const { userId } = req.query;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    
    const dailyChallenge = await Challenge.findOne({
      type: 'daily',
      isActive: true,
      startDate: { $gte: todayStart, $lt: todayEnd }
    });
    
    if (!dailyChallenge) {
      // Create a default daily challenge
      const newDailyChallenge = await createDefaultDailyChallenge(todayStart, todayEnd);
      return res.json({
        success: true,
        challenge: newDailyChallenge
      });
    }
    
    // Get user progress if userId provided
    if (userId) {
      const progress = await UserChallengeProgress.findOne({
        userId: userId,
        challengeId: dailyChallenge.challengeId
      });
      
      return res.json({
        success: true,
        challenge: {
          ...dailyChallenge.toObject(),
          userProgress: progress
        }
      });
    }
    
    res.json({
      success: true,
      challenge: dailyChallenge
    });
  } catch (error) {
    console.error('Error fetching daily challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily challenge'
    });
  }
});

/**
 * GET /api/challenges/:challengeId
 * Get specific challenge details
 */
router.get('/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId } = req.query;
    
    const challenge = await Challenge.findOne({ challengeId });
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }
    
    // Get user progress if userId provided
    if (userId) {
      const progress = await UserChallengeProgress.findOne({
        userId: userId,
        challengeId: challengeId
      });
      
      return res.json({
        success: true,
        challenge: {
          ...challenge.toObject(),
          userProgress: progress
        }
      });
    }
    
    res.json({
      success: true,
      challenge
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch challenge'
    });
  }
});

/**
 * POST /api/challenges/:challengeId/start
 * Start tracking a challenge for a user
 */
router.post('/:challengeId/start', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId } = req.body;
    
    const challenge = await Challenge.findOne({ challengeId });
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }
    
    // Check if already started
    let progress = await UserChallengeProgress.findOne({
      userId: userId,
      challengeId: challengeId
    });
    
    if (!progress) {
      // Create new progress record
      progress = new UserChallengeProgress({
        userId: userId,
        challengeId: challengeId,
        status: 'in-progress',
        progress: {
          current: 0,
          target: challenge.requirement.target
        }
      });
      
      await progress.save();
      
      // Increment participant count
      challenge.participantCount += 1;
      await challenge.save();
    }
    
    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Error starting challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start challenge'
    });
  }
});

/**
 * POST /api/challenges/:challengeId/progress
 * Update challenge progress for a user
 */
router.post('/:challengeId/progress', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId, actionType, actionId, increment = 1 } = req.body;
    
    const challenge = await Challenge.findOne({ challengeId });
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }
    
    // Get or create progress
    let progress = await UserChallengeProgress.findOne({
      userId: userId,
      challengeId: challengeId
    });
    
    if (!progress) {
      progress = new UserChallengeProgress({
        userId: userId,
        challengeId: challengeId,
        status: 'in-progress',
        progress: {
          current: 0,
          target: challenge.requirement.target
        }
      });
    }
    
    // Update progress
    progress.progress.current = Math.min(
      progress.progress.target,
      progress.progress.current + increment
    );
    
    // Track action
    if (actionType && actionId) {
      progress.actionsCompleted.push({
        actionType,
        actionId,
        completedAt: new Date()
      });
    }
    
    // Check if challenge is completed
    if (progress.progress.current >= progress.progress.target && progress.status !== 'completed') {
      progress.status = 'completed';
      progress.completedAt = new Date();
      
      // Award XP
      const xpToAward = challenge.xpReward * challenge.bonusMultiplier;
      const user = await User.findById(userId);
      if (user) {
        const result = await user.addXP(xpToAward, `challenge-${challengeId}`);
        progress.xpAwarded = xpToAward;
        
        // Update challenge completion count
        challenge.completionCount += 1;
        await challenge.save();
        
        await progress.save();
        
        return res.json({
          success: true,
          progress,
          completed: true,
          xpAwarded: xpToAward,
          levelUp: result.leveledUp,
          newLevel: result.newLevel
        });
      }
    }
    
    await progress.save();
    
    res.json({
      success: true,
      progress,
      completed: false
    });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update challenge progress'
    });
  }
});

/**
 * GET /api/challenges/users/:userId/progress
 * Get all challenge progress for a user
 */
router.get('/users/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    
    let query = { userId: userId };
    if (status) {
      query.status = status;
    }
    
    const progressRecords = await UserChallengeProgress.find(query).sort({ createdAt: -1 });
    
    // Populate challenge details
    const challengeIds = progressRecords.map(p => p.challengeId);
    const challenges = await Challenge.find({ challengeId: { $in: challengeIds } });
    
    const challengeMap = {};
    challenges.forEach(c => {
      challengeMap[c.challengeId] = c;
    });
    
    const progressWithChallenges = progressRecords.map(progress => ({
      ...progress.toObject(),
      challenge: challengeMap[progress.challengeId]
    }));
    
    res.json({
      success: true,
      progress: progressWithChallenges
    });
  } catch (error) {
    console.error('Error fetching user challenge progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress'
    });
  }
});

/**
 * POST /api/challenges/create
 * Admin: Create a new challenge
 */
router.post('/create', async (req, res) => {
  try {
    const challengeData = req.body;
    
    // Generate challenge ID if not provided
    if (!challengeData.challengeId) {
      challengeData.challengeId = `challenge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const challenge = new Challenge(challengeData);
    await challenge.save();
    
    res.json({
      success: true,
      challenge
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create challenge'
    });
  }
});

/**
 * Helper: Create default daily challenge
 */
async function createDefaultDailyChallenge(startDate, endDate) {
  const dailyChallenges = [
    {
      title: 'Lesson Explorer',
      description: 'Complete 2 lessons to master new investing concepts',
      requirement: { action: 'complete-lessons', target: 2 },
      category: 'lessons',
      xpReward: 150
    },
    {
      title: 'Quiz Master',
      description: 'Pass 2 quizzes to test your knowledge',
      requirement: { action: 'pass-quizzes', target: 2 },
      category: 'quizzes',
      xpReward: 200
    },
    {
      title: 'Calculator Pro',
      description: 'Use 5 different calculators to analyze investments',
      requirement: { action: 'use-calculators', target: 5 },
      category: 'calculations',
      xpReward: 100
    },
    {
      title: 'Simulation Champion',
      description: 'Complete 2 trading simulations',
      requirement: { action: 'complete-simulations', target: 2 },
      category: 'simulations',
      xpReward: 200
    },
    {
      title: 'Daily Learner',
      description: 'Maintain your streak by logging in today',
      requirement: { action: 'maintain-streak', target: 1 },
      category: 'streak',
      xpReward: 50
    }
  ];
  
  // Pick a random daily challenge
  const randomChallenge = dailyChallenges[Math.floor(Math.random() * dailyChallenges.length)];
  
  const challenge = new Challenge({
    challengeId: `daily-${startDate.toISOString().split('T')[0]}`,
    type: 'daily',
    isActive: true,
    startDate: startDate,
    endDate: endDate,
    bonusMultiplier: 1.5,
    ...randomChallenge
  });
  
  await challenge.save();
  return challenge;
}

module.exports = router;
