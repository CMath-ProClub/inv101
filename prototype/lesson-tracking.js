// Lesson Progress Tracking
(function() {
  'use strict';

  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : 'https://inv101-production.up.railway.app';

  let lessonId = null;
  let lessonTitle = null;
  let lessonCategory = null;
  let startTime = null;
  let progressInterval = null;
  let currentProgress = 0;

  // Initialize lesson tracking
  function initLessonTracking() {
    // Get lesson info from page
    lessonId = getLessonIdFromUrl();
    lessonTitle = document.querySelector('h1')?.textContent || 'Lesson';
    lessonCategory = detectLessonCategory();

    startTime = Date.now();

    // Load existing progress
    loadLessonProgress();

    // Track scroll progress
    setupScrollTracking();

    // Track time spent
    setupTimeTracking();

    // Add complete button if not exists
    addCompleteButton();

    // Setup checkpoint tracking
    setupCheckpoints();
  }

  function getLessonIdFromUrl() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('.html', '');
  }

  function detectLessonCategory() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('foundation')) return 'foundations';
    if (path.includes('instrument')) return 'instruments';
    if (path.includes('market')) return 'market';
    if (path.includes('practical')) return 'practical';
    return 'foundations';
  }

  async function loadLessonProgress() {
    const userId = localStorage.getItem('inv101_userId');
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE}/api/lessons/users/${userId}/lessons/${lessonId}`);
      const data = await response.json();

      if (data.success && data.progress) {
        currentProgress = data.progress.progress || 0;
        updateProgressBar(currentProgress);
        
        // Mark completed checkpoints
        if (data.progress.checkpointsCompleted) {
          data.progress.checkpointsCompleted.forEach(checkpointId => {
            const checkpoint = document.querySelector(`[data-checkpoint="${checkpointId}"]`);
            if (checkpoint) {
              checkpoint.classList.add('completed');
            }
          });
        }

        // Update completion text
        if (data.progress.status === 'completed') {
          updateCompletionUI(true);
        }
      }
    } catch (error) {
      console.error('Error loading lesson progress:', error);
    }
  }

  function setupScrollTracking() {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  function calculateScrollProgress() {
    const winHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const trackLength = docHeight - winHeight;
    const percentScrolled = Math.floor((scrollTop / trackLength) * 100);

    if (percentScrolled > currentProgress) {
      currentProgress = Math.min(100, percentScrolled);
      updateProgressBar(currentProgress);
      saveProgress();
    }
  }

  function updateProgressBar(progress) {
    const progressBar = document.getElementById('lessonProgress');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }

  function setupTimeTracking() {
    // Save progress every 30 seconds
    progressInterval = setInterval(() => {
      saveProgress();
    }, 30000);

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      saveProgress();
    });
  }

  async function saveProgress() {
    const userId = localStorage.getItem('inv101_userId');
    if (!userId) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      await fetch(`${API_BASE}/api/lessons/users/${userId}/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: currentProgress >= 100 ? 'completed' : currentProgress > 0 ? 'in-progress' : 'not-started',
          progress: currentProgress,
          timeSpent,
          lessonTitle,
          lessonCategory
        })
      });
    } catch (error) {
      console.error('Error saving lesson progress:', error);
    }
  }

  function setupCheckpoints() {
    // Find all interactive elements that could be checkpoints
    const modules = document.querySelectorAll('.lesson-module');
    modules.forEach((module, index) => {
      module.dataset.checkpoint = `module-${index + 1}`;
      
      // Add checkpoint indicator
      const indicator = document.createElement('div');
      indicator.className = 'checkpoint-indicator';
      indicator.innerHTML = `
        <style>
          .checkpoint-indicator {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #64748b;
            margin-top: 12px;
          }
          .checkpoint-dot {
            width: 12px;
            height: 12px;
            border: 2px solid #cbd5e1;
            border-radius: 50%;
            transition: all 0.3s;
          }
          .lesson-module.completed .checkpoint-dot {
            background: #10b981;
            border-color: #10b981;
          }
          .lesson-module.completed .checkpoint-indicator {
            color: #10b981;
          }
        </style>
        <span class="checkpoint-dot"></span>
        <span>Checkpoint ${index + 1}</span>
      `;
      module.querySelector('header').appendChild(indicator);

      // Add intersection observer for automatic checkpoint completion
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setTimeout(() => {
              completeCheckpoint(module.dataset.checkpoint);
            }, 3000); // Complete after viewing for 3 seconds
          }
        });
      }, { threshold: 0.5 });

      observer.observe(module);
    });
  }

  async function completeCheckpoint(checkpointId) {
    const module = document.querySelector(`[data-checkpoint="${checkpointId}"]`);
    if (module && !module.classList.contains('completed')) {
      module.classList.add('completed');

      const userId = localStorage.getItem('inv101_userId');
      if (!userId) return;

      try {
        await fetch(`${API_BASE}/api/lessons/users/${userId}/lessons/${lessonId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkpointId,
            lessonTitle,
            lessonCategory
          })
        });

        // Show mini notification
        showCheckpointNotification(checkpointId);
      } catch (error) {
        console.error('Error completing checkpoint:', error);
      }
    }
  }

  function showCheckpointNotification(checkpointId) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      background: white;
      border-left: 4px solid #10b981;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: slideInRight 0.3s ease;
      max-width: 300px;
    `;

    notification.innerHTML = `
      <style>
        @keyframes slideInRight {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 24px;">✓</div>
        <div>
          <div style="font-weight: 600; color: #10b981; margin-bottom: 4px;">Checkpoint Complete!</div>
          <div style="font-size: 14px; color: #64748b;">${checkpointId.replace('-', ' ').toUpperCase()}</div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  function addCompleteButton() {
    const hero = document.querySelector('.lesson-detail__hero');
    if (!hero) return;

    const existingBtn = document.getElementById('completeLessonBtn');
    if (existingBtn) return;

    const completeBtn = document.createElement('button');
    completeBtn.id = 'completeLessonBtn';
    completeBtn.className = 'btn btn--primary';
    completeBtn.textContent = 'Mark as Complete';
    completeBtn.style.marginTop = '20px';
    completeBtn.style.marginLeft = '12px';
    completeBtn.onclick = completeLesson;

    const startBtn = document.getElementById('startLessonBtn');
    if (startBtn) {
      startBtn.parentElement.appendChild(completeBtn);
    }
  }

  async function completeLesson() {
    const userId = localStorage.getItem('inv101_userId');
    if (!userId) {
      alert('Please sign in to track your progress!');
      return;
    }

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await fetch(`${API_BASE}/api/lessons/users/${userId}/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeSpent,
          lessonTitle,
          lessonCategory
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update UI
        updateCompletionUI(true);
        currentProgress = 100;
        updateProgressBar(100);

        // Show XP notification
        showXPNotification(data.xpAwarded, data.levelUp, data.newLevel);

        // Fire custom event for gamification widget
        document.dispatchEvent(new CustomEvent('lessonComplete', {
          detail: { lessonId, xp: data.xpAwarded }
        }));

        // Refresh gamification widget
        if (window.gamificationWidget) {
          window.gamificationWidget.refresh();
        }
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      alert('Error saving progress. Please try again.');
    }
  }

  function updateCompletionUI(completed) {
    const completeBtn = document.getElementById('completeLessonBtn');
    if (completeBtn) {
      if (completed) {
        completeBtn.textContent = '✓ Completed';
        completeBtn.disabled = true;
        completeBtn.style.background = '#10b981';
      }
    }

    const completionText = document.getElementById('completionText');
    if (completionText && completed) {
      completionText.textContent = '✓ Lesson Complete';
      completionText.style.color = '#10b981';
      completionText.style.fontWeight = '600';
    }
  }

  function showXPNotification(xp, levelUp, newLevel) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 32px 48px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      z-index: 10000;
      text-align: center;
      animation: popIn 0.4s ease;
    `;

    notification.innerHTML = `
      <style>
        @keyframes popIn {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      </style>
      <div style="font-size: 48px; margin-bottom: 16px;">${levelUp ? '🎉' : '⭐'}</div>
      <div style="font-size: 24px; font-weight: 700; color: #10b981; margin-bottom: 8px;">
        ${levelUp ? `Level ${newLevel}!` : `+${xp} XP`}
      </div>
      <div style="font-size: 16px; color: #64748b;">
        ${levelUp ? `You leveled up to ${newLevel}!` : 'Lesson completed'}
      </div>
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
    document.addEventListener('DOMContentLoaded', initLessonTracking);
  } else {
    initLessonTracking();
  }

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  });

})();
