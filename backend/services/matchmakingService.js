/**
 * Automated Matchmaking Service
 * Periodically scans the queue and automatically pairs players
 */

const { MatchmakingQueue, TradingBattle, PlayerElo } = require('../models/TradingBattle');
const User = require('../models/User');
const socketService = require('./socketService');

let matchmakingInterval = null;
const SCAN_INTERVAL = 5000; // 5 seconds
const ELO_EXPANSION_RATE = 50; // Increase search range by 50 every expansion
const EXPANSION_INTERVAL = 15000; // Expand range every 15 seconds

/**
 * Start the matchmaking service
 */
function start() {
  if (matchmakingInterval) {
    console.log('⚠️  Matchmaking service already running');
    return;
  }
  
  console.log('🎮 Starting automated matchmaking service...');
  
  // Run immediately
  scanQueue();
  
  // Then run periodically
  matchmakingInterval = setInterval(scanQueue, SCAN_INTERVAL);
  
  console.log('✅ Matchmaking service started (scanning every 5 seconds)');
}

/**
 * Stop the matchmaking service
 */
function stop() {
  if (matchmakingInterval) {
    clearInterval(matchmakingInterval);
    matchmakingInterval = null;
    console.log('🛑 Matchmaking service stopped');
  }
}

/**
 * Scan the queue and match players
 */
async function scanQueue() {
  try {
    // Get all searching players
    const queueEntries = await MatchmakingQueue.find({ status: 'searching' })
      .sort({ searchStartTime: 1 }); // FIFO
    
    if (queueEntries.length < 2) {
      return; // Need at least 2 players to match
    }
    
    // Expand search ranges for players who have been waiting
    await expandSearchRanges(queueEntries);
    
    // Try to match players
    const matched = new Set();
    
    for (const entry of queueEntries) {
      if (matched.has(entry.userId.toString())) continue;
      
      // Find opponent
      const opponent = await findOpponent(entry, queueEntries, matched);
      
      if (opponent) {
        // Create battle
        await createMatchedBattle(entry, opponent);
        matched.add(entry.userId.toString());
        matched.add(opponent.userId.toString());
      }
    }
    
  } catch (error) {
    console.error('Error in matchmaking scan:', error);
  }
}

/**
 * Expand search ranges for players waiting too long
 */
async function expandSearchRanges(queueEntries) {
  const now = Date.now();
  
  for (const entry of queueEntries) {
    const waitTime = now - new Date(entry.searchStartTime).getTime();
    const expansionsDue = Math.floor(waitTime / EXPANSION_INTERVAL);
    
    if (expansionsDue > entry.searchExpandedTimes) {
      // Expand range
      const expansion = ELO_EXPANSION_RATE * (expansionsDue - entry.searchExpandedTimes);
      
      entry.eloRange.min -= expansion;
      entry.eloRange.max += expansion;
      entry.searchExpandedTimes = expansionsDue;
      
      await entry.save();
      
      console.log(`📊 Expanded search range for ${entry.username} to [${entry.eloRange.min}, ${entry.eloRange.max}]`);
    }
  }
}

/**
 * Find an opponent for a player
 */
async function findOpponent(entry, allEntries, matched) {
  for (const opponent of allEntries) {
    // Skip self and already matched
    if (opponent.userId.toString() === entry.userId.toString()) continue;
    if (matched.has(opponent.userId.toString())) continue;
    
    // Must be same game mode
    if (opponent.gameMode !== entry.gameMode) continue;
    
    // Check if Elos are within each other's ranges
    const entryInOpponentRange = 
      entry.currentElo >= opponent.eloRange.min && 
      entry.currentElo <= opponent.eloRange.max;
    
    const opponentInEntryRange = 
      opponent.currentElo >= entry.eloRange.min && 
      opponent.currentElo <= entry.eloRange.max;
    
    if (entryInOpponentRange && opponentInEntryRange) {
      return opponent;
    }
  }
  
  return null;
}

/**
 * Create a battle for matched players
 */
async function createMatchedBattle(entry1, entry2) {
  try {
    // Get player data
    const user1 = await User.findById(entry1.userId);
    const user2 = await User.findById(entry2.userId);
    
    // Get Elos
    const elo1 = await PlayerElo.findOne({ userId: entry1.userId });
    const elo2 = await PlayerElo.findOne({ userId: entry2.userId });
    
    // Generate battle ID
    const battleId = `battle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Historical data range (1 year ago to 30 days ago)
    const now = new Date();
    const startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Create battle
    const battle = new TradingBattle({
      battleId,
      gameMode: entry1.gameMode,
      battleType: 'ranked',
      player1: {
        userId: entry1.userId,
        username: user1?.username || `User ${entry1.userId.slice(-4)}`,
        startingElo: entry1.currentElo,
        currentElo: entry1.currentElo
      },
      player2: {
        userId: entry2.userId,
        username: user2?.username || `User ${entry2.userId.slice(-4)}`,
        startingElo: entry2.currentElo,
        currentElo: entry2.currentElo
      },
      historicalDataStart: startDate,
      historicalDataEnd: endDate,
      status: 'ready',
      startTime: new Date()
    });
    
    await battle.save();
    
    // Update queue entries
    entry1.status = 'matched';
    entry1.matchedBattleId = battleId;
    await entry1.save();
    
    entry2.status = 'matched';
    entry2.matchedBattleId = battleId;
    await entry2.save();
    
    console.log(`✅ Matched ${entry1.username} (${entry1.currentElo}) vs ${entry2.username} (${entry2.currentElo}) - ${entry1.gameMode.toUpperCase()}`);
    
    // Send WebSocket notifications
    if (socketService.isAvailable()) {
      socketService.emitMatchmakingUpdate(entry1.userId.toString(), {
        matched: true,
        battleId,
        opponent: {
          username: entry2.username,
          elo: entry2.currentElo
        }
      });
      
      socketService.emitMatchmakingUpdate(entry2.userId.toString(), {
        matched: true,
        battleId,
        opponent: {
          username: entry1.username,
          elo: entry1.currentElo
        }
      });
    }
    
    // Clean up queue entries after 5 minutes
    setTimeout(async () => {
      await MatchmakingQueue.deleteMany({
        matchedBattleId: battleId
      });
    }, 5 * 60 * 1000);
    
  } catch (error) {
    console.error('Error creating matched battle:', error);
  }
}

/**
 * Get matchmaking statistics
 */
async function getStats() {
  const searching = await MatchmakingQueue.countDocuments({ status: 'searching' });
  const matched = await MatchmakingQueue.countDocuments({ status: 'matched' });
  
  const queueByMode = await MatchmakingQueue.aggregate([
    { $match: { status: 'searching' } },
    { $group: { _id: '$gameMode', count: { $sum: 1 } } }
  ]);
  
  return {
    searching,
    matched,
    total: searching + matched,
    byMode: queueByMode.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    isRunning: matchmakingInterval !== null
  };
}

module.exports = {
  start,
  stop,
  scanQueue,
  getStats
};
