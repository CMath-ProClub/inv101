/**
 * Trading Battle - Real-time 1v1 Trading Competition
 * Handles battle state, WebSocket updates, and trade execution
 */

const API_BASE = 'http://localhost:4000/api';
let socket = null;
let battleId = null;
let battleData = null;
let userId = null;
let timerInterval = null;
let remainingSeconds = 0;

/**
 * Initialize battle on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Get battle ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  battleId = urlParams.get('battleId');
  
  if (!battleId) {
    showStatus('No battle ID provided', 'error');
    return;
  }
  
  // Get user ID from localStorage
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.userId;
    } catch (err) {
      console.error('Error parsing token:', err);
    }
  }
  
  if (!userId) {
    showStatus('Please log in to participate in battles', 'error');
    return;
  }
  
  // Initialize Socket.io
  initializeSocket();
  
  // Load battle data
  await loadBattle();
  
  // Start battle timer
  startTimer();
  
  // Update trade cost estimate on input change
  document.getElementById('tradeShares').addEventListener('input', updateTradeCost);
});

/**
 * Initialize Socket.io connection for real-time updates
 */
function initializeSocket() {
  const token = localStorage.getItem('token');
  
  socket = io('http://localhost:4000', {
    auth: { token }
  });
  
  socket.on('connect', () => {
    console.log('✅ Socket connected');
    socket.emit('join_battle', battleId);
  });
  
  socket.on('battle_trade', (data) => {
    console.log('Trade received:', data);
    handleOpponentTrade(data);
  });
  
  socket.on('battle_update', (update) => {
    console.log('Battle update:', update);
    handleBattleUpdate(update);
  });
  
  socket.on('battle_complete', (results) => {
    console.log('Battle complete:', results);
    handleBattleComplete(results);
  });
  
  socket.on('opponent_ready', (data) => {
    console.log('Opponent ready:', data);
  });
  
  socket.on('disconnect', () => {
    console.log('<span class="icon" data-icon="warning"></span> Socket disconnected');
  });
}

/**
 * Load battle data from API
 */
