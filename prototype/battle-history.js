/**
 * Battle History - Display past trading battles
 */

const API_BASE = 'http://localhost:4000/api';
let userId = null;
let allBattles = [];

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Get user ID from token
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
    alert('Please log in to view battle history');
    window.location.href = 'index.html';
    return;
  }
  
  // Load battle history
  await loadBattleHistory();
});

/**
 * Load battle history from API
 */
async function loadBattleHistory() {
  try {
    const gameModeFilter = document.getElementById('gameModeFilter').value;
    const resultFilter = document.getElementById('resultFilter').value;
    const limit = document.getElementById('limitFilter').value;
    
    // Show loading
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('battleList').innerHTML = '';
    document.getElementById('noHistory').style.display = 'none';
    
    // Build query
    let url = `${API_BASE}/battles/history/${userId}?limit=${limit}`;
    if (gameModeFilter) {
      url += `&gameMode=${gameModeFilter}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to load battle history');
    }
    
    allBattles = data.battles || [];
    
    // Apply result filter client-side
    let filteredBattles = allBattles;
    if (resultFilter) {
      filteredBattles = allBattles.filter(battle => {
        const isPlayer1 = battle.player1.userId === userId;
        const won = (isPlayer1 && battle.winner === 'player1') || (!isPlayer1 && battle.winner === 'player2');
        const lost = (isPlayer1 && battle.winner === 'player2') || (!isPlayer1 && battle.winner === 'player1');
        const draw = battle.winner === 'draw';
        
        if (resultFilter === 'win') return won;
        if (resultFilter === 'loss') return lost;
        if (resultFilter === 'draw') return draw;
        return true;
      });
    }
    
    // Hide loading
    document.getElementById('loadingState').style.display = 'none';
    
    // Display battles
    if (filteredBattles.length === 0) {
      document.getElementById('noHistory').style.display = 'block';
    } else {
      displayBattles(filteredBattles);
    }
    
  } catch (error) {
    console.error('Error loading battle history:', error);
    document.getElementById('loadingState').innerHTML = `
      <div style="color: #ef4444;">
        Failed to load battle history. Please try again.
      </div>
    `;
  }
}

/**
 * Display battles in the UI
 */
function displayBattles(battles) {
  const container = document.getElementById('battleList');
  
  const html = battles.map(battle => {
    const isPlayer1 = battle.player1.userId === userId;
    const you = isPlayer1 ? battle.player1 : battle.player2;
    const opponent = isPlayer1 ? battle.player2 : battle.player1;
    const yourResults = isPlayer1 ? battle.player1Results : battle.player2Results;
    const opponentResults = isPlayer1 ? battle.player2Results : battle.player1Results;
    
    // Determine result
    let resultText = '';
    let resultClass = '';
    
    if (battle.winner === 'draw') {
      resultText = '🤝 DRAW';
      resultClass = 'result-draw';
    } else {
      const won = (isPlayer1 && battle.winner === 'player1') || (!isPlayer1 && battle.winner === 'player2');
      if (won) {
        resultText = '<span class="icon" data-icon="trophy"></span> VICTORY';
        resultClass = 'result-win';
      } else {
        resultText = '<span class="icon" data-icon="sad"></span> DEFEAT';
        resultClass = 'result-loss';
      }
    }
    
    // Game mode icons
    const modeIcons = {
      sprint: '<span class="icon" data-icon="energy"></span>',
      standard: '<span class="icon" data-icon="target"></span>',
      marathon: '<span class="icon" data-icon="runner"></span>'
    };
    const modeIcon = modeIcons[battle.gameMode] || '<span class="icon" data-icon="game"></span>';
    
    // Format date
    const date = new Date(battle.endTime || battle.startTime);
    const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    
    // Elo change
    const eloChange = you.eloChange || 0;
    const eloClass = eloChange >= 0 ? 'positive' : 'negative';
    const eloSign = eloChange >= 0 ? '+' : '';
    
    return `
      <div class="battle-card" onclick="viewBattleDetails('${battle.battleId}')">
        <div class="battle-header">
          <div class="battle-mode">
            ${modeIcon} ${battle.gameMode.toUpperCase()}
          </div>
          <div class="battle-date">${dateStr}</div>
        </div>
        
        <div class="battle-result ${resultClass}">
          ${resultText}
        </div>
        
        <div class="battle-stats">
          <div class="player-stats you">
            <div class="player-name">You (${you.username})</div>
            <div class="stat-row">
              <span class="stat-label">Portfolio Value</span>
              <span class="stat-value">$${yourResults.finalPortfolioValue?.toLocaleString() || '100,000'}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Return</span>
              <span class="stat-value" style="color: ${yourResults.returnPercentage >= 0 ? '#10b981' : '#ef4444'}">
                ${yourResults.returnPercentage >= 0 ? '+' : ''}${yourResults.returnPercentage?.toFixed(2)}%
              </span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Trades</span>
              <span class="stat-value">${yourResults.tradesExecuted || 0}</span>
            </div>
            <div class="elo-change ${eloClass}">
              ${eloSign}${eloChange} Elo
            </div>
          </div>
          
          <div class="player-stats opponent">
            <div class="player-name">Opponent (${opponent.username})</div>
            <div class="stat-row">
              <span class="stat-label">Portfolio Value</span>
              <span class="stat-value">$${opponentResults.finalPortfolioValue?.toLocaleString() || '100,000'}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Return</span>
              <span class="stat-value" style="color: ${opponentResults.returnPercentage >= 0 ? '#10b981' : '#ef4444'}">
                ${opponentResults.returnPercentage >= 0 ? '+' : ''}${opponentResults.returnPercentage?.toFixed(2)}%
              </span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Trades</span>
              <span class="stat-value">${opponentResults.tradesExecuted || 0}</span>
            </div>
            <div class="elo-change ${opponent.eloChange >= 0 ? 'positive' : 'negative'}">
              ${opponent.eloChange >= 0 ? '+' : ''}${opponent.eloChange || 0} Elo
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = html;
}

/**
 * View detailed battle recap
 */
function viewBattleDetails(battleId) {
  // Navigate to battle replay page (to be implemented)
  // For now, just show an alert
  alert(`Battle details view coming soon!\n\nBattle ID: ${battleId}\n\nThis will show:\n- Trade-by-trade replay\n- Performance charts\n- Detailed statistics`);
}
