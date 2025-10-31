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

    async function applyServerPrefIfMissing() {
      if (collapsed !== null) return; // local preference exists
      try {
        const resp = await fetch('/api/preferences/sidebar', { method: 'GET', credentials: 'include' });
        if (resp && resp.ok) {
          const body = await resp.json();
          if (body && body.success && body.preference && typeof body.preference.collapsed === 'boolean') {
            collapsed = !!body.preference.collapsed;
          }
        }
      } catch (e) {
        // ignore network/auth failures
      }
    }

    await (async () => { await applyServerPrefIfMissing(); })();

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
    function ensureThemeButton(){
      const header = document.querySelector('.global-header') || document.querySelector('.app__header');
      if (!header) return null;
      let actions = header.querySelector('.actions') || header.querySelector('.app__header-actions');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'actions';
        header.appendChild(actions);
      }
      let themeBtn = actions.querySelector('.theme-toggle');
      if (!themeBtn) {
        themeBtn = document.createElement('button');
        themeBtn.type = 'button';
        themeBtn.className = 'theme-toggle icon-button';
        themeBtn.setAttribute('aria-label','Toggle theme');
        themeBtn.title = 'Toggle theme';
        themeBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle></svg>';
        actions.appendChild(themeBtn);
      }
      return themeBtn;
    }

    const themeBtn = ensureThemeButton();
    // initialize theme from localStorage or server preference
    const localTheme = localStorage.getItem('inv101_theme');
    if (localTheme) document.documentElement.classList.add(localTheme === 'dark' ? 'dark-mode' : (localTheme === 'sepia' ? 'theme-sepia' : ''));
    
    function cycleTheme(){
      const hasDark = document.documentElement.classList.contains('dark-mode');
      const hasSepia = document.documentElement.classList.contains('theme-sepia');
      if (!hasDark && !hasSepia) {
        // go dark
        document.documentElement.classList.add('dark-mode');
        document.documentElement.classList.remove('theme-sepia');
        localStorage.setItem('inv101_theme','dark');
        saveThemePreference('dark');
      } else if (hasDark) {
        // go sepia
        document.documentElement.classList.remove('dark-mode');
        document.documentElement.classList.add('theme-sepia');
        localStorage.setItem('inv101_theme','sepia');
        saveThemePreference('sepia');
      } else {
        // go light
        document.documentElement.classList.remove('dark-mode');
        document.documentElement.classList.remove('theme-sepia');
        localStorage.setItem('inv101_theme','light');
        saveThemePreference('light');
      }
    }

    if (themeBtn) themeBtn.addEventListener('click', cycleTheme);

    async function saveThemePreference(theme){
      try {
        await fetch('/api/preferences/theme', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme })
        });
      } catch (e) {}
    }

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
      savePreference(isCollapsed);
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

    // Save preference helper: tries to POST to server (will work if user has a session cookie or auth)
    async function savePreference(collapsedState){
      try {
        await fetch('/api/preferences/sidebar', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collapsed: !!collapsedState })
        });
      } catch (e) {
        // ignore failures (unauthenticated clients will 401)
      }
    }
  });
})();
