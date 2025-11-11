const mongoose = require('mongoose');

/**
 * Trading Battle Model
 * Competitive 1v1 trading simulations with Elo rankings
 * Inspired by Chess.com's multiple game modes
 */

// Battle Game Modes (like Chess.com's Rapid, Bullet, Blitz)
const GAME_MODES = {
  SPRINT: {
    name: 'Sprint',
    duration: 300, // 5 minutes
    description: 'Fast-paced 5-minute trading sprint',
    icon: '⚡'
  },
  STANDARD: {
    name: 'Standard',
    duration: 900, // 15 minutes
    description: 'Classic 15-minute trading battle',
    icon: '🎯'
  },
  MARATHON: {
    name: 'Marathon',
    duration: 1800, // 30 minutes
    description: 'Endurance 30-minute trading challenge',
    icon: '🏃'
  }
};

/**
 * Player Elo Schema (per game mode)
 */
const PlayerEloSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Separate Elo for each game mode
  sprintElo: {
    type: Number,
    default: 1200 // Starting Elo
  },
  
  standardElo: {
    type: Number,
    default: 1200
  },
  
  marathonElo: {
    type: Number,
    default: 1200
  },
  
  // Win/Loss/Draw records per mode
  sprintStats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 }
  },
  
  standardStats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 }
  },
  
  marathonStats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 }
  },
  
  // Peak Elos
  peakSprintElo: { type: Number, default: 1200 },
  peakStandardElo: { type: Number, default: 1200 },
  peakMarathonElo: { type: Number, default: 1200 },
  
  // Recent form
  recentGames: [{
    battleId: String,
    mode: String,
    result: String, // 'win', 'loss', 'draw'
    eloChange: Number,
    playedAt: Date
  }],
  
  // Achievements
  winStreak: { type: Number, default: 0 },
  longestWinStreak: { type: Number, default: 0 },
  totalBattles: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Compound index for leaderboard queries
PlayerEloSchema.index({ sprintElo: -1 });
PlayerEloSchema.index({ standardElo: -1 });
PlayerEloSchema.index({ marathonElo: -1 });
PlayerEloSchema.index({ userId: 1 }, { unique: true });

/**
 * Trading Battle Schema
 */
const TradingBattleSchema = new mongoose.Schema({
  battleId: {
    type: String,
    required: true,
    unique: true
  },
  
  gameMode: {
    type: String,
    enum: ['sprint', 'standard', 'marathon'],
    required: true
  },
  
  // Players
  player1: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: String,
    startingElo: Number,
    currentElo: Number,
    eloChange: Number
  },
  
  player2: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: String,
    startingElo: Number,
    currentElo: Number,
    eloChange: Number
  },
  
  // Battle Configuration
  startingCapital: {
    type: Number,
    default: 100000 // $100k starting capital
  },
  
  historicalDataStart: {
    type: Date,
    required: true
  },
  
  historicalDataEnd: {
    type: Date,
    required: true
  },
  
  market: {
    type: String,
    default: 'SPY' // Can be SPY, QQQ, specific stocks, etc.
  },
  
  // Battle State
  status: {
    type: String,
    enum: ['waiting', 'ready', 'in-progress', 'completed', 'cancelled', 'abandoned'],
    default: 'waiting'
  },
  
  startTime: Date,
  endTime: Date,
  
  // Player 1 Trading Data
  player1Trades: [{
    timestamp: Date,
    action: String, // 'buy' or 'sell'
    symbol: String,
    shares: Number,
    price: Number,
    totalValue: Number,
    portfolioValueAfter: Number,
    cashAfter: Number
  }],
  
  // Player 2 Trading Data
  player2Trades: [{
    timestamp: Date,
    action: String,
    symbol: String,
    shares: Number,
    price: Number,
    totalValue: Number,
    portfolioValueAfter: Number,
    cashAfter: Number
  }],
  
  // Final Results
  player1Results: {
    finalPortfolioValue: Number,
    totalReturn: Number,
    returnPercentage: Number,
    tradesExecuted: Number,
    sharpeRatio: Number,
    maxDrawdown: Number
  },
  
  player2Results: {
    finalPortfolioValue: Number,
    totalReturn: Number,
    returnPercentage: Number,
    tradesExecuted: Number,
    sharpeRatio: Number,
    maxDrawdown: Number
  },
  
  // Battle Result
  winner: {
    type: String,
    enum: ['player1', 'player2', 'draw', null],
    default: null
  },
  
  winCondition: {
    type: String,
    // 'higher-return', 'opponent-abandoned', 'time-expired'
  },
  
  // Battle Type
  battleType: {
    type: String,
    enum: ['ranked', 'friendly', 'practice'],
    default: 'ranked'
  },
  
  // For friend challenges
  isPrivate: {
    type: Boolean,
    default: false
  },
  
  inviteCode: String,
  
  // Chat/Events (optional for future expansion)
  events: [{
    timestamp: Date,
    type: String, // 'trade', 'milestone', 'taunt', 'emote'
    playerId: mongoose.Schema.Types.ObjectId,
    data: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
// Removed explicit index on battleId (duplicate). Unique field definition already creates the index.
TradingBattleSchema.index({ 'player1.userId': 1, status: 1 });
TradingBattleSchema.index({ 'player2.userId': 1, status: 1 });
TradingBattleSchema.index({ status: 1, gameMode: 1 });
TradingBattleSchema.index({ battleType: 1, status: 1 });
TradingBattleSchema.index({ createdAt: -1 });

/**
 * Matchmaking Queue Schema
 */
const MatchmakingQueueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  username: String,
  
  gameMode: {
    type: String,
    enum: ['sprint', 'standard', 'marathon'],
    required: true
  },
  
  currentElo: {
    type: Number,
    required: true
  },
  
  // Matchmaking parameters
  eloRange: {
    min: Number,
    max: Number
  },
  
  searchStartTime: {
    type: Date,
    default: Date.now
  },
  
  // Expand search range over time
  searchExpandedTimes: {
    type: Number,
    default: 0
  },
  
  status: {
    type: String,
    enum: ['searching', 'matched', 'cancelled'],
    default: 'searching'
  },
  
  matchedBattleId: String
}, {
  timestamps: true
});

