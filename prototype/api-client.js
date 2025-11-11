// Lightweight shared API client utilities for the prototype frontend
(function(global){
  function getRefreshEndpointFor(url) {
    try {
      const u = new URL(url, window.location.href);
      return `${u.origin}/api/auth/refresh`;
    } catch (e) {
      return '/api/auth/refresh';
    }
  }

  async function fetchWithAuth(url, opts = {}) {
    opts = Object.assign({ credentials: 'include', headers: {} }, opts || {});
    if (opts.body && !(opts.body instanceof FormData)) {
      opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    }

    let resp = await fetch(url, opts);
    if (resp.status !== 401) return resp;

    // Try refresh once against the same origin as the request
    try {
      const refreshUrl = getRefreshEndpointFor(url);
      const r = await fetch(refreshUrl, { method: 'POST', credentials: 'include' });
      if (r.ok) {
        resp = await fetch(url, opts);
        return resp;
      }
    } catch (e) {
      console.warn('Refresh attempt failed', e);
    }

    // Attempt to sync Clerk session into legacy tokens before showing auth prompt
    try {
      const syncResp = await fetch('/api/auth/clerk/sync', { method: 'POST', credentials: 'include' });
      if (syncResp.ok) {
        resp = await fetch(url, opts);
        if (resp.status !== 401) {
          return resp;
        }
      }
    } catch (err) {
      console.warn('Clerk sync attempt failed', err);
    }

    // If refresh failed, show auth modal if available
    if (typeof window.showAuthModal === 'function') window.showAuthModal();
    return resp;
  }

  function showConfirm(message) {
    return new Promise((resolve) => {
      const modal = document.getElementById('confirmModal');
      const msg = document.getElementById('confirmMsg');
      const ok = document.getElementById('confirmOk');
      const cancel = document.getElementById('confirmCancel');
      if (!modal || !msg || !ok || !cancel) return resolve(window.confirm(message));
      msg.textContent = message;
      const previousFocus = document.activeElement;
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');

      function cleanup(result) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        ok.removeEventListener('click', onOk);
        cancel.removeEventListener('click', onCancel);
        document.removeEventListener('keydown', onKeydown);
        try { if (previousFocus && previousFocus.focus) previousFocus.focus(); } catch (e) {}
        resolve(result);
      }
      function onOk() { cleanup(true); }
      function onCancel() { cleanup(false); }
      function onKeydown(e) { if (e.key === 'Escape') { e.preventDefault(); cleanup(false); } }
      ok.addEventListener('click', onOk);
      cancel.addEventListener('click', onCancel);
      document.addEventListener('keydown', onKeydown);
      setTimeout(() => { cancel.focus(); }, 0);
    });
  }

  async function fetchAuthState(backendOrigin) {
    try {
      const url = backendOrigin ? new URL('/api/auth/me', backendOrigin).toString() : '/api/auth/me';
      const resp = await fetchWithAuth(url, { credentials: 'include' });
      if (!resp.ok) return null;
      const body = await resp.json();
      return (body && body.success && body.user) ? body.user : null;
    } catch (e) {
      console.warn('fetchAuthState failed', e);
      return null;
    }
  }

  async function doSignOut(backendOrigin) {
    try {
      const url = backendOrigin ? new URL('/api/auth/logout', backendOrigin).toString() : '/api/auth/logout';
      const resp = await fetchWithAuth(url, { method: 'POST' });
      const body = await resp.json().catch(() => ({}));
      return body;
    } catch (e) { console.warn('Sign out failed', e); return { success: false, error: e.message }; }
  }

  global.apiClient = { fetchWithAuth, showConfirm, fetchAuthState, doSignOut };
})(window);
