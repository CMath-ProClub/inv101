// Small global UI helpers for the prototype: sidebar toggle + persistence + keyboard shortcut
(function(){
  function ready(fn){
    if (document.readyState !== 'loading') return fn();
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function(){
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // Apply persisted state
    const collapsed = localStorage.getItem('inv101_sidebar_collapsed') === 'true';
    if (collapsed) {
      sidebar.classList.add('collapsed');
      document.body.classList.add('sidebar-collapsed');
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

    function setCollapsed(v){
      if (v) {
        sidebar.classList.add('collapsed');
        document.body.classList.add('sidebar-collapsed');
      } else {
        sidebar.classList.remove('collapsed');
        document.body.classList.remove('sidebar-collapsed');
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

    // Make sidebar nav links focusable and improve hit target
    const navBtns = sidebar.querySelectorAll('.sidebar__btn');
    navBtns.forEach(btn => {
      btn.setAttribute('tabindex','0');
      btn.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  });
})();