MatchmakingQueueSchema.index({ gameMode: 1, status: 1, currentElo: 1 });
MatchmakingQueueSchema.index({ userId: 1 }, { unique: true });

/**
 * Friend Challenge Schema
 */
const FriendChallengeSchema = new mongoose.Schema({
  challengeId: {
    type: String,
    required: true,
    unique: true
  },
  
  challenger: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: String,
    elo: Number
  },
  
  challenged: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: String,
    elo: Number
  },
  
  gameMode: {
    type: String,
    enum: ['sprint', 'standard', 'marathon'],
    required: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired', 'cancelled'],
    default: 'pending'
  },
  
  battleId: String, // Set when accepted and battle created
  
  message: String, // Optional challenge message
  
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

FriendChallengeSchema.index({ 'challenger.userId': 1, status: 1 });
FriendChallengeSchema.index({ 'challenged.userId': 1, status: 1 });
// Removed explicit index on challengeId (duplicate). Unique field definition already creates the index.
FriendChallengeSchema.index({ expiresAt: 1 });

/**
 * Elo Calculation Methods
 */
PlayerEloSchema.methods.calculateEloChange = function(opponentElo, result) {
  const K = 32; // K-factor (higher = more volatile ratings)
  
  // Expected score
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - this.currentElo) / 400));
  
  // Actual score (1 = win, 0.5 = draw, 0 = loss)
  let actualScore;
  if (result === 'win') actualScore = 1;
  else if (result === 'draw') actualScore = 0.5;
  else actualScore = 0;
  
  // Elo change
  return Math.round(K * (actualScore - expectedScore));
};

PlayerEloSchema.methods.updateElo = function(gameMode, eloChange, result, battleId) {
  const eloField = `${gameMode}Elo`;
  const statsField = `${gameMode}Stats`;
  const peakField = `peak${gameMode.charAt(0).toUpperCase() + gameMode.slice(1)}Elo`;
  
  // Update Elo
  this[eloField] = Math.max(0, this[eloField] + eloChange);
  
  // Update peak
  if (this[eloField] > this[peakField]) {
    this[peakField] = this[eloField];
  }
  
  // Update stats
  this[statsField].gamesPlayed += 1;
  if (result === 'win') {
    this[statsField].wins += 1;
    this.winStreak += 1;
    if (this.winStreak > this.longestWinStreak) {
      this.longestWinStreak = this.winStreak;
    }
  } else if (result === 'loss') {
    this[statsField].losses += 1;
    this.winStreak = 0;
  } else if (result === 'draw') {
    this[statsField].draws += 1;
  }
  
  this.totalBattles += 1;
  
  // Add to recent games (keep last 10)
  this.recentGames.unshift({
    battleId,
    mode: gameMode,
    result,
    eloChange,
    playedAt: new Date()
  });
  
  if (this.recentGames.length > 10) {
    this.recentGames = this.recentGames.slice(0, 10);
  }
  
  return this.save();
};

/**
 * Battle Methods
 */
TradingBattleSchema.methods.addTrade = function(playerId, tradeData) {
  const playerField = playerId.toString() === this.player1.userId.toString() ? 'player1Trades' : 'player2Trades';
  
  this[playerField].push({
    timestamp: new Date(),
    ...tradeData
  });
  
  return this.save();
};

TradingBattleSchema.methods.calculateWinner = function() {
  const p1Return = this.player1Results.returnPercentage;
  const p2Return = this.player2Results.returnPercentage;
  
  if (Math.abs(p1Return - p2Return) < 0.01) { // Within 0.01% = draw
    this.winner = 'draw';
    this.winCondition = 'equal-returns';
  } else if (p1Return > p2Return) {
    this.winner = 'player1';
    this.winCondition = 'higher-return';
  } else {
    this.winner = 'player2';
    this.winCondition = 'higher-return';
  }
  
  return this.winner;
};

const PlayerElo = mongoose.model('PlayerElo', PlayerEloSchema);
const TradingBattle = mongoose.model('TradingBattle', TradingBattleSchema);
const MatchmakingQueue = mongoose.model('MatchmakingQueue', MatchmakingQueueSchema);
const FriendChallenge = mongoose.model('FriendChallenge', FriendChallengeSchema);

module.exports = {
  PlayerElo,
  TradingBattle,
  MatchmakingQueue,
  FriendChallenge,
  GAME_MODES
};
