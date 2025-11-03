// Small global UI helpers for the prototype: sidebar toggle + persistence + keyboard shortcut
(function(){
  function ready(fn){
    if (document.readyState !== 'loading') return fn();
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(async function(){
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // Apply persisted state (default: not collapsed). If no local preference, try server-side preference.
    const localPref = localStorage.getItem('inv101_sidebar_collapsed');
    let collapsed = localPref === 'true' ? true : (localPref === 'false' ? false : null);

    async function fetchPreference(key){
      try {
        const resp = await fetch('/api/preferences/' + encodeURIComponent(key), { method: 'GET', credentials: 'include' });
        if (!resp.ok) return null;
        const body = await resp.json();
        // server returns { success: true, preference: <value> }
        if (body && body.success) return body.preference || null;
      } catch (e) {
        return null;
      }
      return null;
    }

    // If no local pref, try server-provided preference (for logged-in users)
    if (collapsed === null) {
      try {
        const serverPref = await fetchPreference('sidebar');
        if (serverPref !== null) {
          // server may store { collapsed: true } or just boolean
          if (typeof serverPref === 'object' && typeof serverPref.collapsed === 'boolean') collapsed = !!serverPref.collapsed;
          else if (typeof serverPref === 'boolean') collapsed = !!serverPref;
        }
      } catch (e) {
        // ignore
      }
    }

    if (collapsed === true) {
      sidebar.classList.add('collapsed');
      document.body.classList.add('sidebar-collapsed');
      document.documentElement.style.setProperty('--sidebar-width', getComputedStyle(document.documentElement).getPropertyValue('--sidebar-collapsed') || '72px');
    } else {
      // ensure CSS variable reflects expanded width
      document.documentElement.style.setProperty('--sidebar-width', getComputedStyle(document.documentElement).getPropertyValue('--sidebar-expanded') || '120px');
    }

  // Create toggle button if not present
    let toggle = sidebar.querySelector('.sidebar-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'sidebar-toggle';
      toggle.setAttribute('aria-label','Toggle sidebar');
      toggle.innerHTML = '<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h16"/></svg>';
      // Insert at top
      sidebar.insertBefore(toggle, sidebar.firstChild);
    }

    // Ensure ARIA pressed reflects current state
    const isCollapsedNow = sidebar.classList.contains('collapsed');
    toggle.setAttribute('aria-pressed', isCollapsedNow ? 'true' : 'false');
    toggle.title = isCollapsedNow ? 'Expand sidebar' : 'Collapse sidebar';

    // Theme switcher: create small button in header actions (cycles: light -> dark -> sepia)
    function ensureHeaderActions(){
      const header = document.querySelector('.global-header') || document.querySelector('.app__header');
      if (!header) return null;
      let actions = header.querySelector('.actions') || header.querySelector('.app__header-actions');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'actions';
        header.appendChild(actions);
      }
      return actions;
    }

    // Initialize theme from local storage or server and hook settings toggles (if present)
    async function initThemeFromPrefs(){
      const localTheme = localStorage.getItem('inv101_theme');
      if (localTheme) {
        if (localTheme === 'dark') document.documentElement.classList.add('dark-mode');
        else if (localTheme === 'sepia') document.documentElement.classList.add('theme-sepia');
      } else {
        try {
          const serverTheme = await fetchPreference('theme');
          if (serverTheme) {
            const t = (typeof serverTheme === 'object' && serverTheme.theme) ? serverTheme.theme : serverTheme;
            if (t === 'dark') document.documentElement.classList.add('dark-mode');
            else if (t === 'sepia') document.documentElement.classList.add('theme-sepia');
            if (t) localStorage.setItem('inv101_theme', t);
          }
        } catch (e) {}
      }

      // If we're on the settings page, hook the toggles to control theme
      const darkToggle = document.getElementById('darkModeToggle');
      const colorblindToggle = document.getElementById('colorblindModeToggle');
      const compactToggle = document.getElementById('compactModeToggle');

      if (darkToggle) {
        // initialize checkbox state from active theme
        darkToggle.checked = document.documentElement.classList.contains('dark-mode');
        darkToggle.addEventListener('change', async function(){
          if (this.checked) {
            document.documentElement.classList.add('dark-mode');
            document.documentElement.classList.remove('theme-sepia');
            localStorage.setItem('inv101_theme','dark');
            await savePreference('theme', { theme: 'dark' });
            showToast('Theme saved');
          } else {
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('inv101_theme','light');
            await savePreference('theme', { theme: 'light' });
            showToast('Theme saved');
          }
        });
      }

      if (colorblindToggle) {
        // colorblind toggles an extra class; we keep it separate from theme
        colorblindToggle.checked = document.documentElement.classList.contains('colorblind-mode');
        colorblindToggle.addEventListener('change', function(){
          if (this.checked) {
            document.documentElement.classList.add('colorblind-mode');
            localStorage.setItem('inv101_colorblind','true');
            showToast('Colorblind mode enabled');
          } else {
            document.documentElement.classList.remove('colorblind-mode');
            localStorage.setItem('inv101_colorblind','false');
            showToast('Colorblind mode disabled');
          }
        });
      }

      if (compactToggle) {
        compactToggle.checked = document.documentElement.classList.contains('compact-mode');
        compactToggle.addEventListener('change', async function(){
          if (this.checked) {
            document.documentElement.classList.add('compact-mode');
            localStorage.setItem('inv101_compact','true');
            await savePreference('compact', { compact: true });
            showToast('Compact mode enabled');
          } else {
            document.documentElement.classList.remove('compact-mode');
            localStorage.setItem('inv101_compact','false');
            await savePreference('compact', { compact: false });
            showToast('Compact mode disabled');
          }
        });
      }
    }

    await initThemeFromPrefs();

  function setCollapsed(v){
      if (v) {
        sidebar.classList.add('collapsed');
        document.body.classList.add('sidebar-collapsed');
        document.documentElement.style.setProperty('--sidebar-width', getComputedStyle(document.documentElement).getPropertyValue('--sidebar-collapsed') || '72px');
      } else {
        sidebar.classList.remove('collapsed');
        document.body.classList.remove('sidebar-collapsed');
        document.documentElement.style.setProperty('--sidebar-width', getComputedStyle(document.documentElement).getPropertyValue('--sidebar-expanded') || '120px');
      }
      localStorage.setItem('inv101_sidebar_collapsed', !!v);
    }

    toggle.addEventListener('click', function(e){
      const isCollapsed = sidebar.classList.toggle('collapsed');
      if (isCollapsed) document.body.classList.add('sidebar-collapsed'); else document.body.classList.remove('sidebar-collapsed');
      localStorage.setItem('inv101_sidebar_collapsed', isCollapsed);
      // For a11y announce
      toggle.setAttribute('aria-pressed', isCollapsed ? 'true' : 'false');
      toggle.title = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
      // update CSS variable to animate layout
      if (isCollapsed) {
        document.documentElement.style.setProperty('--sidebar-width', getComputedStyle(document.documentElement).getPropertyValue('--sidebar-collapsed') || '72px');
      } else {
        document.documentElement.style.setProperty('--sidebar-width', getComputedStyle(document.documentElement).getPropertyValue('--sidebar-expanded') || '120px');
      }
      // attempt to persist preference server-side for logged-in users
      savePreference('sidebar', { collapsed: !!isCollapsed }).then(ok => {
        if (ok) showToast('Sidebar preference saved');
      });
    });

    // Keyboard shortcut: press "b" to toggle sidebar (when not typing)
    document.addEventListener('keydown', function(e){
      const active = document.activeElement;
      const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
      if (isInput) return;
      if (e.key && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggle.click();
      }
    });

    // Make sidebar nav links focusable and improve hit target. Also set data-label for tooltips.
    const navBtns = sidebar.querySelectorAll('.sidebar__btn');
    navBtns.forEach(btn => {
      // Prefer explicit .label element content
      const lbl = btn.querySelector('.label') || btn.querySelector('span');
      const labelText = lbl ? lbl.textContent.trim() : btn.textContent.trim();
      if (labelText) btn.setAttribute('data-label', labelText);
      btn.setAttribute('tabindex','0');
      btn.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });

    // Generic preference save helper. Returns true if server save succeeded.
    async function savePreference(key, value){
      try {
        const resp = await fetch('/api/preferences/' + encodeURIComponent(key), {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value)
        });
        return resp.ok;
      } catch (e) {
        return false;
      }
    }

    // --- Compact mode toggle ---
    const headerActions = ensureHeaderActions();
    if (headerActions) {
      let compactBtn = headerActions.querySelector('.compact-toggle');
      if (!compactBtn) {
        compactBtn = document.createElement('button');
        compactBtn.type = 'button';
        compactBtn.className = 'compact-toggle icon-button';
        compactBtn.setAttribute('aria-label','Toggle compact mode');
        compactBtn.title = 'Toggle compact mode';
        compactBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="6" rx="1"></rect><rect x="3" y="14" width="10" height="6" rx="1"></rect></svg>';
        headerActions.insertBefore(compactBtn, headerActions.firstChild);
      }

      // initialize compact from localStorage or server
      let compactLocal = localStorage.getItem('inv101_compact');
      let compactState = compactLocal === 'true' ? true : (compactLocal === 'false' ? false : null);
      if (compactState === null) {
        const serverCompact = await fetchPreference('compact');
        if (serverCompact !== null) {
          if (typeof serverCompact === 'object' && typeof serverCompact.compact === 'boolean') compactState = !!serverCompact.compact;
          else if (typeof serverCompact === 'boolean') compactState = !!serverCompact;
        }
      }
      if (compactState === true) {
        document.documentElement.classList.add('compact-mode');
      }

      compactBtn.addEventListener('click', async () => {
        const now = document.documentElement.classList.toggle('compact-mode');
        localStorage.setItem('inv101_compact', now ? 'true' : 'false');
        const ok = await savePreference('compact', { compact: !!now });
        showToast(ok ? (now ? 'Compact mode enabled' : 'Compact mode disabled') : 'Saved locally');
      });
    }

    // --- Toast helper ---
    function showToast(msg, ttl = 2200){
      try {
        let container = document.querySelector('.toast-container');
        if (!container) { container = document.createElement('div'); container.className = 'toast-container'; document.body.appendChild(container); }
        const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; container.appendChild(t);
        // force reflow then show
        void t.offsetWidth; t.classList.add('show');
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 220); }, ttl);
      } catch (e) { /* silent */ }
    }
  });
})();
