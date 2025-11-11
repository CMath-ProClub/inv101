# 1v1 Trading Battles - Quick Reference

## 🎮 Quick Start

### For Users
1. Open `prototype/matchmaking.html`
2. Select game mode (Sprint/Standard/Marathon)
3. Click "FIND MATCH"
4. Wait for opponent (usually < 30 seconds)
5. Battle auto-starts when matched
6. Execute trades: Enter symbol → shares → BUY/SELL
7. Timer expires, see results with Elo changes

### For Developers
```bash
# Start backend
cd backend
npm install socket.io  # If not installed
node index.js

# Open frontend
# Two browsers for testing
Browser 1: prototype/matchmaking.html (User A)
Browser 2: prototype/matchmaking.html (User B - Incognito)
```

---

## 📊 Game Modes

| Mode | Time | Starting Elo | API Value |
|------|------|--------------|-----------|
| ⚡ Sprint | 5 min | 1200 | `sprint` |
| 🎯 Standard | 15 min | 1200 | `standard` |
| 🏃 Marathon | 30 min | 1200 | `marathon` |

---

## 🔗 API Endpoints

### Get User Elo
```javascript
GET /api/battles/elo/:userId
Response: {
  success: true,
  elo: {
    sprintElo: 1200,
    standardElo: 1245,
    marathonElo: 1178,
    sprintStats: { wins: 5, losses: 3, draws: 1 },
    // ... more stats
  }
}
```

### Join Matchmaking
```javascript
POST /api/battles/matchmaking/join
Body: { userId: "abc123", gameMode: "standard" }
Response: {
  success: true,
  inQueue: true,
  queueEntry: { ... }
}
```

### Check Queue Status
```javascript
GET /api/battles/matchmaking/status/:userId
Response: {
  success: true,
  matched: true,
  battleId: "battle-123-abc"
}
```

### Execute Trade
```javascript
POST /api/battles/:battleId/trade
Body: {
  userId: "abc123",
  action: "buy",  // or "sell"
  symbol: "AAPL",
  shares: 10,
  price: 175.50
}
Response: {
  success: true,
  battle: { ... updated battle data }
}
```

### Complete Battle
```javascript
POST /api/battles/:battleId/complete
Response: {
  success: true,
  battle: {
    winner: "player1",
    player1Results: { totalReturn: 5000, returnPercentage: 5.0 },
    player2Results: { totalReturn: 3000, returnPercentage: 3.0 },
    player1: { eloChange: +24 },
    player2: { eloChange: -24 }
  }
}
```

### Get Battle History
```javascript
GET /api/battles/history/:userId?limit=20&gameMode=standard
Response: {
  success: true,
  battles: [
    {
      battleId: "battle-123",
      gameMode: "standard",
      winner: "player1",
      player1Results: { ... },
      endTime: "2024-12-15T10:30:00Z"
    }
  ]
}
```

### Friend Challenge
```javascript
// Create Challenge
POST /api/battles/challenge/create
Body: {
  challengerId: "user1",
  challengedId: "user2",
  gameMode: "sprint",
  message: "Ready?"
}

// Accept Challenge
POST /api/battles/challenge/:challengeId/accept
Body: { userId: "user2" }
Response: {
  success: true,
  battle: { battleId: "battle-456" }
}

// Decline Challenge
POST /api/battles/challenge/:challengeId/decline
Body: { userId: "user2" }
```

---

## 🔌 WebSocket Events

### Connect
```javascript
const socket = io('http://localhost:4000', {
  auth: { token: localStorage.getItem('token') }
});
```

### Subscribe to Battle
```javascript
socket.emit('join_battle', battleId);
```

### Listen for Trades
```javascript
socket.on('battle_trade', ({ playerId, trade, timestamp }) => {
  console.log('Trade:', trade);
  // Update opponent's trade feed
});
```

### Listen for Updates
```javascript
socket.on('battle_update', (update) => {
  console.log('Battle update:', update);
});

socket.on('battle_complete', (results) => {
  console.log('Battle finished:', results);
  // Show results screen
});

socket.on('matchmaking_update', ({ matched, battleId, opponent }) => {
  if (matched) {
    window.location.href = `battle.html?battleId=${battleId}`;
  }
});
```

---

## 🎯 Elo Calculation

