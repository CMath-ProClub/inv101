/**
 * Socket.io Service for Real-time Updates
 * 
 * To enable real-time features:
 * 1. Install Socket.io: npm install socket.io
 * 2. Uncomment the code below
 * 3. Initialize in index.js with: const socketService = require('./services/socketService'); socketService.initialize(server);
 */

let io = null;

/**
 * Initialize Socket.io with the HTTP server
 * @param {Object} server - HTTP server instance
 */
function initialize(server) {
  try {
    const socketIO = require('socket.io');
    
    io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    
    // Middleware for authentication
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      try {
        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = require('../middleware/auth');
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });
    
    // Connection handler
    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId}`);
      
      // Join user-specific room
      socket.join(`user_${socket.userId}`);
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
      });
      
      // Custom events can be added here
      socket.on('subscribe_leaderboard', (category) => {
        socket.join(`leaderboard_${category}`);
      });
      
      socket.on('unsubscribe_leaderboard', (category) => {
        socket.leave(`leaderboard_${category}`);
      });
      
      // Trading Battle events
      socket.on('join_battle', (battleId) => {
        socket.join(`battle_${battleId}`);
        console.log(`User ${socket.userId} joined battle ${battleId}`);
      });
      
      socket.on('leave_battle', (battleId) => {
        socket.leave(`battle_${battleId}`);
        console.log(`User ${socket.userId} left battle ${battleId}`);
      });
      
      socket.on('battle_ready', (battleId) => {
        socket.to(`battle_${battleId}`).emit('opponent_ready', { userId: socket.userId });
      });
    });
    
    // Make io globally available
    global.io = io;
    
    console.log('✅ Socket.io initialized successfully');
    return io;
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  Socket.io not installed. Real-time features disabled.');
      console.log('   To enable: npm install socket.io');
    } else {
      console.error('❌ Error initializing Socket.io:', error);
    }
    return null;
  }
}

/**
 * Emit notification to a specific user
 * @param {String} userId - User ID
 * @param {Object} notification - Notification data
 */
function emitNotification(userId, notification) {
  if (io) {
    io.to(`user_${userId}`).emit('new_notification', notification);
  }
}

/**
 * Emit activity update to user's friends
 * @param {Array} friendIds - Array of friend user IDs
 * @param {Object} activity - Activity data
 */
function emitActivity(friendIds, activity) {
  if (io) {
    friendIds.forEach(friendId => {
      io.to(`user_${friendId}`).emit('friend_activity', activity);
    });
  }
}

/**
 * Emit leaderboard update
 * @param {String} category - Leaderboard category
 * @param {Object} data - Leaderboard data
 */
function emitLeaderboardUpdate(category, data) {
  if (io) {
    io.to(`leaderboard_${category}`).emit('leaderboard_update', data);
  }
}

/**
 * Check if Socket.io is available
 * @returns {Boolean}
 */
function isAvailable() {
  return io !== null;
}

/**
 * Emit trade update to battle participants
 * @param {String} battleId - Battle ID
 * @param {String} playerId - Player who made the trade
 * @param {Object} trade - Trade data
 */
function emitBattleTrade(battleId, playerId, trade) {
  if (io) {
    io.to(`battle_${battleId}`).emit('battle_trade', {
      playerId,
      trade,
      timestamp: new Date()
    });
  }
}

/**
 * Emit battle status update
 * @param {String} battleId - Battle ID
 * @param {Object} update - Battle update data
 */
function emitBattleUpdate(battleId, update) {
  if (io) {
    io.to(`battle_${battleId}`).emit('battle_update', update);
  }
}

/**
 * Emit matchmaking update to user
 * @param {String} userId - User ID
 * @param {Object} data - Matchmaking data (matched, opponent, etc.)
 */
function emitMatchmakingUpdate(userId, data) {
  if (io) {
    io.to(`user_${userId}`).emit('matchmaking_update', data);
  }
}

/**
 * Emit friend challenge notification
 * @param {String} userId - User ID
 * @param {Object} challenge - Challenge data
 */
function emitFriendChallenge(userId, challenge) {
  if (io) {
    io.to(`user_${userId}`).emit('friend_challenge', challenge);
  }
}

/**
 * Emit battle completion to both players
 * @param {String} battleId - Battle ID
 * @param {Object} results - Battle results
 */
function emitBattleComplete(battleId, results) {
  if (io) {
    io.to(`battle_${battleId}`).emit('battle_complete', results);
  }
}

module.exports = {
  initialize,
  emitNotification,
  emitActivity,
  emitLeaderboardUpdate,
  emitBattleTrade,
  emitBattleUpdate,
  emitMatchmakingUpdate,
  emitFriendChallenge,
  emitBattleComplete,
  isAvailable,
  get io() { return io; }
};
