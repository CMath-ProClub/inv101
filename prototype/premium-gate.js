/**
 * Premium Content Gate
 * Shows upgrade prompts for locked premium features
 */

(function() {
  'use strict';

  const TIER_HIERARCHY = ['free', 'basic', 'pro', 'expert'];

  /**
   * Initialize premium gates on page load
   */
  function initPremiumGates() {
    const userTier = getUserTier();
    
    // Find all elements with data-required-tier attribute
    const gatedElements = document.querySelectorAll('[data-required-tier]');
    
    gatedElements.forEach(element => {
      const requiredTier = element.dataset.requiredTier;
      
      if (!canAccess(userTier, requiredTier)) {
        applyPremiumGate(element, requiredTier);
      }
    });
  }

  /**
   * Get user's subscription tier from localStorage
   */
  function getUserTier() {
    const user = JSON.parse(localStorage.getItem('inv101_user') || '{}');
    return user.subscriptionTier || 'free';
  }

  /**
   * Check if user can access a feature
   */
  function canAccess(userTier, requiredTier) {
    const userLevel = TIER_HIERARCHY.indexOf(userTier);
    const requiredLevel = TIER_HIERARCHY.indexOf(requiredTier);
    
    return userLevel >= requiredLevel;
  }

  /**
   * Apply premium gate to an element
   */
  function applyPremiumGate(element, requiredTier) {
    // Save original content
    const originalContent = element.innerHTML;
    
    // Create gate overlay
    const gate = document.createElement('div');
    gate.className = 'premium-gate-overlay';
    gate.dataset.requiredTier = requiredTier;
    
    const tierColors = {
      'basic': 'emerald',
      'pro': 'blue',
      'expert': 'purple'
    };
    
    const tierColor = tierColors[requiredTier] || 'emerald';
    const tierIcons = {
      'basic': '💚',
      'pro': '🔵',
      'expert': '👑'
    };
    
    gate.innerHTML = `
      <div class="premium-gate-blur">
        ${originalContent}
      </div>
      <div class="premium-gate-content">
        <div class="premium-gate-badge">
          <span class="premium-gate-icon">${tierIcons[requiredTier] || '🔒'}</span>
          <span class="premium-gate-tier">${requiredTier.toUpperCase()}</span>
        </div>
        <h4 class="premium-gate-title">Unlock ${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Features</h4>
        <p class="premium-gate-description">Upgrade to access this ${element.dataset.featureType || 'feature'}</p>
        <button class="premium-gate-button premium-gate-button-${tierColor}" onclick="window.location.href='pricing.html'">
          Upgrade Now →
        </button>
        <a href="pricing.html" class="premium-gate-link">View all plans</a>
      </div>
    `;
    
    // Replace element content
    element.style.position = 'relative';
    element.innerHTML = '';
    element.appendChild(gate);
    
    // Disable interactions
    element.style.pointerEvents = 'all'; // Keep pointer events for the button
  }

  /**
   * Show upgrade modal
   */
  function showUpgradeModal(tier, feature) {
    const modal = document.createElement('div');
    modal.className = 'premium-modal-overlay';
    modal.innerHTML = `
      <div class="premium-modal">
        <button class="premium-modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
        <div class="premium-modal-content">
          <div class="text-6xl mb-4">🔒</div>
          <h3 class="text-2xl font-bold mb-4">Unlock ${feature || 'This Feature'}</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-6">
            Upgrade to ${tier.charAt(0).toUpperCase() + tier.slice(1)} to access this feature and many more!
          </p>
          <div class="flex gap-4 justify-center">
            <button onclick="window.location.href='pricing.html'" class="px-6 py-3 bg-primary-green text-white font-bold rounded-lg hover:bg-emerald-600 transition">
              View Plans
            </button>
            <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" class="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  // Add premium gate styles if not already present
  if (!document.getElementById('premium-gate-styles')) {
    const style = document.createElement('style');
    style.id = 'premium-gate-styles';
    style.textContent = `
      .premium-gate-overlay {
        position: relative;
        min-height: 300px;
        display: flex;
        align-items: center;
        justify-center;
        border-radius: 12px;
        overflow: hidden;
      }
      
      .premium-gate-blur {
        position: absolute;
        inset: 0;
        filter: blur(8px);
        opacity: 0.3;
        pointer-events: none;
      }
      
      .premium-gate-content {
        position: relative;
        z-index: 10;
        text-align: center;
        padding: 32px;
        background: var(--bg-card);
        border-radius: 12px;
        border: 2px solid var(--border);
        max-width: 400px;
      }
      
      .premium-gate-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: linear-gradient(135deg, var(--accent) 0%, #059669 100%);
        color: white;
        border-radius: 20px;
        font-weight: 700;
        font-size: 14px;
        margin-bottom: 16px;
      }
      
      .premium-gate-icon {
        font-size: 20px;
      }
      
      .premium-gate-title {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 12px;
        color: var(--text);
      }
      
      .premium-gate-description {
        color: var(--text-secondary);
        margin-bottom: 20px;
      }
      
      .premium-gate-button {
        width: 100%;
        padding: 12px 24px;
        font-weight: 700;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        color: white;
        margin-bottom: 12px;
      }
      
      .premium-gate-button-emerald {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      }
      
      .premium-gate-button-emerald:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
      }
      
      .premium-gate-button-blue {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      }
      
      .premium-gate-button-blue:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
      }
      
      .premium-gate-button-purple {
        background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
      }
      
      .premium-gate-button-purple:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(168, 85, 247, 0.3);
      }
      
      .premium-gate-link {
        color: var(--accent);
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
      }
      
      .premium-gate-link:hover {
        text-decoration: underline;
      }
      
      .premium-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-center;
        z-index: 9999;
        padding: 20px;
        animation: fadeIn 0.2s ease-out;
      }
      
      .premium-modal {
        background: var(--bg-card);
        border-radius: 16px;
        padding: 32px;
        max-width: 500px;
        width: 100%;
        position: relative;
        animation: slideUp 0.3s ease-out;
      }
      
      .premium-modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: var(--bg-hover);
        color: var(--text);
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .premium-modal-close:hover {
        background: var(--accent);
        color: white;
      }
      
      .premium-modal-content {
        text-align: center;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPremiumGates);
  } else {
    initPremiumGates();
  }

  // Expose to global scope
  window.premiumGate = {
    showUpgradeModal: showUpgradeModal,
    canAccess: (requiredTier) => canAccess(getUserTier(), requiredTier),
    getUserTier: getUserTier
  };
})();
