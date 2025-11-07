// Gamification Widget - Shows XP, Level, Streak across all pages
(function() {
  'use strict';

  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : 'https://inv101-production.up.railway.app';

  // Initialize gamification widget
  function initGamificationWidget() {
    // Check if user is logged in
    const userId = getUserId();
    if (!userId) return;

    // Create widget HTML
    const widget = createWidget();
    document.body.appendChild(widget);

    // Load user data
    loadUserProgress(userId);
  }

  function getUserId() {
    // Try to get from localStorage (demo mode) or session
    return localStorage.getItem('inv101_userId') || sessionStorage.getItem('inv101_userId');
  }

  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'gamification-widget';
    widget.className = 'gamification-widget';
    widget.innerHTML = `
      <style>
        .gamification-widget {
          position: fixed;
          top: 80px;
          right: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 16px;
          min-width: 200px;
          z-index: 1000;
          transition: all 0.3s ease;
          display: none;
        }
        
        .gamification-widget.visible {
          display: block;
        }

        .gamification-widget.collapsed {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .dark .gamification-widget {
          background: #1e293b;
          color: white;
        }

        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .widget-title {
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }

        .dark .widget-title {
          color: #e2e8f0;
        }

        .widget-collapse-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #64748b;
        }

        .widget-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .dark .widget-stat {
          border-color: #334155;
        }

        .widget-stat:last-child {
          border-bottom: none;
        }

        .widget-stat-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .widget-stat-label {
          font-size: 12px;
          color: #64748b;
          flex: 1;
        }

        .dark .widget-stat-label {
          color: #94a3b8;
        }

        .widget-stat-value {
          font-size: 14px;
          font-weight: 700;
          color: #10b981;
        }

        .xp-progress {
          margin-top: 12px;
        }

        .xp-progress-label {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 4px;
          display: flex;
          justify-content: space-between;
        }

        .xp-progress-bar {
          height: 6px;
          background: #e2e8f0;
          border-radius: 999px;
          overflow: hidden;
        }

        .dark .xp-progress-bar {
          background: #334155;
        }

        .xp-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          transition: width 0.5s ease;
        }

        .level-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .dark .level-badge {
          border-color: #1e293b;
        }

        @media (max-width: 768px) {
          .gamification-widget {
            top: auto;
            bottom: 80px;
            right: 16px;
            min-width: 180px;
          }
        }
      </style>

      <div class="widget-content">
        <div class="widget-header">
          <span class="widget-title">Your Progress</span>
          <button class="widget-collapse-btn" onclick="window.gamificationWidget.toggle()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4H4z"/>
            </svg>
          </button>
        </div>

        <div class="widget-stat">
          <div class="widget-stat-icon" style="background: linear-gradient(135deg, #10b981, #059669); color: white;">⚡</div>
          <span class="widget-stat-label">XP</span>
          <span class="widget-stat-value" id="widget-xp">0</span>
        </div>

        <div class="widget-stat">
          <div class="widget-stat-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white;">🎯</div>
          <span class="widget-stat-label">Level</span>
          <span class="widget-stat-value" id="widget-level">1</span>
        </div>

        <div class="widget-stat">
          <div class="widget-stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white;">🔥</div>
          <span class="widget-stat-label">Streak</span>
          <span class="widget-stat-value" id="widget-streak">0</span>
        </div>

        <div class="xp-progress">
          <div class="xp-progress-label">
            <span>Next Level</span>
            <span id="xp-progress-text">0/100</span>
          </div>
          <div class="xp-progress-bar">
            <div class="xp-progress-fill" id="xp-progress-fill" style="width: 0%"></div>
          </div>
        </div>
      </div>

      <div class="level-badge" id="level-badge">1</div>
    `;

    return widget;
  }

  async function loadUserProgress(userId) {
    try {
      const response = await fetch(`${API_BASE}/api/user-profile/users/${userId}/gamification`);
      const data = await response.json();

      if (data.success) {
        updateWidget(data.user);
        document.getElementById('gamification-widget').classList.add('visible');
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  }

  function updateWidget(user) {
    // Update XP
    document.getElementById('widget-xp').textContent = (user.xp || 0).toLocaleString();
    
    // Update Level
    document.getElementById('widget-level').textContent = user.level || 1;
    document.getElementById('level-badge').textContent = user.level || 1;
    
    // Update Streak
    document.getElementById('widget-streak').textContent = user.streak || 0;

    // Calculate XP progress
    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
    const xpForNextLevel = user.xpForNextLevel || Math.pow(currentLevel, 2) * 100;
    const xpInLevel = currentXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const progress = (xpInLevel / xpNeeded) * 100;

    document.getElementById('xp-progress-text').textContent = `${xpInLevel}/${xpNeeded}`;
    document.getElementById('xp-progress-fill').style.width = `${Math.min(100, progress)}%`;
  }

  // Widget controls
  window.gamificationWidget = {
    toggle: function() {
      const widget = document.getElementById('gamification-widget');
      widget.classList.toggle('collapsed');
    },
    
    refresh: function() {
      const userId = getUserId();
      if (userId) {
        loadUserProgress(userId);
      }
    },

    awardXP: async function(points, action = 'general') {
      const userId = getUserId();
      if (!userId) return;

      try {
        const response = await fetch(`${API_BASE}/api/user-profile/users/${userId}/award-xp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points, action })
        });

        const data = await response.json();
        
        if (data.success) {
          // Show level up notification if applicable
          if (data.levelUp) {
            showLevelUpNotification(data.newLevel);
          }
          
          // Refresh widget
          this.refresh();
        }
      } catch (error) {
        console.error('Error awarding XP:', error);
      }
    }
  };

  function showLevelUpNotification(newLevel) {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 32px 48px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      z-index: 10000;
      text-align: center;
      animation: levelUpPulse 0.6s ease;
    `;

    notification.innerHTML = `
      <style>
        @keyframes levelUpPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
      </style>
      <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
      <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Level Up!</div>
      <div style="font-size: 18px; opacity: 0.9;">You reached level ${newLevel}</div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGamificationWidget);
  } else {
    initGamificationWidget();
  }

  // Track calculator usage
  document.addEventListener('calculationComplete', function(e) {
    if (window.gamificationWidget) {
      window.gamificationWidget.awardXP(10, 'calculation');
    }
  });

  // Track lesson completion (listen for custom event)
  document.addEventListener('lessonComplete', function(e) {
    if (window.gamificationWidget) {
      window.gamificationWidget.awardXP(50, 'lesson');
    }
  });

})();
