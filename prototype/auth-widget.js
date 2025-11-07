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
      container.className = 'flex items-center gap-2';

      const emailSpan = document.createElement('div');
      emailSpan.id = 'globalUserEmail';
      emailSpan.className = 'text-sm font-medium text-slate-600 dark:text-slate-300';
      emailSpan.setAttribute('hidden', '');

      const signInBtn = document.createElement('button');
      signInBtn.id = 'globalSignIn';
      signInBtn.className = 'inline-flex items-center gap-2 rounded-full border border-primary-green bg-primary-green px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/40';
      signInBtn.textContent = 'Sign In';
      signInBtn.addEventListener('click', () => { if (window.showAuthModal) window.showAuthModal(); });

      const signOutBtn = document.createElement('button');
      signOutBtn.id = 'globalSignOut';
      signOutBtn.className = 'inline-flex items-center gap-2 rounded-full border border-slate-300 bg-transparent px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-900/40';
      signOutBtn.textContent = 'Sign Out';
      signOutBtn.setAttribute('hidden', '');
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
             emailSpan.removeAttribute('hidden');
             signInBtn.setAttribute('hidden', '');
             signOutBtn.removeAttribute('hidden');
           } else {
             emailSpan.textContent = '';
             emailSpan.setAttribute('hidden', '');
             signInBtn.removeAttribute('hidden');
             signOutBtn.setAttribute('hidden', '');
           }
         } catch (e) { console.warn('Auth widget refresh failed', e); }
       }      refreshState();
    });
  }
  init();
})();
