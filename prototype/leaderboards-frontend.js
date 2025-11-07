/**
 * Leaderboards Frontend Script
 * Displays competitive rankings for XP, Streaks, Lessons, and Performance
 */

(function() {
  'use strict';

  // Configuration
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3030' 
    : 'https://investing101-api.up.railway.app';

  let currentTab = 'xp';
  let currentTimeFilter = 'all';
  let currentUserId = localStorage.getItem('inv101_userId') || 'demo-user';

  /**
   * Initialize leaderboards
   */
  function initLeaderboards() {
    setupTabListeners();
    setupTimeFilterListeners();
    loadLeaderboard();
  }

  /**
   * Setup tab click listeners
   */
  function setupTabListeners() {
    const tabs = document.querySelectorAll('.leaderboard-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Update current tab
        currentTab = tab.dataset.tab;
        
        // Reload leaderboard
        loadLeaderboard();
      });
    });
  }

  /**
   * Setup time filter listeners
   */
  function setupTimeFilterListeners() {
    const filters = document.querySelectorAll('.time-filter');
    filters.forEach(filter => {
      filter.addEventListener('click', () => {
        // Remove active class from all filters
        filters.forEach(f => f.classList.remove('active'));
        
        // Add active class to clicked filter
        filter.classList.add('active');
        
        // Update current filter
        currentTimeFilter = filter.dataset.time;
        
        // Reload leaderboard
        loadLeaderboard();
      });
    });
  }

  /**
   * Load leaderboard data from API
   */
  async function loadLeaderboard() {
    showLoading();
    hideError();

    try {
      const response = await fetch(
        `${API_BASE}/api/user-profile/leaderboard?type=${currentTab}&limit=100`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      
      if (data.success && data.leaderboard) {
        displayLeaderboard(data.leaderboard);
      } else {
        throw new Error('Invalid leaderboard data');
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      showError();
    }
  }

  /**
   * Display leaderboard data
   */
  function displayLeaderboard(leaderboard) {
    // Filter by time if needed (for now we'll show all, can add backend filtering later)
    const filteredLeaderboard = filterByTime(leaderboard, currentTimeFilter);

    // Update podium (top 3)
    updatePodium(filteredLeaderboard.slice(0, 3));

    // Update full leaderboard table
    updateLeaderboardTable(filteredLeaderboard);

    // Update user's rank card
    updateUserRankCard(filteredLeaderboard);

    // Update header text based on tab
    updateStatHeader();

    // Show leaderboard, hide loading
    hideLoading();
    document.getElementById('leaderboardTable').style.display = 'block';
  }

  /**
   * Filter leaderboard by time period
   * Note: This is client-side filtering. Ideally should be done server-side
   */
  function filterByTime(leaderboard, timeFilter) {
    // For now, return all since we don't have time-based data
    // In production, this would be handled by the backend
    return leaderboard;
  }

  /**
   * Update podium display (top 3)
   */
  function updatePodium(top3) {
    if (top3.length >= 1) {
      document.getElementById('rank1-name').textContent = top3[0].username || `User ${top3[0].userId.slice(-4)}`;
      document.getElementById('rank1-stat').textContent = formatStatValue(top3[0][getStatKey()]);
    }
    
    if (top3.length >= 2) {
      document.getElementById('rank2-name').textContent = top3[1].username || `User ${top3[1].userId.slice(-4)}`;
      document.getElementById('rank2-stat').textContent = formatStatValue(top3[1][getStatKey()]);
    }
    
    if (top3.length >= 3) {
      document.getElementById('rank3-name').textContent = top3[2].username || `User ${top3[2].userId.slice(-4)}`;
      document.getElementById('rank3-stat').textContent = formatStatValue(top3[2][getStatKey()]);
    }
  }

  /**
   * Update leaderboard table
   */
  function updateLeaderboardTable(leaderboard) {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';

    // Start from rank 4 (top 3 are in podium)
    const startRank = 4;
    const tableData = leaderboard.slice(3);

    tableData.forEach((user, index) => {
      const rank = startRank + index;
      const isCurrentUser = user.userId === currentUserId;
      
      const row = document.createElement('tr');
      row.className = `leaderboard-row ${isCurrentUser ? 'user-row' : ''}`;
      
      row.innerHTML = `
        <td class="px-4 py-3">
          <span class="rank-badge ${rank <= 10 ? 'top-10' : rank <= 50 ? 'top-50' : ''}">${rank}</span>
        </td>
        <td class="px-4 py-3 font-semibold">
          ${user.username || `User ${user.userId.slice(-4)}`}
          ${isCurrentUser ? '<span class="ml-2 text-xs text-primary-green">(You)</span>' : ''}
        </td>
        <td class="px-4 py-3">
          <span class="level-badge">Lvl ${user.level || 1}</span>
        </td>
        <td class="px-4 py-3 text-right font-bold text-primary-green">
          ${formatStatValue(user[getStatKey()])}
        </td>
      `;
      
      tbody.appendChild(row);
    });
  }

  /**
   * Update user's rank card
   */
  function updateUserRankCard(leaderboard) {
    const userIndex = leaderboard.findIndex(user => user.userId === currentUserId);
    
    if (userIndex !== -1) {
      const rank = userIndex + 1;
      const userStat = leaderboard[userIndex][getStatKey()];
      
      document.getElementById('userRank').textContent = rank;
      document.getElementById('userStatValue').textContent = formatStatValue(userStat);
      document.getElementById('userStatLabel').textContent = getStatLabel();
      document.getElementById('userRankCard').style.display = 'block';
    } else {
      document.getElementById('userRankCard').style.display = 'none';
    }
  }

  /**
   * Update stat header based on current tab
   */
  function updateStatHeader() {
    document.getElementById('statHeader').textContent = getStatLabel();
  }

  /**
   * Get stat key based on current tab
   */
  function getStatKey() {
    switch(currentTab) {
      case 'xp':
        return 'xp';
      case 'streak':
        return 'streak';
      case 'lessons':
        return 'lessonsCompleted';
      case 'performance':
        return 'xp'; // Could be a different metric
      default:
        return 'xp';
    }
  }

  /**
   * Get stat label based on current tab
   */
  function getStatLabel() {
    switch(currentTab) {
      case 'xp':
        return 'XP';
      case 'streak':
        return 'Streak';
      case 'lessons':
        return 'Lessons';
      case 'performance':
        return 'Performance';
      default:
        return 'XP';
    }
  }

  /**
   * Format stat value for display
   */
  function formatStatValue(value) {
    if (typeof value === 'number') {
      if (currentTab === 'streak') {
        return `${value} ${value === 1 ? 'day' : 'days'}`;
      } else if (currentTab === 'lessons') {
        return value.toString();
      } else {
        return value.toLocaleString();
      }
    }
    return value || '0';
  }

  /**
   * Show loading state
   */
  function showLoading() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('leaderboardTable').style.display = 'none';
  }

  /**
   * Hide loading state
   */
  function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
  }

  /**
   * Show error state
   */
  function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('leaderboardTable').style.display = 'none';
  }

  /**
   * Hide error state
   */
  function hideError() {
    document.getElementById('errorState').style.display = 'none';
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLeaderboards);
  } else {
    initLeaderboards();
  }

  // Expose to global scope for retry button
  window.loadLeaderboard = loadLeaderboard;
})();
