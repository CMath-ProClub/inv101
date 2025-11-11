const express = require('express');
const router = express.Router();
const { PlayerElo, TradingBattle, MatchmakingQueue, FriendChallenge, GAME_MODES } = require('../models/TradingBattle');
const User = require('../models/User');
const { getHistoricalData, getPriceAtDate } = require('../stockMarketData');

/**
 * GET /api/battles/elo/:userId
 * Get user's Elo ratings for all game modes
 */
router.get('/elo/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let playerElo = await PlayerElo.findOne({ userId });
    
    if (!playerElo) {
      // Create default Elo record
      playerElo = new PlayerElo({ userId });
      await playerElo.save();
    }
    
    res.json({
      success: true,
      elo: playerElo
    });
  } catch (error) {
    console.error('Error fetching Elo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Elo ratings'
    });
  }
});

/**
 * GET /api/battles/leaderboard
 * Get leaderboard for a specific game mode
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { gameMode = 'standard', limit = 100 } = req.query;
    
    const eloField = `${gameMode}Elo`;
    const sortObj = {};
    sortObj[eloField] = -1;
    
    const leaderboard = await PlayerElo.find()
      .sort(sortObj)
      .limit(parseInt(limit))
      .populate('userId', 'username email')
      .lean();
    
    res.json({
      success: true,
      gameMode,
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId?._id,
        username: entry.userId?.username || `User ${entry.userId?._id?.slice(-4)}`,
        elo: entry[eloField],
        stats: entry[`${gameMode}Stats`],
        winStreak: entry.winStreak,
        totalBattles: entry.totalBattles
      }))
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

/**
 * POST /api/battles/matchmaking/join
 * Join matchmaking queue for ranked play
 */
router.post('/matchmaking/join', async (req, res) => {
  try {
    const { userId, gameMode } = req.body;
    
    if (!GAME_MODES[gameMode.toUpperCase()]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid game mode'
      });
    }
    
    // Get user's Elo
    let playerElo = await PlayerElo.findOne({ userId });
    if (!playerElo) {
      playerElo = new PlayerElo({ userId });
      await playerElo.save();
    }
    
    const currentElo = playerElo[`${gameMode}Elo`];
    const user = await User.findById(userId);
    
    // Check if already in queue
    const existing = await MatchmakingQueue.findOne({ userId });
    if (existing) {
      return res.json({
        success: true,
        alreadyInQueue: true,
        queueEntry: existing
      });
    }
    
    // Initial matchmaking range: ±100 Elo
    const queueEntry = new MatchmakingQueue({
      userId,
      username: user?.username || `User ${userId.slice(-4)}`,
      gameMode: gameMode.toLowerCase(),
      currentElo,
      eloRange: {
        min: currentElo - 100,
        max: currentElo + 100
      }
    });
    
    await queueEntry.save();
    
    // Try to find a match immediately
    const matchResult = await findMatch(queueEntry);
    
    if (matchResult.matched) {
      return res.json({
        success: true,
        matched: true,
        battleId: matchResult.battleId,
        opponent: matchResult.opponent
      });
    }
    
    res.json({
      success: true,
      inQueue: true,
      queueEntry,
      message: 'Searching for opponent...'
    });
  } catch (error) {
    console.error('Error joining matchmaking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join matchmaking'
    });
  }
});

/**
 * POST /api/battles/matchmaking/leave
 * Leave matchmaking queue
 */
router.post('/matchmaking/leave', async (req, res) => {
  try {
    const { userId } = req.body;
    
    await MatchmakingQueue.deleteOne({ userId });
    
    res.json({
      success: true,
      message: 'Left matchmaking queue'
    });
  } catch (error) {
    console.error('Error leaving matchmaking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave matchmaking'
    });
  }
});

/**
 * GET /api/battles/matchmaking/status/:userId
 * Check matchmaking status
 */
router.get('/matchmaking/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const queueEntry = await MatchmakingQueue.findOne({ userId });
    
    if (!queueEntry) {
      return res.json({
        success: true,
        inQueue: false
      });
    }
    
    if (queueEntry.status === 'matched') {
      return res.json({
        success: true,
        matched: true,
        battleId: queueEntry.matchedBattleId
      });
    }
    
    res.json({
      success: true,
      inQueue: true,
      queueEntry
    });
  } catch (error) {
    console.error('Error checking matchmaking status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check status'
    });
  }
});

