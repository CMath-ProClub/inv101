(function bootstrapShellAssets(){
  try {
    const doc = document;
    const head = doc.head || doc.getElementsByTagName('head')[0];
    if (head && !doc.getElementById('inv101-theme-refresh')) {
      const link = doc.createElement('link');
      link.id = 'inv101-theme-refresh';
      link.rel = 'stylesheet';
      link.href = 'styles/ui-refresh.css';
      head.appendChild(link);
    }

    const hasAuthWidget = Array.from(doc.scripts || []).some(script => /auth-widget\.js(?:$|\?)/.test(script.src)) || doc.getElementById('inv101-auth-widget');
    if (head && !hasAuthWidget) {
      const script = doc.createElement('script');
      script.id = 'inv101-auth-widget';
      script.src = 'auth-widget.js';
      script.defer = true;
      head.appendChild(script);
    }

    function markShell(){
      doc.documentElement.classList.add('app-shell-root');
      if (doc.body) doc.body.classList.add('app-shell');
    }

    if (doc.readyState !== 'loading') {
      markShell();
    } else {
      doc.addEventListener('DOMContentLoaded', markShell, { once: true });
    }
  } catch (err) {
    console.warn('Shell bootstrap failed', err);
  }
})();

const CP1252_EXTENDED = [
  0x20AC, 0xFFFD, 0x201A, 0x0192, 0x201E, 0x2026, 0x2020, 0x2021,
  0x02C6, 0x2030, 0x0160, 0x2039, 0x0152, 0xFFFD, 0x017D, 0xFFFD,
  0xFFFD, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2013, 0x2014,
  0x02DC, 0x2122, 0x0161, 0x203A, 0x0153, 0xFFFD, 0x017E, 0x0178
];

const CP1252_REVERSE = (() => {
  const map = {};
  CP1252_EXTENDED.forEach((code, index) => {
    if (code !== 0xFFFD) map[code] = 0x80 + index;
  });
  return map;
})();

const UTF8_DECODER = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8') : null;

function decodeLikelyMisencoded(text){
  if (!UTF8_DECODER || typeof text !== 'string') return text;
  if (!/[ÂâðŸ]/.test(text)) return text;
  const bytes = [];
  let mutated = false;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code <= 0xFF) {
      if (code >= 0x80) mutated = true;
      bytes.push(code);
    } else {
      const mapped = CP1252_REVERSE[code];
      if (mapped === undefined) return text;
      bytes.push(mapped);
      mutated = true;
    }
  }
  if (!mutated) return text;
  try {
    return UTF8_DECODER.decode(new Uint8Array(bytes));
  } catch (err) {
    return text;
  }
}

function sanitizeTextNodes(root){
  if (!root || !UTF8_DECODER) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const pattern = /[ÂâðŸ]/;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node || !node.nodeValue) continue;
    const value = node.nodeValue;
    if (!pattern.test(value)) continue;
    const decoded = decodeLikelyMisencoded(value);
    if (decoded !== value) node.nodeValue = decoded;
  }
}

const SUPPORTED_THEMES = [
  'light',
  'dark',
  'ultradark',
  'emerald-trust',
  'quantum-violet',
  'copper-balance',
  'regal-portfolio',
  'carbon-edge',
];

const THEME_LABELS = {
  light: 'Light',
  dark: 'Dark',
  'ultradark': 'Ultradark',
  'emerald-trust': 'Emerald Trust',
  'quantum-violet': 'Quantum Violet',
  'copper-balance': 'Copper Balance',
  'regal-portfolio': 'Regal Portfolio',
  'carbon-edge': 'Carbon Edge',
};

const DARK_THEMES = new Set(['dark', 'ultradark', 'quantum-violet', 'carbon-edge']);

const LEGACY_THEME_ALIAS = {
  sepia: 'copper-balance',
};

function normalizeTheme(theme){
  if (!theme) return 'light';
  let lower = String(theme).trim().toLowerCase();
  if (lower.startsWith('theme-')) lower = lower.slice(6);
  if (SUPPORTED_THEMES.includes(lower)) return lower;
  if (LEGACY_THEME_ALIAS[lower]) return LEGACY_THEME_ALIAS[lower];
  if (lower === 'dark') return 'dark';
  if (lower === 'light') return 'light';
  return 'light';
}