### Formula
```javascript
// Expected score (probability of winning)
expectedScore = 1 / (1 + 10^((opponentElo - yourElo) / 400))

// Actual score
actualScore = win ? 1 : (draw ? 0.5 : 0)

// Elo change
eloChange = K * (actualScore - expectedScore)
// K = 32 (standard)
```

### Examples

**Example 1**: Equal players (both 1200 Elo)
- Expected score: 0.5 (50% chance)
- Winner: +16 Elo
- Loser: -16 Elo

**Example 2**: 1300 vs 1200 Elo
- Expected: 1300 has 64% chance
- If 1300 wins: +11 Elo
- If 1200 wins: +21 Elo (upset!)
- If draw: 1300: -5 Elo, 1200: +5 Elo

**Example 3**: 1400 vs 1200 Elo
- Expected: 1400 has 76% chance
- If 1400 wins: +8 Elo
- If 1200 wins: +24 Elo (big upset!)

---

## 🗂️ Database Schemas

### PlayerElo
```javascript
{
  userId: ObjectId,
  sprintElo: 1200,
  standardElo: 1200,
  marathonElo: 1200,
  sprintStats: { wins, losses, draws, gamesPlayed },
  standardStats: { wins, losses, draws, gamesPlayed },
  marathonStats: { wins, losses, draws, gamesPlayed },
  peakSprintElo: 1200,
  peakStandardElo: 1200,
  peakMarathonElo: 1200,
  recentGames: [
    { battleId, gameMode, result, eloChange, playedAt }
  ],
  winStreak: 0,
  longestWinStreak: 0,
  totalBattles: 0
}
```

### TradingBattle
```javascript
{
  battleId: "battle-123-abc",
  gameMode: "standard",
  battleType: "ranked", // or "friendly"
  player1: {
    userId: ObjectId,
    username: "Alice",
    startingElo: 1200,
    currentElo: 1224,
    eloChange: 24
  },
  player2: { ... },
  startingCapital: 100000,
  historicalDataStart: Date,
  historicalDataEnd: Date,
  market: "SPY",
  status: "completed", // waiting/ready/in-progress/completed/cancelled
  player1Trades: [
    {
      timestamp: Date,
      action: "buy",
      symbol: "AAPL",
      shares: 10,
      price: 175.50,
      portfolioValueAfter: 102000,
      cashAfter: 98245
    }
  ],
  player2Trades: [ ... ],
  player1Results: {
    finalPortfolioValue: 105000,
    totalReturn: 5000,
    returnPercentage: 5.0,
    tradesExecuted: 12,
    sharpeRatio: 1.5,
    maxDrawdown: 2.0
  },
  player2Results: { ... },
  winner: "player1", // or "player2" or "draw"
  startTime: Date,
  endTime: Date
}
```

---

## 🎨 UI Components

### Matchmaking Page
```html
<!-- Game Mode Card -->
<div class="game-mode-card selected" data-mode="standard">
  <div class="mode-icon">🎯</div>
  <div class="mode-name">Standard</div>
  <div class="mode-duration">15 Minutes</div>
  <div class="mode-elo">Your Elo: 1200</div>
</div>

<!-- Find Match Button -->
<button class="find-match-btn" onclick="findMatch()">
  🎮 FIND MATCH
</button>

<!-- Queue Status -->
<div class="queue-status active">
  <div class="spinner"></div>
  <div class="queue-text">Searching for opponent...</div>
  <div class="queue-time">0:45</div>
  <button onclick="cancelSearch()">Cancel Search</button>
</div>
```

### Battle Page
```html
<!-- Battle Header -->
<div class="battle-header">
  <div class="game-mode-badge">🎯 STANDARD</div>
  <div class="battle-timer">14:32</div>
  <div class="market-symbol">SPY</div>
</div>

<!-- Player Panel -->
<div class="player-panel you">
  <div class="player-name">You</div>
  <div class="player-elo">Elo: 1200</div>
  <div class="portfolio-stats">
    <div>Portfolio Value: $102,500</div>
    <div>Return: +$2,500 (2.50%)</div>
    <div>Trades: 8</div>
  </div>
  <div class="trade-feed">
    <!-- Trade items -->
  </div>
</div>

<!-- Trade Controls -->
<input type="text" id="tradeSymbol" value="AAPL">
<input type="number" id="tradeShares" value="10">
<button class="trade-btn buy" onclick="executeTrade('buy')">
  📈 BUY
</button>
```