/**
 * POST /api/battles/challenge/create
 * Create a friend challenge
 */
router.post('/challenge/create', async (req, res) => {
  try {
    const { challengerId, challengedId, gameMode, message } = req.body;
    
    if (!GAME_MODES[gameMode.toUpperCase()]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid game mode'
      });
    }
    
    // Get both players' data
    const challenger = await User.findById(challengerId);
    const challenged = await User.findById(challengedId);
    
    if (!challenger || !challenged) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Get Elos
    const challengerElo = await PlayerElo.findOne({ userId: challengerId });
    const challengedElo = await PlayerElo.findOne({ userId: challengedId });
    
    const challengeId = `challenge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const challenge = new FriendChallenge({
      challengeId,
      challenger: {
        userId: challengerId,
        username: challenger.username || `User ${challengerId.slice(-4)}`,
        elo: challengerElo ? challengerElo[`${gameMode}Elo`] : 1200
      },
      challenged: {
        userId: challengedId,
        username: challenged.username || `User ${challengedId.slice(-4)}`,
        elo: challengedElo ? challengedElo[`${gameMode}Elo`] : 1200
      },
      gameMode: gameMode.toLowerCase(),
      message
    });
    
    await challenge.save();
    
    // TODO: Send notification to challenged user
    
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
 * POST /api/battles/challenge/:challengeId/accept
 * Accept a friend challenge
 */
router.post('/challenge/:challengeId/accept', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId } = req.body;
    
    const challenge = await FriendChallenge.findOne({ challengeId });
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }
    
    if (challenge.challenged.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to accept this challenge'
      });
    }
    
    if (challenge.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Challenge is no longer available'
      });
    }
    
    // Create battle
    const battle = await createBattle(
      challenge.challenger.userId,
      challenge.challenged.userId,
      challenge.gameMode,
      'friendly'
    );
    
    // Update challenge
    challenge.status = 'accepted';
    challenge.battleId = battle.battleId;
    await challenge.save();
    
    res.json({
      success: true,
      battle,
      message: 'Challenge accepted! Battle starting...'
    });
  } catch (error) {
    console.error('Error accepting challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept challenge'
    });
  }
});

/**
 * POST /api/battles/challenge/:challengeId/decline
 * Decline a friend challenge
 */
router.post('/challenge/:challengeId/decline', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId } = req.body;
    
    const challenge = await FriendChallenge.findOne({ challengeId });
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }
    
    if (challenge.challenged.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }
    
    challenge.status = 'declined';
    await challenge.save();
    
    res.json({
      success: true,
      message: 'Challenge declined'
    });
  } catch (error) {
    console.error('Error declining challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to decline challenge'
    });
  }
});

/**
 * GET /api/battles/challenges/:userId
 * Get user's pending challenges
 */
router.get('/challenges/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const challenges = await FriendChallenge.find({
      $or: [
        { 'challenger.userId': userId },
        { 'challenged.userId': userId }
      ],
      status: { $in: ['pending', 'accepted'] }
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      challenges
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch challenges'
    });
  }
});

/**
 * GET /api/battles/:battleId
 * Get battle details
 */
router.get('/:battleId', async (req, res) => {
  try {
    const { battleId } = req.params;
    
    const battle = await TradingBattle.findOne({ battleId })
      .populate('player1.userId', 'username')
      .populate('player2.userId', 'username');
    
    if (!battle) {
      return res.status(404).json({
        success: false,
        error: 'Battle not found'
      });
    }
    
    res.json({
      success: true,
      battle
    });
  } catch (error) {
    console.error('Error fetching battle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch battle'
    });
  }
});

/**
 * GET /api/battles/:battleId/historical-data
 * Get historical price data for battle market
 */
router.get('/:battleId/historical-data', async (req, res) => {
  try {
    const { battleId } = req.params;
    const { symbol } = req.query;
    
    const battle = await TradingBattle.findOne({ battleId });
    
    if (!battle) {
      return res.status(404).json({
        success: false,
        error: 'Battle not found'
      });
    }
    
    const targetSymbol = symbol || battle.market || 'SPY';
    
    // Get historical data for battle date range
    const historicalData = await getHistoricalData(
      targetSymbol,
      battle.historicalDataStart,
      battle.historicalDataEnd
    );
    
    res.json({
      success: true,
      symbol: targetSymbol,
      startDate: battle.historicalDataStart,
      endDate: battle.historicalDataEnd,
      data: historicalData
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch historical data'
    });
  }
});

/**
 * POST /api/battles/:battleId/trade
 * Execute a trade in battle
 */
router.post('/:battleId/trade', async (req, res) => {
  try {
    const { battleId } = req.params;
    const { userId, action, symbol, shares, price } = req.body;
    
    const battle = await TradingBattle.findOne({ battleId });
    
    if (!battle) {
      return res.status(404).json({
        success: false,
        error: 'Battle not found'
      });
    }
    
    if (battle.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        error: 'Battle is not in progress'
      });
    }
    
    // Determine which player
    const isPlayer1 = battle.player1.userId.toString() === userId;
    const isPlayer2 = battle.player2.userId.toString() === userId;
    
    if (!isPlayer1 && !isPlayer2) {
      return res.status(403).json({
        success: false,
        error: 'Not a participant in this battle'
      });
    }
    
    // Add trade
    const totalValue = shares * price;
    await battle.addTrade(userId, {
      action,
      symbol,
      shares,
      price,
      totalValue,
      portfolioValueAfter: 0, // Calculate based on current positions
      cashAfter: 0 // Calculate based on current cash
    });
    
    // TODO: Emit socket event for real-time update
    
    res.json({
      success: true,
      message: 'Trade executed',
      battle
    });
  } catch (error) {
    console.error('Error executing trade:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute trade'
    });
  }
});

/**
 * POST /api/battles/:battleId/complete
 * Complete a battle and calculate results
 */
router.post('/:battleId/complete', async (req, res) => {
  try {
    const { battleId } = req.params;
    
    const battle = await TradingBattle.findOne({ battleId });
    
    if (!battle) {
      return res.status(404).json({
        success: false,
        error: 'Battle not found'
      });
    }
    
    if (battle.status === 'completed') {
      return res.json({
        success: true,
        alreadyCompleted: true,
        battle
      });
    }
    
    // Calculate results (simplified - would need full portfolio calculation)
    battle.player1Results = {
      finalPortfolioValue: battle.startingCapital + 5000, // Example
      totalReturn: 5000,
      returnPercentage: 5.0,
      tradesExecuted: battle.player1Trades.length,
      sharpeRatio: 1.5,
      maxDrawdown: 2.0
    };
    
    battle.player2Results = {
      finalPortfolioValue: battle.startingCapital + 3000, // Example
      totalReturn: 3000,
      returnPercentage: 3.0,
      tradesExecuted: battle.player2Trades.length,
      sharpeRatio: 1.2,
      maxDrawdown: 3.0
    };
    
    // Determine winner
    battle.calculateWinner();
    battle.status = 'completed';
    battle.endTime = new Date();
    
    await battle.save();
    
    // Update Elos if ranked
    if (battle.battleType === 'ranked') {
      await updateElos(battle);
    }
    
    res.json({
      success: true,
      battle,
      winner: battle.winner
    });
  } catch (error) {
    console.error('Error completing battle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete battle'
    });
  }
});

/**
 * GET /api/battles/history/:userId
 * Get user's battle history
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, gameMode } = req.query;
    
    let query = {
      $or: [
        { 'player1.userId': userId },
        { 'player2.userId': userId }
      ],
      status: 'completed'
    };
    
    if (gameMode) {
      query.gameMode = gameMode;
    }
    
    const battles = await TradingBattle.find(query)
      .sort({ endTime: -1 })
      .limit(parseInt(limit))
      .populate('player1.userId', 'username')
      .populate('player2.userId', 'username');
    
    res.json({
      success: true,
      battles
    });
  } catch (error) {
    console.error('Error fetching battle history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history'
    });
  }
});

/**
 * Helper Functions
 */

/**
 * Find a match for a player in queue
 */
async function findMatch(queueEntry) {
  try {
    // Find opponent in same game mode within Elo range
    const opponent = await MatchmakingQueue.findOne({
      gameMode: queueEntry.gameMode,
      status: 'searching',
      userId: { $ne: queueEntry.userId },
      currentElo: {
        $gte: queueEntry.eloRange.min,
        $lte: queueEntry.eloRange.max
      }
    }).sort({ searchStartTime: 1 }); // FIFO
    
    if (!opponent) {
      return { matched: false };
    }
    
    // Create battle
    const battle = await createBattle(
      queueEntry.userId,
      opponent.userId,
      queueEntry.gameMode,
      'ranked'
    );
    
    // Update queue entries
    queueEntry.status = 'matched';
    queueEntry.matchedBattleId = battle.battleId;
    await queueEntry.save();
    
    opponent.status = 'matched';
    opponent.matchedBattleId = battle.battleId;
    await opponent.save();
    
    // Clean up queue entries after 5 minutes
    setTimeout(async () => {
      await MatchmakingQueue.deleteMany({
        battleId: battle.battleId
      });
    }, 5 * 60 * 1000);
    
    return {
      matched: true,
      battleId: battle.battleId,
      opponent: {
        username: opponent.username,
        elo: opponent.currentElo
      }
    };
  } catch (error) {
    console.error('Error finding match:', error);
    return { matched: false };
  }
}

/**
 * Create a new battle
 */
async function createBattle(player1Id, player2Id, gameMode, battleType) {
  // Get historical data date range
  const now = new Date();
  const startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
  const endDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  
  // Get player Elos
  const p1Elo = await PlayerElo.findOne({ userId: player1Id });
  const p2Elo = await PlayerElo.findOne({ userId: player2Id });
  
  const p1User = await User.findById(player1Id);
  const p2User = await User.findById(player2Id);
  
  const battleId = `battle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const battle = new TradingBattle({
    battleId,
    gameMode: gameMode.toLowerCase(),
    battleType,
    player1: {
      userId: player1Id,
      username: p1User?.username || `User ${player1Id.slice(-4)}`,
      startingElo: p1Elo ? p1Elo[`${gameMode}Elo`] : 1200,
      currentElo: p1Elo ? p1Elo[`${gameMode}Elo`] : 1200
    },
    player2: {
      userId: player2Id,
      username: p2User?.username || `User ${player2Id.slice(-4)}`,
      startingElo: p2Elo ? p2Elo[`${gameMode}Elo`] : 1200,
      currentElo: p2Elo ? p2Elo[`${gameMode}Elo`] : 1200
    },
    historicalDataStart: startDate,
    historicalDataEnd: endDate,
    status: 'ready',
    startTime: new Date()
  });
  
  await battle.save();
  return battle;
}

/**
 * Update Elos after battle completion
 */
async function updateElos(battle) {
  const p1Elo = await PlayerElo.findOne({ userId: battle.player1.userId });
  const p2Elo = await PlayerElo.findOne({ userId: battle.player2.userId });
  
  if (!p1Elo || !p2Elo) return;
  
  let p1Result, p2Result;
  
  if (battle.winner === 'player1') {
    p1Result = 'win';
    p2Result = 'loss';
  } else if (battle.winner === 'player2') {
    p1Result = 'loss';
    p2Result = 'win';
  } else {
    p1Result = 'draw';
    p2Result = 'draw';
  }
  
  // Calculate Elo changes
  const p1Change = p1Elo.calculateEloChange(battle.player2.startingElo, p1Result);
  const p2Change = p2Elo.calculateEloChange(battle.player1.startingElo, p2Result);
  
  // Update Elos
  await p1Elo.updateElo(battle.gameMode, p1Change, p1Result, battle.battleId);
  await p2Elo.updateElo(battle.gameMode, p2Change, p2Result, battle.battleId);
  
  // Update battle with Elo changes
  battle.player1.eloChange = p1Change;
  battle.player2.eloChange = p2Change;
  await battle.save();
}

module.exports = router;