function setThemeClasses(themeId){
  const resolved = normalizeTheme(themeId);
  const root = document.documentElement;
  const bodyEl = document.body;
  const removable = SUPPORTED_THEMES.map(id => 'theme-' + id).concat(['dark-mode', 'theme-sepia']);
  removable.forEach(cls => {
    root.classList.remove(cls);
    if (bodyEl) bodyEl.classList.remove(cls);
  });
  const addClass = 'theme-' + resolved;
  root.classList.add(addClass);
  if (bodyEl) bodyEl.classList.add(addClass);
  return resolved;
}

function detectTheme(){
  const root = document.documentElement;
  const bodyEl = document.body;
  for (const id of SUPPORTED_THEMES) {
    const cls = 'theme-' + id;
    if (root.classList.contains(cls) || (bodyEl && bodyEl.classList.contains(cls))) {
      return id;
    }
  }
  return 'light';
}

function updateStoredTheme(theme){
  const normalized = normalizeTheme(theme);
  try {
    localStorage.setItem('inv101_theme', normalized);
    localStorage.setItem('darkMode', DARK_THEMES.has(normalized) ? 'true' : 'false');
  } catch (e) {}
}

function humanizeTheme(theme){
  return THEME_LABELS[normalizeTheme(theme)] || 'Light';
}

