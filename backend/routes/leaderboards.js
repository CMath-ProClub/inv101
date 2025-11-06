const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Trade = require('../models/Trade');
const { ensureAuthenticated } = require('../middleware/auth');

// Get leaderboard
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const { category = 'portfolio_value', period = 'all', limit = 100 } = req.query;
    
    let leaderboard = [];
    
    if (category === 'portfolio_value') {
      // Get users with their portfolio values
      const portfolios = await Portfolio.find({})
        .populate('userId', 'username email profilePicture')
        .lean();
      
      leaderboard = portfolios
        .map(p => ({
          userId: p.userId._id,
          username: p.userId.username,
          email: p.userId.email,
          profilePicture: p.userId.profilePicture,
          value: p.totalValue || 0,
          change: p.totalReturn || 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, parseInt(limit));
        
    } else if (category === 'best_returns') {
      const portfolios = await Portfolio.find({})
        .populate('userId', 'username email profilePicture')
        .lean();
      
      leaderboard = portfolios
        .map(p => ({
          userId: p.userId._id,
          username: p.userId.username,
          email: p.userId.email,
          profilePicture: p.userId.profilePicture,
          value: p.totalValue || 0,
          change: p.totalReturnPercent || 0
        }))
        .sort((a, b) => b.change - a.change)
        .slice(0, parseInt(limit));
        
    } else if (category === 'lessons_completed') {
      // This would need a lessons completion model/tracking
      // Placeholder for now
      const users = await User.find({})
        .select('username email profilePicture')
        .lean();
      
      leaderboard = users.map(u => ({
        userId: u._id,
        username: u.username,
        email: u.email,
        profilePicture: u.profilePicture,
        lessonsCompleted: 0 // TODO: Track from lessons system
      }));
      
    } else if (category === 'learning_streak') {
      // Placeholder
      const users = await User.find({})
        .select('username email profilePicture')
        .lean();
      
      leaderboard = users.map(u => ({
        userId: u._id,
        username: u.username,
        email: u.email,
        profilePicture: u.profilePicture,
        streak: 0 // TODO: Track learning streak
      }));
    }
    
    // Find current user's position
    const userPosition = leaderboard.findIndex(
      item => item.userId.toString() === req.user._id.toString()
    );
    
    res.json({
      success: true,
      leaderboard,
      userPosition: userPosition >= 0 ? userPosition + 1 : null,
      category,
      period
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch leaderboard' 
    });
  }
});

// Get user's leaderboard rank
router.get('/rank', ensureAuthenticated, async (req, res) => {
  try {
    const { category = 'portfolio_value' } = req.query;
    
    let rank = null;
    let value = null;
    
    if (category === 'portfolio_value') {
      const userPortfolio = await Portfolio.findOne({ userId: req.user._id });
      const userValue = userPortfolio?.totalValue || 0;
      
      const higherCount = await Portfolio.countDocuments({
        totalValue: { $gt: userValue }
      });
      
      rank = higherCount + 1;
      value = userValue;
      
    } else if (category === 'best_returns') {
      const userPortfolio = await Portfolio.findOne({ userId: req.user._id });
      const userReturn = userPortfolio?.totalReturnPercent || 0;
      
      const higherCount = await Portfolio.countDocuments({
        totalReturnPercent: { $gt: userReturn }
      });
      
      rank = higherCount + 1;
      value = userReturn;
    }
    
    const totalUsers = await User.countDocuments();
    
    res.json({
      success: true,
      rank,
      value,
      totalUsers,
      percentile: totalUsers > 0 ? Math.round((1 - (rank / totalUsers)) * 100) : 0
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user rank' 
    });
  }
});

module.exports = router;