async function loadBattle() {
  try {
    const response = await fetch(`${API_BASE}/battles/${battleId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to load battle');
    }
    
    battleData = data.battle;
    
    // Update UI
    updateBattleDisplay();
    
    // Check if battle is complete
    if (battleData.status === 'completed') {
      handleBattleComplete(battleData);
    }
    
  } catch (error) {
    console.error('Error loading battle:', error);
    showStatus('Failed to load battle: ' + error.message, 'error');
  }
}

/**
 * Update battle display with current data
 */
function updateBattleDisplay() {
  if (!battleData) return;
  
  // Determine which player is you
  const isPlayer1 = battleData.player1.userId === userId;
  const you = isPlayer1 ? battleData.player1 : battleData.player2;
  const opponent = isPlayer1 ? battleData.player2 : battleData.player1;
  
  // Update header
  const gameModes = {
    sprint: '<span class="icon" data-icon="energy"></span> SPRINT (5 min)',
    standard: '<span class="icon" data-icon="target"></span> STANDARD (15 min)',
    marathon: '<span class="icon" data-icon="runner"></span> MARATHON (30 min)'
  };
  document.getElementById('gameModeDisplay').textContent = gameModes[battleData.gameMode] || battleData.gameMode;
  document.getElementById('battleIdDisplay').textContent = `Battle ID: ${battleData.battleId}`;
  document.getElementById('marketSymbol').textContent = battleData.market || 'SPY';
  
  // Update player info
  document.getElementById('yourName').textContent = you.username;
  document.getElementById('yourElo').textContent = `Elo: ${you.startingElo}`;
  document.getElementById('opponentName').textContent = opponent.username;
  document.getElementById('opponentElo').textContent = `Elo: ${opponent.startingElo}`;
  
  // Update portfolio stats
  updatePortfolioStats();
  
  // Update trade feeds
  updateTradeFeed('yourTradeFeed', isPlayer1 ? battleData.player1Trades : battleData.player2Trades);
  updateTradeFeed('opponentTradeFeed', isPlayer1 ? battleData.player2Trades : battleData.player1Trades);
  
  // Calculate remaining time
  if (battleData.startTime) {
    const gameDurations = { sprint: 300, standard: 900, marathon: 1800 };
    const duration = gameDurations[battleData.gameMode] || 900;
    const startTime = new Date(battleData.startTime).getTime();
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    remainingSeconds = Math.max(0, duration - elapsed);
  }
}

/**
 * Update portfolio statistics
 */
function updatePortfolioStats() {
  if (!battleData) return;
  
  const isPlayer1 = battleData.player1.userId === userId;
  const yourTrades = isPlayer1 ? battleData.player1Trades : battleData.player2Trades;
  const opponentTrades = isPlayer1 ? battleData.player2Trades : battleData.player1Trades;
  
  // Calculate portfolio values (simplified - would need full position tracking)
  const startingCash = battleData.startingCapital || 100000;
  
  // Your stats
  document.getElementById('yourPortfolioValue').textContent = `$${startingCash.toLocaleString()}`;
  document.getElementById('yourCash').textContent = `$${startingCash.toLocaleString()}`;
  document.getElementById('yourReturn').textContent = `+$0 (0.00%)`;
  document.getElementById('yourTrades').textContent = yourTrades.length;
  
  // Opponent stats
  document.getElementById('opponentPortfolioValue').textContent = `$${startingCash.toLocaleString()}`;
  document.getElementById('opponentCash').textContent = `$${startingCash.toLocaleString()}`;
  document.getElementById('opponentReturn').textContent = `+$0 (0.00%)`;
  document.getElementById('opponentTrades').textContent = opponentTrades.length;
}

/**
 * Update trade feed display
 */
function updateTradeFeed(elementId, trades) {
  const feedElement = document.getElementById(elementId);
  
  if (!trades || trades.length === 0) {
    feedElement.innerHTML = '<div style="color: #9ca3af; text-align: center; padding: 20px;">No trades yet</div>';
    return;
  }
  
  feedElement.innerHTML = trades.slice().reverse().map(trade => {
    const time = new Date(trade.timestamp).toLocaleTimeString();
    const actionClass = trade.action === 'buy' ? 'buy' : 'sell';
    const actionIcon = trade.action === 'buy' ? '<span class="icon" data-icon="chart-up"></span>' : '<span class="icon" data-icon="chart-down"></span>';
    
    return `
      <div class="trade-item ${actionClass}">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${actionIcon} ${trade.action.toUpperCase()} ${trade.shares} ${trade.symbol}</strong>
            <div class="trade-time">${time} • $${trade.price.toFixed(2)}</div>
          </div>
          <div style="font-weight: bold;">
            $${(trade.shares * trade.price).toLocaleString()}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Handle opponent trade from WebSocket
 */
function handleOpponentTrade(data) {
  if (!battleData) return;
  
  const isPlayer1 = battleData.player1.userId === userId;
  
  // Add trade to appropriate array
  if (data.playerId === (isPlayer1 ? battleData.player2.userId : battleData.player1.userId)) {
    const opponentTrades = isPlayer1 ? battleData.player2Trades : battleData.player1Trades;
    opponentTrades.push(data.trade);
    
    // Update display
    updateTradeFeed('opponentTradeFeed', opponentTrades);
    updatePortfolioStats();
  }
}

/**
 * Handle battle update from WebSocket
 */
function handleBattleUpdate(update) {
  // Merge update into battleData
  Object.assign(battleData, update);
  updateBattleDisplay();
}

/**
 * Execute a trade
 */
async function executeTrade(action) {
  const symbol = document.getElementById('tradeSymbol').value.trim().toUpperCase();
  const shares = parseInt(document.getElementById('tradeShares').value);
  const price = parseFloat(document.getElementById('currentPrice').value.replace('$', ''));
  
  if (!symbol || !shares || shares <= 0) {
    alert('Please enter a valid symbol and share quantity');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/battles/${battleId}/trade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        userId,
        action,
        symbol,
        shares,
        price
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to execute trade');
    }
    
    // Update local battle data
    battleData = data.battle;
    updateBattleDisplay();
    
    // Show success feedback
    const btn = action === 'buy' ? event.target : event.target;
    const originalText = btn.textContent;
    btn.textContent = action === 'buy' ? '✅ BOUGHT' : '✅ SOLD';
    btn.disabled = true;
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 1000);
    
  } catch (error) {
    console.error('Error executing trade:', error);
    alert('Failed to execute trade: ' + error.message);
  }
}

/**
 * Update estimated trade cost
 */
function updateTradeCost() {
  const shares = parseInt(document.getElementById('tradeShares').value) || 0;
  const price = parseFloat(document.getElementById('currentPrice').value.replace('$', '')) || 0;
  const cost = shares * price;
  
  document.getElementById('estimatedCost').value = `$${cost.toLocaleString()}`;
}

/**
 * Start battle timer
 */
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      completeBattle();
      return;
    }
    
    remainingSeconds--;
    
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    document.getElementById('battleTimer').textContent = 
      `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Warning at 1 minute
    if (remainingSeconds === 60) {
      showStatus('<span class="icon" data-icon="warning"></span> 1 minute remaining!', 'warning');
    }
    
  }, 1000);
}

/**
 * Complete battle
 */
async function completeBattle() {
  try {
    const response = await fetch(`${API_BASE}/battles/${battleId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to complete battle');
    }
    
    handleBattleComplete(data.battle);
    
  } catch (error) {
    console.error('Error completing battle:', error);
    showStatus('Failed to complete battle: ' + error.message, 'error');
  }
}

