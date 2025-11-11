/**
 * Matchmaking - Find opponents for 1v1 trading battles
 * Handles game mode selection, queue management, and match notifications
 */

const API_BASE = 'http://localhost:4000/api';
let socket = null;
let userId = null;
let selectedGameMode = 'standard';
let inQueue = false;
let queueStartTime = null;
let queueTimer = null;
let pollInterval = null;

/**
 * Initialize matchmaking on page load
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
    alert('Please log in to access matchmaking');
    window.location.href = 'index.html';
    return;
  }
  
  // Initialize Socket.io
  initializeSocket();
  
  // Load user data
  await loadUserData();
  
  // Load pending challenges
  await loadChallenges();
  
  // Check if already in queue
  await checkQueueStatus();
});

/**
 * Initialize Socket.io connection
 */
function initializeSocket() {
  const token = localStorage.getItem('token');
  
  socket = io('http://localhost:4000', {
    auth: { token }
  });
  
  socket.on('connect', () => {
    console.log('✅ Socket connected');
  });
  
  socket.on('matchmaking_update', (data) => {
    console.log('Matchmaking update:', data);
    handleMatchmakingUpdate(data);
  });
  
  socket.on('friend_challenge', (challenge) => {
    console.log('New friend challenge:', challenge);
    loadChallenges();
  });
  
  socket.on('disconnect', () => {
    console.log('<span class="icon" data-icon="warning"></span> Socket disconnected');
  });
}

/**
 * Load user's Elo and stats
 */
async function loadUserData() {
  try {
    const response = await fetch(`${API_BASE}/battles/elo/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.elo) {
      // Update Elo displays
      document.getElementById('sprintElo').textContent = data.elo.sprintElo || 1200;
      document.getElementById('standardElo').textContent = data.elo.standardElo || 1200;
      document.getElementById('marathonElo').textContent = data.elo.marathonElo || 1200;
      
      // Calculate stats
      const totalBattles = data.elo.totalBattles || 0;
      const totalWins = (data.elo.sprintStats?.wins || 0) + 
                        (data.elo.standardStats?.wins || 0) + 
                        (data.elo.marathonStats?.wins || 0);
      const winRate = totalBattles > 0 ? ((totalWins / totalBattles) * 100).toFixed(1) : 0;
      
      document.getElementById('totalBattles').textContent = totalBattles;
      document.getElementById('winRate').textContent = `${winRate}%`;
      document.getElementById('currentStreak').textContent = data.elo.winStreak || 0;
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

/**
 * Load pending friend challenges
 */
async function loadChallenges() {
  try {
    const response = await fetch(`${API_BASE}/battles/challenges/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      displayChallenges(data.challenges || []);
    }
  } catch (error) {
    console.error('Error loading challenges:', error);
  }
}

/**
 * Display challenges in UI
 */
function displayChallenges(challenges) {
  const listElement = document.getElementById('challengesList');
  
  // Filter to show only challenges you've received
  const receivedChallenges = challenges.filter(c => 
    c.challenged.userId === userId && c.status === 'pending'
  );
  
  if (receivedChallenges.length === 0) {
    listElement.innerHTML = `
      <div class="no-challenges">
        No pending challenges. Challenge your friends to a battle!
      </div>
    `;
    return;
  }
  
  listElement.innerHTML = receivedChallenges.map(challenge => {
    const gameModeIcons = {
      sprint: '<span class="icon" data-icon="energy"></span>',
      standard: '<span class="icon" data-icon="target"></span>',
      marathon: '<span class="icon" data-icon="runner"></span>'
    };
    
    return `
      <div class="challenge-card">
        <div class="challenge-info">
          <div class="challenger-name">${challenge.challenger.username}</div>
          <div class="challenge-mode">
            ${gameModeIcons[challenge.gameMode]} ${challenge.gameMode.toUpperCase()} 
            • Elo: ${challenge.challenger.elo}
            ${challenge.message ? ` • "${challenge.message}"` : ''}
          </div>
        </div>
        <div class="challenge-actions">
          <button class="accept-btn" onclick="acceptChallenge('${challenge.challengeId}')">
            ✅ Accept
          </button>
          <button class="decline-btn" onclick="declineChallenge('${challenge.challengeId}')">
            ❌ Decline
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Select game mode
 */
function selectGameMode(mode) {
  if (inQueue) return; // Can't change mode while in queue
  
  selectedGameMode = mode;
  
  // Update UI
  document.querySelectorAll('.game-mode-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.querySelector(`[data-mode="${mode}"]`).classList.add('selected');
}

/**
 * Find a match
 */
async function findMatch() {
  if (inQueue) return;
  
  try {
    const response = await fetch(`${API_BASE}/battles/matchmaking/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        userId,
        gameMode: selectedGameMode
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to join matchmaking');
    }
    
    // Check if immediately matched
    if (data.matched) {
      handleMatchFound(data.battleId, data.opponent);
      return;
    }
    
    // Enter queue state
    enterQueue();
    
  } catch (error) {
    console.error('Error joining matchmaking:', error);
    alert('Failed to join matchmaking: ' + error.message);
  }
}