---

## 🐛 Troubleshooting

### Issue: Can't find match
**Causes**: 
- Not enough players online
- Elo range too narrow
- Backend not running

**Solutions**:
- Wait longer (search expands over time)
- Test with 2 browsers
- Check backend logs: `node index.js`

### Issue: Trades not updating
**Causes**:
- Socket.io not connected
- Battle status not "in-progress"
- Invalid trade data

**Solutions**:
- Check console: `socket.connected` should be `true`
- Verify battle status: `GET /api/battles/:battleId`
- Validate symbol, shares, price

### Issue: Elo not updating
**Causes**:
- Battle not completed
- Battle type is "friendly" (no Elo for friendly battles)
- Error in Elo calculation

**Solutions**:
- Call `POST /api/battles/:battleId/complete`
- Check battle type (must be "ranked")
- Check backend logs for errors

### Issue: Socket.io not connecting
**Causes**:
- Socket.io not installed
- CORS issues
- Invalid token

**Solutions**:
```bash
cd backend
npm install socket.io
```
- Check CORS settings in `socketService.js`
- Verify JWT token in localStorage

---

## 📁 File Structure

```
inv101/
├── backend/
│   ├── models/
│   │   └── TradingBattle.js          # 4 schemas (480+ lines)
│   ├── routes/
│   │   └── battles.js                # 15 endpoints (650+ lines)
│   ├── services/
│   │   └── socketService.js          # WebSocket events (modified)
│   └── index.js                      # Route integration (modified)
│
└── prototype/
    ├── matchmaking.html              # Matchmaking UI (380+ lines)
    ├── matchmaking.js                # Queue logic (500+ lines)
    ├── battle.html                   # Battle UI (420+ lines)
    └── battle.js                     # Battle logic (550+ lines)
```

**Total**: ~3,000 lines of new code

---

## ⚡ Performance Tips

### Frontend
```javascript
// Debounce trade cost calculation
const updateTradeCost = debounce(() => {
  const cost = shares * price;
  document.getElementById('estimatedCost').value = `$${cost}`;
}, 300);

// Limit trade feed items
const MAX_TRADES_DISPLAYED = 20;
if (trades.length > MAX_TRADES_DISPLAYED) {
  trades = trades.slice(-MAX_TRADES_DISPLAYED);
}
```

### Backend
```javascript
// Index matchmaking queue for fast queries
MatchmakingQueueSchema.index({ 
  gameMode: 1, 
  status: 1, 
  currentElo: 1 
});

// Limit leaderboard queries
GET /api/battles/leaderboard?limit=100

// Clean up old queue entries
setTimeout(async () => {
  await MatchmakingQueue.deleteMany({
    battleId: battle.battleId
  });
}, 5 * 60 * 1000); // 5 minutes
```

---

## 🎓 Best Practices

### Matchmaking
✅ Always check queue status on page load  
✅ Clear queue on page unload  
✅ Poll every 2-3 seconds (not faster)  
✅ Expand Elo range over time  
❌ Don't create multiple queue entries  

### Battle
✅ Validate trades before sending  
✅ Update UI optimistically  
✅ Handle Socket disconnections  
✅ Show loading states  
❌ Don't trust client-side portfolio calculations  

### Elo
✅ Use separate Elo per game mode  
✅ Track peak Elo  
✅ Save recent games  
✅ Implement anti-cheat measures  
❌ Don't award Elo for friendly battles  

---

## 🔐 Security Notes

### Authentication
- All API endpoints require JWT token
- Socket.io validates token on connect
- User ID extracted from token (not trusted from client)

### Trade Validation
- Server validates all trades
- Check sufficient funds
- Verify battle status (must be in-progress)
- Prevent duplicate trades

### Matchmaking
- One queue entry per user
- Validate game mode
- Check user exists
- Clean up abandoned entries

---

## 📚 Related Documentation

- `TRADING_BATTLES_IMPLEMENTATION.md` - Full implementation details
- `GAMIFICATION_IMPLEMENTATION.md` - XP, challenges, leaderboards
- `GAMIFICATION_QUICK_REFERENCE.md` - Quick XP/challenge reference
- `README.md` - Main project documentation

---

*Quick Reference v1.0.0*  
*Last Updated: December 2024*
