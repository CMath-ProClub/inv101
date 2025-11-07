// Adaptive Content System - Shows/hides content based on user skill level
(function() {
  'use strict';

  // Get user's skill level from localStorage
  function getSkillLevel() {
    return localStorage.getItem('inv101_skillLevel') || 'beginner';
  }

  // Initialize adaptive content on page load
  function initAdaptiveContent() {
    const skillLevel = getSkillLevel();
    
    // Add skill level as class to body for CSS targeting
    document.body.dataset.skillLevel = skillLevel;
    document.body.classList.add(`skill-${skillLevel}`);

    // Process all elements with data-skill-level attribute
    document.querySelectorAll('[data-skill-level]').forEach(element => {
      const requiredLevels = element.dataset.skillLevel.split(',').map(s => s.trim());
      const minLevel = element.dataset.minLevel;
      const maxLevel = element.dataset.maxLevel;

      let shouldShow = false;

      // Check if current level matches any required level
      if (requiredLevels.includes(skillLevel)) {
        shouldShow = true;
      }

      // Check min/max level range
      const levelOrder = ['new', 'beginner', 'intermediate', 'advanced', 'expert'];
      const currentIndex = levelOrder.indexOf(skillLevel);
      
      if (minLevel) {
        const minIndex = levelOrder.indexOf(minLevel);
        if (currentIndex < minIndex) shouldShow = false;
      }
      
      if (maxLevel) {
        const maxIndex = levelOrder.indexOf(maxLevel);
        if (currentIndex > maxIndex) shouldShow = false;
      }

      // Show/hide element
      if (!shouldShow) {
        element.style.display = 'none';
      }
    });

    // Add skill level indicator to header
    addSkillLevelIndicator(skillLevel);
  }

  function addSkillLevelIndicator(skillLevel) {
    const header = document.querySelector('.app__header-actions');
    if (!header) return;

    const indicator = document.createElement('div');
    indicator.className = 'skill-level-indicator';
    indicator.innerHTML = `
      <style>
        .skill-level-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .skill-level-indicator:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .skill-level-indicator.new {
          background: #e0e7ff;
          color: #3730a3;
        }
        .skill-level-indicator.beginner {
          background: #dbeafe;
          color: #1e40af;
        }
        .skill-level-indicator.intermediate {
          background: #d1fae5;
          color: #065f46;
        }
        .skill-level-indicator.advanced {
          background: #fef3c7;
          color: #92400e;
        }
        .skill-level-indicator.expert {
          background: #fce7f3;
          color: #831843;
        }
        .dark .skill-level-indicator {
          filter: brightness(0.8);
        }
      </style>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 2a.5.5 0 01.5.5v5h5a.5.5 0 010 1h-5v5a.5.5 0 01-1 0v-5h-5a.5.5 0 010-1h5v-5A.5.5 0 018 2z"/>
      </svg>
      <span>${skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)}</span>
    `;
    indicator.classList.add(skillLevel);
    indicator.onclick = () => {
      if (confirm('Want to retake the skill assessment to update your level?')) {
        window.location.href = 'onboarding.html';
      }
    };

    header.insertBefore(indicator, header.firstChild);
  }

  // Content difficulty mapper
  window.adaptiveContent = {
    // Check if user can access specific content
    canAccess: function(difficulty) {
      const skillLevel = getSkillLevel();
      const levelOrder = ['new', 'beginner', 'intermediate', 'advanced', 'expert'];
      const userIndex = levelOrder.indexOf(skillLevel);
      const contentIndex = levelOrder.indexOf(difficulty);
      
      return userIndex >= contentIndex;
    },

    // Get recommended content for user
    getRecommendations: function() {
      const skillLevel = getSkillLevel();
      
      const recommendations = {
        new: [
          { title: 'What is Investing?', category: 'foundations', url: 'lesson-foundations.html' },
          { title: 'Basic Terminology', category: 'foundations', url: 'lesson-foundations.html' },
          { title: 'Getting Started', category: 'foundations', url: 'lesson-foundations.html' }
        ],
        beginner: [
          { title: 'Understanding Stocks', category: 'instruments', url: 'lesson-instruments.html' },
          { title: 'Bonds & Fixed Income', category: 'instruments', url: 'lesson-instruments.html' },
          { title: 'Market Basics', category: 'market', url: 'lesson-market.html' }
        ],
        intermediate: [
          { title: 'Portfolio Management', category: 'practical', url: 'lesson-practical.html' },
          { title: 'Risk Management', category: 'practical', url: 'lesson-practical.html' },
          { title: 'Market Analysis', category: 'market', url: 'lesson-market.html' }
        ],
        advanced: [
          { title: 'Advanced Strategies', category: 'advanced', url: 'lessons.html' },
          { title: 'Options Trading', category: 'advanced', url: 'lessons.html' },
          { title: 'Technical Analysis', category: 'advanced', url: 'lessons.html' }
        ],
        expert: [
          { title: 'Algorithmic Trading', category: 'expert', url: 'lessons.html' },
          { title: 'Derivatives', category: 'expert', url: 'lessons.html' },
          { title: 'Portfolio Optimization', category: 'expert', url: 'lessons.html' }
        ]
      };

      return recommendations[skillLevel] || recommendations.beginner;
    },

    // Show content tier info
    showTierInfo: function(element, requiredLevel) {
      const skillLevel = getSkillLevel();
      const levelOrder = ['new', 'beginner', 'intermediate', 'advanced', 'expert'];
      const userIndex = levelOrder.indexOf(skillLevel);
      const requiredIndex = levelOrder.indexOf(requiredLevel);

      if (userIndex < requiredIndex) {
        const overlay = document.createElement('div');
        overlay.className = 'tier-lock-overlay';
        overlay.innerHTML = `
          <style>
            .tier-lock-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0,0,0,0.8);
              backdrop-filter: blur(4px);
              border-radius: inherit;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: white;
              padding: 20px;
              text-align: center;
              z-index: 10;
            }
            .tier-lock-icon {
              font-size: 48px;
              margin-bottom: 12px;
            }
            .tier-lock-text {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .tier-lock-requirement {
              font-size: 14px;
              opacity: 0.8;
            }
          </style>
          <div class="tier-lock-icon">🔒</div>
          <div class="tier-lock-text">${requiredLevel.charAt(0).toUpperCase() + requiredLevel.slice(1)} Level Required</div>
          <div class="tier-lock-requirement">Complete more lessons to unlock</div>
        `;

        element.style.position = 'relative';
        element.appendChild(overlay);
      }
    },

    // Update skill level
    updateSkillLevel: function(newLevel) {
      localStorage.setItem('inv101_skillLevel', newLevel);
      window.location.reload();
    }
  };

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdaptiveContent);
  } else {
    initAdaptiveContent();
  }

})();
