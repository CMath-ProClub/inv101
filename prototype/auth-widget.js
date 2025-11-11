// Small auth widget that injects Sign In / Sign Out buttons into pages with .app__header
(function(){
  function resolveTarget(targetPath) {
    const current = window.location.pathname.replace(/^\//, '') || 'index.html';
    return typeof targetPath === 'string' && targetPath.length ? targetPath : current;
  }

  if (typeof window.showAuthModal !== 'function') {
    window.showAuthModal = function(targetPath){
      const target = encodeURIComponent(resolveTarget(targetPath));

      if (window.Clerk && typeof window.Clerk.openSignIn === 'function') {
        try {
          window.Clerk.openSignIn({ afterSignInUrl: '/auth/callback?target=' + target });
          return;
        } catch (err) {
          console.warn('Clerk openSignIn failed, redirecting to fallback page', err);
        }
      }

      window.location.href = '/signin.html?target=' + target;
    };
  }

  async function attachWidget() {
    const header = document.querySelector('.app__header') || document.querySelector('.global-header') || document.querySelector('.invest-sim-top');
    if (!header) return;
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
    signInBtn.addEventListener('click', () => { window.showAuthModal(resolveTarget()); });

    const signOutBtn = document.createElement('button');
    signOutBtn.id = 'globalSignOut';
    signOutBtn.className = 'inline-flex items-center gap-2 rounded-full border border-slate-300 bg-transparent px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-900/40';
    signOutBtn.textContent = 'Sign Out';
    signOutBtn.setAttribute('hidden', '');
    signOutBtn.addEventListener('click', async () => {
      try {
        if (window.Clerk && typeof window.Clerk.signOut === 'function') {
          await window.Clerk.signOut();
        }
      } catch (err) {
        console.warn('Clerk signOut failed', err);
      }

      if (window.apiClient && window.apiClient.doSignOut) {
        await window.apiClient.doSignOut();
      } else {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      }

      await refreshState();
    });

    container.appendChild(emailSpan);
    container.appendChild(signInBtn);
    container.appendChild(signOutBtn);
    const mountTarget = header.querySelector('.app__header-actions') || header.querySelector('.actions') || header;
    mountTarget.appendChild(container);

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
      } catch (error) {
        console.warn('Auth widget refresh failed', error);
      }
    }

    await refreshState();
  }

  document.addEventListener('DOMContentLoaded', attachWidget);
})();
