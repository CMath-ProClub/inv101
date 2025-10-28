// Small auth widget that injects Sign In / Sign Out buttons into pages with .app__header
(function(){
  async function init() {
    document.addEventListener('DOMContentLoaded', async () => {
      const header = document.querySelector('.app__header') || document.querySelector('.invest-sim-top');
      if (!header) return;
      // Avoid double-inject
      if (document.getElementById('globalAuthWidget')) return;

      const container = document.createElement('div');
      container.id = 'globalAuthWidget';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.gap = '8px';

      const emailSpan = document.createElement('div');
      emailSpan.id = 'globalUserEmail';
      emailSpan.className = 'muted';
      emailSpan.style.display = 'none';

      const signInBtn = document.createElement('button');
      signInBtn.id = 'globalSignIn';
      signInBtn.className = 'btn btn-primary';
      signInBtn.textContent = 'Sign In';
      signInBtn.addEventListener('click', () => { if (window.showAuthModal) window.showAuthModal(); });

      const signOutBtn = document.createElement('button');
      signOutBtn.id = 'globalSignOut';
      signOutBtn.className = 'btn btn-ghost';
      signOutBtn.textContent = 'Sign Out';
      signOutBtn.style.display = 'none';
      signOutBtn.addEventListener('click', async () => {
        if (window.apiClient && window.apiClient.doSignOut) {
          await window.apiClient.doSignOut();
        } else {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        }
        refreshState();
      });

      container.appendChild(emailSpan);
      container.appendChild(signInBtn);
      container.appendChild(signOutBtn);
      header.appendChild(container);

      async function refreshState() {
        try {
          const user = (window.apiClient && window.apiClient.fetchAuthState) ? await window.apiClient.fetchAuthState() : null;
          if (user) {
            emailSpan.textContent = user.email;
            emailSpan.style.display = '';
            signInBtn.style.display = 'none';
            signOutBtn.style.display = '';
          } else {
            emailSpan.textContent = '';
            emailSpan.style.display = 'none';
            signInBtn.style.display = '';
            signOutBtn.style.display = 'none';
          }
        } catch (e) { console.warn('Auth widget refresh failed', e); }
      }

      refreshState();
    });
  }
  init();
})();