/**
 * Enter queue state
 */
function enterQueue() {
  inQueue = true;
  queueStartTime = Date.now();
  
  // Update UI
  document.getElementById('findMatchBtn').disabled = true;
  document.getElementById('queueStatus').classList.add('active');
  
  // Start queue timer
  startQueueTimer();
  
  // Poll for match status
  pollInterval = setInterval(checkMatchStatus, 2000);
}

/**
 * Exit queue state
 */
function exitQueue() {
  inQueue = false;
  
  // Clear intervals
  if (queueTimer) clearInterval(queueTimer);
  if (pollInterval) clearInterval(pollInterval);
  
  // Reset UI
  document.getElementById('findMatchBtn').disabled = false;
  document.getElementById('queueStatus').classList.remove('active');
  document.getElementById('queueTime').textContent = '0:00';
}

/**
 * Start queue timer display
 */
function startQueueTimer() {
  queueTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - queueStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    document.getElementById('queueTime').textContent = 
      `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

/**
 * Check match status periodically
 */
async function checkMatchStatus() {
  try {
    const response = await fetch(`${API_BASE}/battles/matchmaking/status/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.matched) {
      // Match found!
      exitQueue();
      
      // Load battle details
      const battleResponse = await fetch(`${API_BASE}/battles/${data.battleId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const battleData = await battleResponse.json();
      
      if (battleData.success) {
        const battle = battleData.battle;
        const isPlayer1 = battle.player1.userId === userId;
        const opponent = isPlayer1 ? battle.player2 : battle.player1;
        
        handleMatchFound(data.battleId, {
          username: opponent.username,
          elo: opponent.startingElo
        });
      }
    }
  } catch (error) {
    console.error('Error checking match status:', error);
  }
}

/**
 * Check if already in queue on page load
 */
async function checkQueueStatus() {
  try {
    const response = await fetch(`${API_BASE}/battles/matchmaking/status/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.inQueue) {
      // Resume queue state
      selectedGameMode = data.queueEntry.gameMode;
      selectGameMode(selectedGameMode);
      enterQueue();
    }
  } catch (error) {
    console.error('Error checking queue status:', error);
  }
}

/**
 * Cancel matchmaking search
 */
async function cancelSearch() {
  try {
    await fetch(`${API_BASE}/battles/matchmaking/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ userId })
    });
    
    exitQueue();
    
  } catch (error) {
    console.error('Error cancelling search:', error);
  }
}

/**
 * Handle matchmaking update from WebSocket
 */
function handleMatchmakingUpdate(data) {
  if (data.matched) {
    exitQueue();
    handleMatchFound(data.battleId, data.opponent);
  }
}

/**
 * Handle match found
 */
function handleMatchFound(battleId, opponent) {
  // Show match found UI
  document.getElementById('matchFound').classList.add('active');
  document.getElementById('opponentName').textContent = opponent.username || 'Unknown Player';
  document.getElementById('opponentElo').textContent = `Elo: ${opponent.elo || 1200}`;
  
  // Countdown to battle start
  let countdown = 3;
  document.getElementById('startingIn').textContent = countdown;
  
  const countdownInterval = setInterval(() => {
    countdown--;
    
    if (countdown <= 0) {
      clearInterval(countdownInterval);
      // Navigate to battle
      window.location.href = `battle.html?battleId=${battleId}`;
    } else {
      document.getElementById('startingIn').textContent = countdown;
    }
  }, 1000);
}

/**
 * Accept a friend challenge
 */
async function acceptChallenge(challengeId) {
  try {
    const response = await fetch(`${API_BASE}/battles/challenge/${challengeId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ userId })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to accept challenge');
    }
    
    // Navigate to battle
    window.location.href = `battle.html?battleId=${data.battle.battleId}`;
    
  } catch (error) {
    console.error('Error accepting challenge:', error);
    alert('Failed to accept challenge: ' + error.message);
  }
}

/**
 * Decline a friend challenge
 */
async function declineChallenge(challengeId) {
  try {
    await fetch(`${API_BASE}/battles/challenge/${challengeId}/decline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ userId })
    });
    
    // Reload challenges
    await loadChallenges();
    
  } catch (error) {
    console.error('Error declining challenge:', error);
    alert('Failed to decline challenge: ' + error.message);
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (inQueue) {
    cancelSearch();
  }
  
  if (socket) {
    socket.disconnect();
  }
});