/**
 * Handle battle completion
 */
function handleBattleComplete(results) {
  // Hide battle grid
  document.getElementById('battleGrid').style.display = 'none';
  
  // Show results
  const resultsDiv = document.getElementById('battleResults');
  resultsDiv.style.display = 'block';
  
  const isPlayer1 = results.player1.userId === userId;
  const you = isPlayer1 ? results.player1 : results.player2;
  const opponent = isPlayer1 ? results.player2 : results.player1;
  const yourResults = isPlayer1 ? results.player1Results : results.player2Results;
  const opponentResults = isPlayer1 ? results.player2Results : results.player1Results;
  
  // Determine result
  let resultEmoji = '<span class="icon" data-icon="trophy"></span>';
  let resultTitle = 'Victory!';
  let resultSubtitle = 'You outperformed your opponent!';
  
  if (results.winner === 'draw') {
    resultEmoji = '🤝';
    resultTitle = 'Draw';
    resultSubtitle = 'You matched your opponent\'s performance!';
  } else if ((isPlayer1 && results.winner === 'player2') || (!isPlayer1 && results.winner === 'player1')) {
    resultEmoji = '<span class="icon" data-icon="sad"></span>';
    resultTitle = 'Defeat';
    resultSubtitle = 'Your opponent outperformed you.';
  }
  
  document.getElementById('resultEmoji').textContent = resultEmoji;
  document.getElementById('resultTitle').textContent = resultTitle;
  document.getElementById('resultSubtitle').textContent = resultSubtitle;
  
  // Your results
  const yourReturnClass = yourResults.totalReturn >= 0 ? 'positive' : 'negative';
  document.getElementById('yourFinalReturn').innerHTML = 
    `<span class="stat-value ${yourReturnClass}">
      ${yourResults.totalReturn >= 0 ? '+' : ''}$${yourResults.totalReturn.toLocaleString()} 
      (${yourResults.returnPercentage.toFixed(2)}%)
    </span>`;
  document.getElementById('yourFinalTrades').textContent = `${yourResults.tradesExecuted} trades executed`;
  document.getElementById('yourFinalSharpe').textContent = `Sharpe Ratio: ${yourResults.sharpeRatio?.toFixed(2) || 'N/A'}`;
  
  // Opponent results
  const oppReturnClass = opponentResults.totalReturn >= 0 ? 'positive' : 'negative';
  document.getElementById('opponentFinalReturn').innerHTML = 
    `<span class="stat-value ${oppReturnClass}">
      ${opponentResults.totalReturn >= 0 ? '+' : ''}$${opponentResults.totalReturn.toLocaleString()} 
      (${opponentResults.returnPercentage.toFixed(2)}%)
    </span>`;
  document.getElementById('opponentFinalTrades').textContent = `${opponentResults.tradesExecuted} trades executed`;
  document.getElementById('opponentFinalSharpe').textContent = `Sharpe Ratio: ${opponentResults.sharpeRatio?.toFixed(2) || 'N/A'}`;
  
  // Elo changes
  if (you.eloChange !== undefined) {
    const eloChangeClass = you.eloChange >= 0 ? 'positive' : 'negative';
    document.getElementById('yourEloChange').textContent = 
      `${you.eloChange >= 0 ? '+' : ''}${you.eloChange}`;
    document.getElementById('yourEloChange').className = `elo-change ${eloChangeClass}`;
    document.getElementById('yourNewElo').textContent = you.currentElo || (you.startingElo + you.eloChange);
  }
  
  if (opponent.eloChange !== undefined) {
    const oppEloChangeClass = opponent.eloChange >= 0 ? 'positive' : 'negative';
    document.getElementById('opponentEloChange').textContent = 
      `${opponent.eloChange >= 0 ? '+' : ''}${opponent.eloChange}`;
    document.getElementById('opponentEloChange').className = `elo-change ${oppEloChangeClass}`;
    document.getElementById('opponentNewElo').textContent = opponent.currentElo || (opponent.startingElo + opponent.eloChange);
  }
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
  const statusDiv = document.getElementById('statusMessage');
  statusDiv.textContent = message;
  statusDiv.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 5000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (socket) {
    socket.emit('leave_battle', battleId);
    socket.disconnect();
  }
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
