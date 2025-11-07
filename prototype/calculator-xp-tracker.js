/**
 * Calculator XP Tracker
 * Automatically awards XP when users complete calculations
 * Awards: 10 XP per calculation, +15 bonus every 5th calculation
 */

(function() {
  'use strict';

  // Configuration
  const XP_PER_CALCULATION = 10;
  const BONUS_XP_EVERY = 5;
  const BONUS_XP_AMOUNT = 15;
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3030' 
    : 'https://investing101-api.up.railway.app';

  // Track calculations in session
  let calculationsThisSession = 0;
  let totalCalculations = 0;

  /**
   * Initialize calculator tracking
   */
  function initCalculatorTracking() {
    // Load total calculations from localStorage
    totalCalculations = parseInt(localStorage.getItem('inv101_totalCalculations') || '0');
    
    // Show calculation count in widget if it exists
    updateCalculationCount();

    // Listen for the custom calculationComplete event
    document.addEventListener('calculationComplete', handleCalculationComplete);
    
    console.log('Calculator XP tracking initialized');
  }

  /**
   * Handle calculation completion
   * @param {CustomEvent} event - Event with calculation details
   */
  async function handleCalculationComplete(event) {
    const calcType = event.detail?.calcType || 'general';
    
    calculationsThisSession++;
    totalCalculations++;
    
    // Save to localStorage
    localStorage.setItem('inv101_totalCalculations', totalCalculations.toString());
    
    // Check if this is a bonus calculation (every 5th)
    const isBonus = totalCalculations % BONUS_XP_EVERY === 0;
    const xpToAward = isBonus ? XP_PER_CALCULATION + BONUS_XP_AMOUNT : XP_PER_CALCULATION;
    
    // Award XP via API
    await awardCalculationXP(calcType, xpToAward, isBonus);
    
    // Show notification
    showCalculationNotification(xpToAward, isBonus, calculationsThisSession);
    
    // Update calculation count display
    updateCalculationCount();
  }

  /**
   * Award XP for calculation via API
   */
  async function awardCalculationXP(calcType, xpAmount, isBonus) {
    try {
      const userId = localStorage.getItem('inv101_userId') || 'demo-user';
      
      const response = await fetch(`${API_BASE}/api/user-profile/users/${userId}/award-xp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'calculation',
          calcType: calcType,
          points: xpAmount
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Refresh gamification widget if it exists
        if (window.gamificationWidget && typeof window.gamificationWidget.refresh === 'function') {
          window.gamificationWidget.refresh();
        }
        
        return data;
      }
    } catch (error) {
      console.error('Error awarding calculation XP:', error);
    }
  }

  /**
   * Show XP notification for calculation
   */
  function showCalculationNotification(xpAwarded, isBonus, sessionCount) {
    // Remove any existing notifications
    const existing = document.querySelector('.calc-xp-notification');
    if (existing) existing.remove();

    // Create notification
    const notification = document.createElement('div');
    notification.className = 'calc-xp-notification';
    notification.innerHTML = `
      <div class="calc-xp-content">
        <div class="calc-xp-icon">🎯</div>
        <div class="calc-xp-text">
          <div class="calc-xp-main">+${xpAwarded} XP</div>
          ${isBonus ? '<div class="calc-xp-bonus">🎉 Bonus! Every 5th calculation</div>' : ''}
          <div class="calc-xp-session">${sessionCount} calculation${sessionCount !== 1 ? 's' : ''} this session</div>
        </div>
      </div>
    `;

    // Add styles if not already present
    if (!document.getElementById('calc-xp-styles')) {
      const style = document.createElement('style');
      style.id = 'calc-xp-styles';
      style.textContent = `
        .calc-xp-notification {
          position: fixed;
          bottom: 80px;
          right: 20px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
          z-index: 9999;
          animation: slideInRight 0.3s ease-out, fadeOut 0.3s ease-in 2.7s forwards;
          max-width: 280px;
        }
        
        .calc-xp-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .calc-xp-icon {
          font-size: 28px;
          line-height: 1;
        }
        
        .calc-xp-text {
          flex: 1;
        }
        
        .calc-xp-main {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .calc-xp-bonus {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 4px;
          opacity: 0.95;
        }
        
        .calc-xp-session {
          font-size: 12px;
          opacity: 0.85;
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          to {
            opacity: 0;
            transform: translateX(20px);
          }
        }
        
        @media (max-width: 768px) {
          .calc-xp-notification {
            bottom: 70px;
            right: 10px;
            left: 10px;
            max-width: none;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Update calculation count display
   */
  function updateCalculationCount() {
    // If gamification widget exists, try to update it
    if (window.gamificationWidget) {
      // Add calculation count to widget if method exists
      if (typeof window.gamificationWidget.updateCalculationCount === 'function') {
        window.gamificationWidget.updateCalculationCount(totalCalculations);
      }
    }
  }

  /**
   * Manually trigger calculation complete
   * Called by calculator scripts
   */
  function triggerCalculation(calcType) {
    const event = new CustomEvent('calculationComplete', {
      detail: { calcType: calcType }
    });
    document.dispatchEvent(event);
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculatorTracking);
  } else {
    initCalculatorTracking();
  }

  // Expose public API
  window.calculatorXP = {
    trigger: triggerCalculation,
    getSessionCount: () => calculationsThisSession,
    getTotalCount: () => totalCalculations
  };
})();
