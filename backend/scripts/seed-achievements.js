/**
 * Seed Initial Achievements
 * Run with: node scripts/seed-achievements.js
 */

const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
require('dotenv').config();

const achievements = [
  // Trading Achievements
  {
    name: 'first_trade',
    title: 'First Trade',
    description: 'Execute your first trade on the platform',
    icon: '🎯',
    category: 'trading',
    rarity: 'common',
    points: 10,
    criteria: {
      type: 'count',
      metric: 'trades',
      target: 1,
      comparison: 'gte'
    }
  },
  {
    name: 'day_trader',
    title: 'Day Trader',
    description: 'Complete 50 trades in total',
    icon: '📈',
    category: 'trading',
    rarity: 'rare',
    points: 100,
    criteria: {
      type: 'count',
      metric: 'trades',
      target: 50,
      comparison: 'gte'
    }
  },
  {
    name: 'winning_streak',
    title: 'Winning Streak',
    description: 'Win 10 trades in a row',
    icon: '🔥',
    category: 'trading',
    rarity: 'epic',
    points: 200,
    criteria: {
      type: 'streak',
      metric: 'winning_trades',
      target: 10,
      comparison: 'gte'
    }
  },
  {
    name: 'risk_taker',
    title: 'Risk Taker',
    description: 'Invest over $10,000 in a single trade',
    icon: '🎲',
    category: 'trading',
    rarity: 'rare',
    points: 150,
    criteria: {
      type: 'value',
      metric: 'single_trade_amount',
      target: 10000,
      comparison: 'gte'
    }
  },
  {
    name: 'diversified',
    title: 'Diversified',
    description: 'Hold 20 different stocks in your portfolio',
    icon: '🌐',
    category: 'trading',
    rarity: 'epic',
    points: 250,
    criteria: {
      type: 'count',
      metric: 'unique_stocks',
      target: 20,
      comparison: 'gte'
    }
  },
  
  // Learning Achievements
  {
    name: 'first_lesson',
    title: 'Getting Started',
    description: 'Complete your first lesson',
    icon: '📖',
    category: 'learning',
    rarity: 'common',
    points: 10,
    criteria: {
      type: 'count',
      metric: 'lessons',
      target: 1,
      comparison: 'gte'
    }
  },
  {
    name: 'quick_learner',
    title: 'Quick Learner',
    description: 'Complete 10 lessons with a score of 90% or higher',
    icon: '⚡',
    category: 'learning',
    rarity: 'rare',
    points: 100,
    criteria: {
      type: 'count',
      metric: 'high_score_lessons',
      target: 10,
      comparison: 'gte'
    }
  },
  {
    name: 'perfect_score',
    title: 'Perfect Score',
    description: 'Get 100% on 5 different lesson quizzes',
    icon: '💯',
    category: 'learning',
    rarity: 'rare',
    points: 150,
    criteria: {
      type: 'count',
      metric: 'perfect_lessons',
      target: 5,
      comparison: 'gte'
    }
  },
  {
    name: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    description: 'Complete all 25 lessons in the curriculum',
    icon: '🎓',
    category: 'learning',
    rarity: 'legendary',
    points: 500,
    criteria: {
      type: 'completion',
      metric: 'lessons',
      target: 25,
      comparison: 'gte'
    }
  },
  {
    name: 'marathon_learner',
    title: 'Marathon Learner',
    description: 'Maintain a 30-day learning streak',
    icon: '🏃',
    category: 'learning',
    rarity: 'epic',
    points: 300,
    criteria: {
      type: 'streak',
      metric: 'learning_days',
      target: 30,
      comparison: 'gte'
    }
  },
  
  // Social Achievements
  {
    name: 'first_friend',
    title: 'Making Connections',
    description: 'Add your first friend on the platform',
    icon: '👋',
    category: 'social',
    rarity: 'common',
    points: 10,
    criteria: {
      type: 'count',
      metric: 'friends',
      target: 1,
      comparison: 'gte'
    }
  },
  {
    name: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Connect with 10 friends on the platform',
    icon: '🦋',
    category: 'social',
    rarity: 'rare',
    points: 100,
    criteria: {
      type: 'count',
      metric: 'friends',
      target: 10,
      comparison: 'gte'
    }
  },
  {
    name: 'community_leader',
    title: 'Community Leader',
    description: 'Have 50 friends on the platform',
    icon: '👑',
    category: 'social',
    rarity: 'epic',
    points: 250,
    criteria: {
      type: 'count',
      metric: 'friends',
      target: 50,
      comparison: 'gte'
    }
  },
  
  // Milestone Achievements
  {
    name: 'portfolio_starter',
    title: 'Portfolio Starter',
    description: 'Reach a portfolio value of $10,000',
    icon: '💼',
    category: 'milestones',
    rarity: 'common',
    points: 50,
    criteria: {
      type: 'value',
      metric: 'portfolio_value',
      target: 10000,
      comparison: 'gte'
    }
  },
  {
    name: 'portfolio_master',
    title: 'Portfolio Master',
    description: 'Reach a portfolio value of $50,000 or more',
    icon: '💰',
    category: 'milestones',
    rarity: 'epic',
    points: 200,
    criteria: {
      type: 'value',
      metric: 'portfolio_value',
      target: 50000,
      comparison: 'gte'
    }
  },
  {
    name: 'hundred_k_club',
    title: '100K Club',
    description: 'Reach a portfolio value of $100,000',
    icon: '💎',
    category: 'milestones',
    rarity: 'legendary',
    points: 500,
    criteria: {
      type: 'value',
      metric: 'portfolio_value',
      target: 100000,
      comparison: 'gte'
    }
  },
  {
    name: 'millionaire',
    title: 'Millionaire',
    description: 'Reach a portfolio value of $1,000,000',
    icon: '🏆',
    category: 'milestones',
    rarity: 'legendary',
    points: 1000,
    criteria: {
      type: 'value',
      metric: 'portfolio_value',
      target: 1000000,
      comparison: 'gte'
    }
  }
];

async function seedAchievements() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inv101');
    console.log('Connected to MongoDB');
    
    // Clear existing achievements (optional)
    // await Achievement.deleteMany({});
    // console.log('Cleared existing achievements');
    
    // Insert achievements
    for (const achievement of achievements) {
      await Achievement.findOneAndUpdate(
        { name: achievement.name },
        achievement,
        { upsert: true, new: true }
      );
      console.log(`✅ Created/Updated: ${achievement.title}`);
    }
    
    console.log(`\n🎉 Successfully seeded ${achievements.length} achievements!`);
    
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding achievements:', error);
    process.exit(1);
  }
}

seedAchievements();