// Prime theme and colorblind classes as early as possible so pages load without a flash.
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
    const themeToApply = normalizeTheme(localTheme || legacyDark || 'light');
    setThemeClasses(themeToApply);
    withBody(() => setThemeClasses(themeToApply));

    const storedColorblind = localStorage.getItem('inv101_colorblind');
    const legacyColorblind = localStorage.getItem('colorblindMode');
    const enableColorblind = storedColorblind !== null ? storedColorblind === 'true' : legacyColorblind === 'true';
    if (enableColorblind) {
      root.classList.add('colorblind-mode');
      withBody(body => body.classList.add('colorblind-mode'));
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
    sanitizeTextNodes(document.body);
    const currentTitle = document.title;
    const decodedTitle = decodeLikelyMisencoded(currentTitle);
    if (decodedTitle !== currentTitle) document.title = decodedTitle;

    const shellRoot = document.querySelector('body > .flex.min-h-screen.flex-col');
    let headerCandidate = shellRoot ? shellRoot.querySelector(':scope > header') : document.querySelector('.app__header') || document.querySelector('.global-header');
    if (!headerCandidate && shellRoot) {
      headerCandidate = document.createElement('header');
      headerCandidate.className = 'app__header global-header';
      headerCandidate.innerHTML = '' +
        '<div class="brand">' +
          '<img src="assets/Investing101.png" alt="Investing101 logo" class="app__logo" />' +
          '<div class="brand-copy"><span>Investing101</span><small>Terminal</small></div>' +
        '</div>' +
        '<div class="app__header-actions">' +
          '<button class="icon-button" type="button" aria-label="Notifications">' +
            '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />' +
              '<path d="M13.73 21a2 2 0 01-3.46 0" />' +
            '</svg>' +
          '</button>' +
          '<button class="btn btn--ghost btn--with-icon" type="button"><span>Share</span></button>' +
        '</div>';
      const aside = shellRoot.querySelector(':scope > aside');
      if (aside && aside.nextSibling) {
        shellRoot.insertBefore(headerCandidate, aside.nextSibling);
      } else if (aside) {
        shellRoot.appendChild(headerCandidate);
      } else {
        shellRoot.insertBefore(headerCandidate, shellRoot.firstChild || null);
      }
    }
    if (headerCandidate) {
      headerCandidate.classList.add('global-header');
      if (!headerCandidate.classList.contains('app__header') && headerCandidate.querySelector('.app__logo')) {
        headerCandidate.classList.add('app__header');
      }
    }

    let sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
      const logoAside = document.querySelector('aside .sidebar__logo');
      if (logoAside) sidebar = logoAside.closest('aside');
      else sidebar = shellRoot ? shellRoot.querySelector(':scope > aside') : document.querySelector('aside');
    }
    if (!sidebar) return;
    if (!sidebar.classList.contains('sidebar')) sidebar.classList.add('sidebar');

    const nav = sidebar.querySelector('nav');
    if (nav && !nav.classList.contains('sidebar__nav')) nav.classList.add('sidebar__nav');
    if (nav) {
      nav.querySelectorAll('a').forEach(link => {
        if (!link.classList.contains('sidebar__btn')) link.classList.add('sidebar__btn');
        if (link.getAttribute('aria-current') === 'page') {
          link.classList.add('sidebar__btn--active');
        }
      });
    }

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

    const expandedWidth = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-expanded') || '120px';
    const collapsedWidth = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-tab') || '28px';
    if (collapsed === true) {
      sidebar.classList.add('collapsed');
      document.body.classList.add('sidebar-collapsed');
      document.documentElement.style.setProperty('--sidebar-width', collapsedWidth);
    } else {
      document.documentElement.style.setProperty('--sidebar-width', expandedWidth);
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
  const themeCycle = SUPPORTED_THEMES;

    function updateThemeButton(theme){
      if (!themeButton) return;
      const label = humanizeTheme(theme);
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
      const resolved = setThemeClasses(theme);
      updateStoredTheme(resolved);
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
              try { localStorage.setItem('inv101_theme', normalizeTheme(t)); } catch (e) {}
            }
          }
        } catch (e) {}
      }
      const initial = await selectTheme(themePref || 'light');

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

      // Hook settings controls when present
      const colorblindToggle = document.getElementById('colorblindModeToggle');

      if (themeOptions.length) {
        themeOptions.forEach(input => {
          input.addEventListener('change', async function(){
            if (this.type === 'radio' && !this.checked) return;
            const target = this.dataset.themeOption || this.value;
            if (normalizeTheme(target) === detectTheme()) return;
            await selectTheme(target, { persist: true });
          });
        });
        syncThemeControls(initial);
      }

      try {
        localStorage.removeItem('inv101_compact');
        localStorage.removeItem('compactMode');
      } catch (e) {}
      root.classList.remove('compact-mode');
      if (bodyEl) bodyEl.classList.remove('compact-mode');

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
    }

    await initThemeFromPrefs();

    function setCollapsed(v){
    if (v) {
      sidebar.classList.add('collapsed');
      document.body.classList.add('sidebar-collapsed');
      document.documentElement.style.setProperty('--sidebar-width', getComputedStyle(document.documentElement).getPropertyValue('--sidebar-tab') || '28px');
    } else {
      sidebar.classList.remove('collapsed');
      document.body.classList.remove('sidebar-collapsed');
      document.documentElement.style.setProperty('--sidebar-width', getComputedStyle(document.documentElement).getPropertyValue('--sidebar-expanded') || '120px');
    }
    localStorage.setItem('inv101_sidebar_collapsed', !!v);
  }

    toggle.addEventListener('click', function(){
      const isCollapsed = sidebar.classList.toggle('collapsed');
      if (isCollapsed) document.body.classList.add('sidebar-collapsed'); else document.body.classList.remove('sidebar-collapsed');
      localStorage.setItem('inv101_sidebar_collapsed', isCollapsed);
      // For a11y announce
      toggle.setAttribute('aria-pressed', isCollapsed ? 'true' : 'false');
      toggle.title = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
      // update CSS variable to animate layout
      const collapsedWidth = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-tab') || '28px';
      if (isCollapsed) {
        document.documentElement.style.setProperty('--sidebar-width', collapsedWidth);
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
        const current = detectTheme();
        const idx = themeCycle.indexOf(current);
        const next = themeCycle[(idx + 1) % themeCycle.length];
        await selectTheme(next, { persist: true });
      });
      updateThemeButton(detectTheme());

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

// Sidebar toggle function
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
    
    // Save state to localStorage
    try {
      const isCollapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem('inv101_sidebar_collapsed', String(isCollapsed));
    } catch (e) {
      // Ignore storage errors
    }
  }
}

// Restore sidebar state on page load
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    try {
      const sidebar = document.querySelector('.sidebar');
      if (!sidebar) return;
      
      const wasCollapsed = localStorage.getItem('inv101_sidebar_collapsed') === 'true';
      if (wasCollapsed) {
        sidebar.classList.add('collapsed');
      }
    } catch (e) {
      // Ignore storage errors
    }
  });
})();
