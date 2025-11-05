// Prime theme, colorblind, and compact classes as early as possible so pages load without a flash.
(function seedInitialDisplayState(){
  function withBody(apply){
    if (document.body) {
      apply(document.body);
    } else {
      document.addEventListener('DOMContentLoaded', function handle(){
        document.removeEventListener('DOMContentLoaded', handle);
        if (document.body) apply(document.body);
      });
    }
  }

  try {
    const root = document.documentElement;
    const localTheme = localStorage.getItem('inv101_theme');
    const legacyDark = localStorage.getItem('darkMode') === 'true' ? 'dark' : null;
    const themeToApply = localTheme || legacyDark || 'light';
    if (themeToApply === 'dark') {
      root.classList.add('dark-mode');
      withBody(body => body.classList.add('dark-mode'));
    } else if (themeToApply === 'sepia') {
      root.classList.add('theme-sepia');
      withBody(body => body.classList.add('theme-sepia'));
    }

    const storedColorblind = localStorage.getItem('inv101_colorblind');
    const legacyColorblind = localStorage.getItem('colorblindMode');
    const enableColorblind = storedColorblind !== null ? storedColorblind === 'true' : legacyColorblind === 'true';
    if (enableColorblind) {
      root.classList.add('colorblind-mode');
      withBody(body => body.classList.add('colorblind-mode'));
    }

    const storedCompact = localStorage.getItem('inv101_compact');
    const legacyCompact = localStorage.getItem('compactMode');
    const enableCompact = storedCompact !== null ? storedCompact === 'true' : legacyCompact === 'true';
    if (enableCompact) {
      root.classList.add('compact-mode');
      withBody(body => body.classList.add('compact-mode'));
    }
  } catch (e) {
    // ignore storage access failures
  }
})();

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

    const themeOptions = Array.from(document.querySelectorAll('[data-theme-option]'));
    let themeButton = null;

    function detectTheme(){
      if (document.documentElement.classList.contains('dark-mode') || (document.body && document.body.classList.contains('dark-mode'))) return 'dark';
      if (document.documentElement.classList.contains('theme-sepia') || (document.body && document.body.classList.contains('theme-sepia'))) return 'sepia';
      return 'light';
    }

    function setThemeClasses(theme){
      const root = document.documentElement;
      const bodyEl = document.body;
      const themeClasses = ['dark-mode', 'theme-sepia'];
      themeClasses.forEach(cls => {
        root.classList.remove(cls);
        if (bodyEl) bodyEl.classList.remove(cls);
      });
      if (theme === 'dark') {
        root.classList.add('dark-mode');
        if (bodyEl) bodyEl.classList.add('dark-mode');
      } else if (theme === 'sepia') {
        root.classList.add('theme-sepia');
        if (bodyEl) bodyEl.classList.add('theme-sepia');
      }
    }

    function updateThemeButton(theme){
      if (!themeButton) return;
      const label = theme.charAt(0).toUpperCase() + theme.slice(1);
      themeButton.setAttribute('aria-label', 'Cycle theme (current: ' + label + ')');
      themeButton.title = 'Cycle theme (current: ' + label + ')';
      themeButton.dataset.currentTheme = theme;
    }

    function syncThemeControls(theme){
      if (!themeOptions.length) return;
      themeOptions.forEach(input => {
        const val = input.dataset.themeOption || input.value;
        const isActive = val === theme;
        if (input.type === 'radio') input.checked = isActive;
        const wrapper = input.closest('.theme-option');
        if (wrapper) wrapper.classList.toggle('theme-option--active', isActive);
      });
    }

    async function selectTheme(theme, options = {}){
      const resolved = theme === 'dark' || theme === 'sepia' ? theme : 'light';
      setThemeClasses(resolved);
      try {
        localStorage.setItem('inv101_theme', resolved);
        localStorage.setItem('darkMode', resolved === 'dark' ? 'true' : 'false');
      } catch (e) {}
      syncThemeControls(resolved);
      updateThemeButton(resolved);
      if (options.persist) {
        const ok = await savePreference('theme', { theme: resolved });
        showToast(ok ? 'Theme saved' : 'Theme stored locally');
      }
      return resolved;
    }

    // Initialize theme from local storage or server and hook settings toggles (if present)
    async function initThemeFromPrefs(){
      const root = document.documentElement;
      const bodyEl = document.body || root;
      let themePref = null;
      try {
        themePref = localStorage.getItem('inv101_theme');
      } catch (e) {}
      if (!themePref) {
        try {
          const legacyDark = localStorage.getItem('darkMode');
          if (legacyDark === 'true') themePref = 'dark';
        } catch (e) {}
      }
      if (!themePref) {
        try {
          const serverTheme = await fetchPreference('theme');
          if (serverTheme) {
            const t = (typeof serverTheme === 'object' && serverTheme.theme) ? serverTheme.theme : serverTheme;
            if (t) {
              themePref = t;
              try { localStorage.setItem('inv101_theme', t); } catch (e) {}
            }
          }
        } catch (e) {}
      }
      await selectTheme(themePref || 'light');

      let colorblindPref = null;
      try {
        const stored = localStorage.getItem('inv101_colorblind');
        const legacy = localStorage.getItem('colorblindMode');
        if (stored !== null) colorblindPref = stored === 'true';
        else if (legacy !== null) colorblindPref = legacy === 'true';
      } catch (e) {}
      if (colorblindPref) {
        root.classList.add('colorblind-mode');
        if (bodyEl) bodyEl.classList.add('colorblind-mode');
      }

      let compactPref = null;
      try {
        const stored = localStorage.getItem('inv101_compact');
        const legacy = localStorage.getItem('compactMode');
        if (stored !== null) compactPref = stored === 'true';
        else if (legacy !== null) compactPref = legacy === 'true';
      } catch (e) {}
      if (compactPref) {
        root.classList.add('compact-mode');
        if (bodyEl) bodyEl.classList.add('compact-mode');
      }

      // Hook settings controls when present
      const darkToggle = document.getElementById('darkModeToggle');
      const colorblindToggle = document.getElementById('colorblindModeToggle');
      const compactToggle = document.getElementById('compactModeToggle');

      if (darkToggle) {
        darkToggle.checked = detectTheme() === 'dark';
        darkToggle.addEventListener('change', async function(){
          await selectTheme(this.checked ? 'dark' : 'light', { persist: true });
        });
      }

      if (themeOptions.length) {
        themeOptions.forEach(input => {
          input.addEventListener('change', async function(){
            if (this.type === 'radio' && !this.checked) return;
            const target = this.dataset.themeOption || this.value;
            if (target === detectTheme()) return;
            await selectTheme(target, { persist: true });
          });
        });
        syncThemeControls(detectTheme());
      }

      if (colorblindToggle) {
        const isColorblind = root.classList.contains('colorblind-mode') || (bodyEl && bodyEl.classList.contains('colorblind-mode'));
        colorblindToggle.checked = isColorblind;
        colorblindToggle.addEventListener('change', function(){
          const enabled = !!this.checked;
          [root, bodyEl].forEach(el => { if (el) el.classList.toggle('colorblind-mode', enabled); });
          try {
            localStorage.setItem('inv101_colorblind', enabled ? 'true' : 'false');
            localStorage.setItem('colorblindMode', enabled ? 'true' : 'false');
          } catch (e) {}
          showToast(enabled ? 'Colorblind mode enabled' : 'Colorblind mode disabled');
        });
      }

      if (compactToggle) {
        compactToggle.checked = root.classList.contains('compact-mode');
        compactToggle.addEventListener('change', async function(){
          const enabled = !!this.checked;
          [root, bodyEl].forEach(el => { if (el) el.classList.toggle('compact-mode', enabled); });
          try {
            localStorage.setItem('inv101_compact', enabled ? 'true' : 'false');
            localStorage.setItem('compactMode', enabled ? 'true' : 'false');
          } catch (e) {}
          const ok = await savePreference('compact', { compact: enabled });
          showToast(ok ? (enabled ? 'Compact mode enabled' : 'Compact mode disabled') : 'Saved locally');
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
      themeButton = headerActions.querySelector('.theme-toggle');
      if (!themeButton) {
        themeButton = document.createElement('button');
        themeButton.type = 'button';
        themeButton.className = 'theme-toggle icon-button';
        themeButton.innerHTML = '<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M4.93 19.07l1.41-1.41"></path><path d="M17.66 6.34l1.41-1.41"></path></svg>';
        headerActions.insertBefore(themeButton, headerActions.firstChild);
      }

      themeButton.addEventListener('click', async () => {
        const order = ['light', 'dark', 'sepia'];
        const current = detectTheme();
        const next = order[(order.indexOf(current) + 1) % order.length];
        await selectTheme(next, { persist: true });
      });
      updateThemeButton(detectTheme());

      let compactBtn = headerActions.querySelector('.compact-toggle');
      if (!compactBtn) {
        compactBtn = document.createElement('button');
        compactBtn.type = 'button';
        compactBtn.className = 'compact-toggle icon-button';
        compactBtn.setAttribute('aria-label','Toggle compact mode');
        compactBtn.title = 'Toggle compact mode';
        compactBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="6" rx="1"></rect><rect x="3" y="14" width="10" height="6" rx="1"></rect></svg>';
        const anchor = themeButton ? themeButton.nextSibling : headerActions.firstChild;
        headerActions.insertBefore(compactBtn, anchor);
      }

      let compactLocal = null;
      try {
        compactLocal = localStorage.getItem('inv101_compact');
      } catch (e) {}
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
        if (document.body) document.body.classList.add('compact-mode');
      }

      compactBtn.addEventListener('click', async () => {
        const now = !document.documentElement.classList.contains('compact-mode');
        [document.documentElement, document.body].forEach(el => { if (el) el.classList.toggle('compact-mode', now); });
        try {
          localStorage.setItem('inv101_compact', now ? 'true' : 'false');
          localStorage.setItem('compactMode', now ? 'true' : 'false');
        } catch (e) {}
        const ok = await savePreference('compact', { compact: !!now });
        showToast(ok ? (now ? 'Compact mode enabled' : 'Compact mode disabled') : 'Saved locally');
        const compactToggle = document.getElementById('compactModeToggle');
        if (compactToggle) compactToggle.checked = now;
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

    // Accessibility: ensure sidebar is not focusable on small screens, and tabbar is hidden on desktop.
    function updateResponsiveAccessibility(){
      try {
        const isMobile = window.innerWidth <= 1023;
        if (sidebar) {
          const navBtns = sidebar.querySelectorAll('.sidebar__btn');
          if (isMobile) {
            sidebar.setAttribute('aria-hidden','true');
            // Use inert if available for stronger a11y; otherwise fallback to tabindex -1
            if ('inert' in HTMLElement.prototype) sidebar.inert = true; else navBtns.forEach(b => b.setAttribute('tabindex','-1'));
          } else {
            sidebar.removeAttribute('aria-hidden');
            if ('inert' in HTMLElement.prototype) sidebar.inert = false; else navBtns.forEach(b => b.removeAttribute('tabindex'));
          }
        }
        const tabbar = document.querySelector('.tabbar');
        if (tabbar) {
          if (isMobile) {
            tabbar.removeAttribute('aria-hidden');
          } else {
            tabbar.setAttribute('aria-hidden','true');
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // run once on load and on resize (debounced)
    updateResponsiveAccessibility();
    let _resizeTimer = null;
    window.addEventListener('resize', function(){
      if (_resizeTimer) clearTimeout(_resizeTimer);
      _resizeTimer = setTimeout(updateResponsiveAccessibility, 120);
    });

    // Load inert polyfill dynamically if needed (only when browser doesn't support inert)
    (function maybeLoadInert(){
      if (!('inert' in HTMLElement.prototype)) {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/wicg-inert@3.1.1/dist/inert.min.js';
        s.async = true;
        s.onload = () => { console.log('Inert polyfill loaded'); };
        s.onerror = () => { console.warn('Failed to load inert polyfill'); };
        document.head.appendChild(s);
      }
    })();

    // Dev overlay when ?dev=1 in URL — shows active theme and CSS var values
    (function maybeShowDevOverlay(){
      try {
        if (!location.search.includes('dev=1')) return;
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.right = '12px';
        overlay.style.top = '12px';
        overlay.style.zIndex = 3000;
        overlay.style.background = 'rgba(0,0,0,0.6)';
        overlay.style.color = '#fff';
        overlay.style.padding = '8px 10px';
        overlay.style.borderRadius = '8px';
        overlay.style.fontSize = '12px';
        overlay.style.fontFamily = 'monospace';
        function update(){
          const sidebarWidth = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width').trim();
          const theme = document.documentElement.classList.contains('dark-mode') ? 'dark' : (document.documentElement.classList.contains('theme-sepia') ? 'sepia' : 'light');
          overlay.textContent = `theme:${theme} | --sidebar-width:${sidebarWidth}`;
        }
        update();
        document.body.appendChild(overlay);
        setInterval(update, 800);
      } catch (e) {}
    })();

    // Welcome banner persistence (rehydrates after one week)
    (function initWelcomeBanner(){
      const banner = document.getElementById('welcomeBanner');
      if (!banner) return;
      const storageKey = 'inv101_welcome_dismissed_at';
      const reopenAfterMs = 7 * 24 * 60 * 60 * 1000;
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const timestamp = Number(stored);
          if (Number.isFinite(timestamp)) {
            const elapsed = Date.now() - timestamp;
            if (elapsed < reopenAfterMs) {
              banner.classList.add('is-hidden');
            } else {
              localStorage.removeItem(storageKey);
              banner.classList.remove('is-hidden');
            }
          }
        } else {
          banner.classList.remove('is-hidden');
        }
      } catch (e) {
        banner.classList.remove('is-hidden');
      }

      const closeBtn = banner.querySelector('.welcome-banner__close');
      if (!closeBtn) return;
      closeBtn.addEventListener('click', function(){
        banner.classList.add('is-hidden');
        try {
          localStorage.setItem(storageKey, String(Date.now()));
        } catch (e) {
          // ignore storage failures
        }
      });
    })();
  });
})();
