/**
 * Challenges Frontend Script
 * Handles daily challenges and active challenges display
 */

(function() {
  'use strict';

  // Configuration
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3030' 
    : 'https://investing101-api.up.railway.app';

  const userId = localStorage.getItem('inv101_userId') || 'demo-user';

  const categoryEmojis = {
    'lessons': '📚',
    'quizzes': '📝',
    'calculations': '🧮',
    'simulations': '💹',
    'streak': '🔥',
    'mixed': '🎯'
  };

  /**
   * Initialize challenges page
   */
  function initChallenges() {
    loadDailyChallenge();
    loadActiveChallenges();
    loadUserStats();
  }

  /**
   * Load today's daily challenge
   */
  async function loadDailyChallenge() {
    try {
      const response = await fetch(`${API_BASE}/api/challenges/daily?userId=${userId}`);
      const data = await response.json();

      if (data.success && data.challenge) {
        displayDailyChallenge(data.challenge);
      } else {
        showDailyChallengeError();
      }
    } catch (error) {
      console.error('Error loading daily challenge:', error);
      showDailyChallengeError();
    }
  }

  /**
   * Display daily challenge
   */
  function displayDailyChallenge(challenge) {
    document.getElementById('dailyChallengeLoading').style.display = 'none';
    document.getElementById('dailyChallengeContent').style.display = 'block';

    // Set emoji based on category
    document.getElementById('dailyEmoji').textContent = categoryEmojis[challenge.category] || '🎯';

    // Set challenge details
    document.getElementById('dailyTitle').textContent = challenge.title;
    document.getElementById('dailyDescription').textContent = challenge.description;
    
    const xpReward = challenge.xpReward * (challenge.bonusMultiplier || 1);
    document.getElementById('dailyReward').textContent = `+${xpReward} XP`;
    document.getElementById('dailyBonus').textContent = challenge.bonusMultiplier > 1 
      ? `${challenge.bonusMultiplier}X XP` 
      : 'Daily';

    // Set progress
    const userProgress = challenge.userProgress;
    const current = userProgress ? userProgress.progress.current : 0;
    const target = challenge.requirement.target;
    const percentage = Math.min(100, Math.round((current / target) * 100));

    document.getElementById('dailyCurrent').textContent = current;
    document.getElementById('dailyTarget').textContent = target;
    document.getElementById('dailyProgressBar').style.width = `${percentage}%`;
    document.getElementById('dailyProgressPercent').textContent = percentage;

    // Show status
    if (userProgress && userProgress.status === 'completed') {
      document.getElementById('dailyCompleted').style.display = 'flex';
      document.getElementById('dailyInProgress').style.display = 'none';
    } else {
      document.getElementById('dailyCompleted').style.display = 'none';
      document.getElementById('dailyInProgress').style.display = 'flex';
    }
  }

  /**
   * Show daily challenge error
   */
  function showDailyChallengeError() {
    document.getElementById('dailyChallengeLoading').innerHTML = `
      <div class="text-center py-8">
        <p class="text-red-500">Failed to load daily challenge</p>
        <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-primary-green text-white rounded-lg">
          Retry
        </button>
      </div>
    `;
  }

  /**
   * Load active challenges
   */
  async function loadActiveChallenges() {
    try {
      const response = await fetch(`${API_BASE}/api/challenges/active?userId=${userId}`);
      const data = await response.json();

      if (data.success && data.challenges) {
        displayActiveChallenges(data.challenges);
      } else {
        showNoChallenges();
      }
    } catch (error) {
      console.error('Error loading active challenges:', error);
      showNoChallenges();
    }
  }

  /**
   * Display active challenges
   */
  function displayActiveChallenges(challenges) {
    document.getElementById('activeChallengesLoading').style.display = 'none';

    // Filter out daily challenges (already shown above)
    const nonDailyChallenges = challenges.filter(c => c.type !== 'daily');

    if (nonDailyChallenges.length === 0) {
      showNoChallenges();
      return;
    }

    document.getElementById('activeChallengesList').style.display = 'grid';
    const container = document.getElementById('activeChallengesList');
    container.innerHTML = '';

    nonDailyChallenges.forEach(challenge => {
      const card = createChallengeCard(challenge);
      container.appendChild(card);
    });
  }

  /**
   * Create challenge card element
   */
  function createChallengeCard(challenge) {
    const card = document.createElement('div');
    card.className = 'card border-2 border-slate-200 dark:border-slate-700 hover:border-primary-green transition';

    const userProgress = challenge.userProgress;
    const current = userProgress ? userProgress.progress.current : 0;
    const target = challenge.requirement.target;
    const percentage = Math.min(100, Math.round((current / target) * 100));
    const isCompleted = userProgress && userProgress.status === 'completed';

    const typeColors = {
      'weekly': 'bg-purple-500',
      'special': 'bg-amber-500',
      'community': 'bg-blue-500'
    };

    card.innerHTML = `
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-1 ${typeColors[challenge.type] || 'bg-slate-500'} text-white text-xs font-bold rounded-full uppercase">
              ${challenge.type}
            </span>
            ${challenge.bonusMultiplier > 1 ? `
              <span class="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                ${challenge.bonusMultiplier}X XP
              </span>
            ` : ''}
          </div>
          <h4 class="text-lg font-bold mb-1">${challenge.title}</h4>
          <p class="text-sm text-slate-600 dark:text-slate-400">${challenge.description}</p>
        </div>
        <div class="text-3xl ml-4">${categoryEmojis[challenge.category] || '🎯'}</div>
      </div>

      <div class="mb-3">
        <div class="flex justify-between text-sm mb-2">
          <span class="font-semibold">Progress</span>
          <span class="font-bold text-primary-green">${current} / ${target}</span>
        </div>
        <div class="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-primary-green to-emerald-600 transition-all duration-300" style="width: ${percentage}%"></div>
        </div>
      </div>

      <div class="flex items-center justify-between">
        ${isCompleted ? `
          <div class="flex items-center gap-2 text-green-600 dark:text-green-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="font-bold">Completed!</span>
          </div>
        ` : `
          <div class="text-sm text-slate-600 dark:text-slate-400">
            ${percentage}% complete
          </div>
        `}
        <div class="text-right">
          <div class="text-sm text-slate-600 dark:text-slate-400">Reward</div>
          <div class="text-lg font-bold text-primary-green">+${challenge.xpReward * (challenge.bonusMultiplier || 1)} XP</div>
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Show no challenges message
   */
  function showNoChallenges() {
    document.getElementById('activeChallengesLoading').style.display = 'none';
    document.getElementById('noChallenges').style.display = 'block';
  }

  /**
   * Load user challenge stats
   */
  async function loadUserStats() {
    try {
      const response = await fetch(`${API_BASE}/api/challenges/users/${userId}/progress?status=completed`);
      const data = await response.json();

      if (data.success && data.progress) {
        const completedCount = data.progress.length;
        const totalXP = data.progress.reduce((sum, p) => sum + (p.xpAwarded || 0), 0);

        document.getElementById('completedCount').textContent = completedCount;
        document.getElementById('totalXPEarned').textContent = totalXP.toLocaleString();
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }

  /**
   * Refresh challenges (reload page)
   */
  window.refreshChallenges = function() {
    loadDailyChallenge();
    loadActiveChallenges();
    loadUserStats();
  };

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChallenges);
  } else {
    initChallenges();
  }
})();
