(function(){
  'use strict';

  // Namespace for shared UI helpers
  window.sharedUI = window.sharedUI || {};

  function createHeader() {
    if (document.querySelector('.app__header')) return;

    var header = document.createElement('header');
    header.className = 'app__header';

    var img = document.createElement('img');
    img.className = 'app__logo';
    img.src = 'assets/Investing101.png';
    img.alt = 'Investing101 logo';
    img.style.cursor = 'pointer';
    img.addEventListener('click', function(){ window.location.href = 'index.html'; });

    var actions = document.createElement('div');
    actions.className = 'app__header-actions';

    var btnNotif = document.createElement('button');
    btnNotif.className = 'icon-button';
    btnNotif.type = 'button';
    btnNotif.setAttribute('aria-label','Notifications');
    // use sprite icon
    var svgNotif = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svgNotif.setAttribute('class','icon');
    svgNotif.setAttribute('aria-hidden','true');
    var useNotif = document.createElementNS('http://www.w3.org/2000/svg','use');
    useNotif.setAttributeNS('http://www.w3.org/1999/xlink','href','assets/icons.svg#icon-bell');
    svgNotif.appendChild(useNotif);
    btnNotif.appendChild(svgNotif);

    var btnShare = document.createElement('button');
    btnShare.className = 'icon-button';
    btnShare.type = 'button';
    btnShare.setAttribute('aria-label', 'Share');
    var svgShare = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svgShare.setAttribute('class','icon');
    svgShare.setAttribute('aria-hidden','true');
    var useShare = document.createElementNS('http://www.w3.org/2000/svg','use');
    useShare.setAttributeNS('http://www.w3.org/1999/xlink','href','assets/icons.svg#icon-share');
    svgShare.appendChild(useShare);
    btnShare.appendChild(svgShare);

    actions.appendChild(btnNotif);
    actions.appendChild(btnShare);

    header.appendChild(img);
    header.appendChild(actions);

    var app = document.querySelector('.app') || document.body;
    if (app.firstChild) app.insertBefore(header, app.firstChild);
    else app.appendChild(header);
  }

  function createTabbar() {
    if (document.querySelector('.tabbar')) return;

    var nav = document.createElement('nav');
    nav.className = 'tabbar';
    nav.setAttribute('aria-label','Primary navigation');

    var items = [
      {href:'index.html', label:'Main', iconPath:'M3 10.5L12 3l9 7.5 M5 10.5V21h14V10.5 M9 21v-6h6v6'},
      {href:'simulator.html', label:'Sim/AI', iconPath:'circle cx="12" cy="12" r="9"'},
      {href:'lessons.html', label:'Lessons', iconPath:'M4 19V5l8-3 8 3v14l-8 3-8-3z'},
      {href:'calculators.html', label:'Calc', iconPath:'rect x="3" y="4" width="18" height="16" rx="2"'},
      {href:'profile.html', label:'Profile', iconPath:'circle cx="12" cy="8" r="4"'}
    ];

    items.forEach(function(it, idx){
      var a = document.createElement('a');
      a.className = 'tabbar__btn';
      a.href = it.href;

  var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','icon icon--tab');
  svg.setAttribute('aria-hidden','true');
  var useEl = document.createElementNS('http://www.w3.org/2000/svg','use');
  // use provided iconId or fallback to home
  var iconId = it.iconId || 'icon-home';
  useEl.setAttributeNS('http://www.w3.org/1999/xlink','href','assets/icons.svg#' + iconId);
  svg.appendChild(useEl);

      var span = document.createElement('span');
      span.textContent = it.label;

      a.appendChild(svg);
      a.appendChild(span);
      nav.appendChild(a);
    });

    var app = document.querySelector('.app') || document.body;
    app.appendChild(nav);

    // mark active based on location
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var links = nav.querySelectorAll('.tabbar__btn');
    links.forEach(function(l){
      if (l.getAttribute('href') === currentPage) l.classList.add('tabbar__btn--active');
      else l.classList.remove('tabbar__btn--active');
    });
  }

  function createSidebar() {
    // Only create sidebar for desktop contexts
    if (document.querySelector('.sidebar')) return;
    var isDesktop = (window.deviceInfo && window.deviceInfo.isDesktop) || window.innerWidth >= 1024;
    if (!isDesktop) return;

    var aside = document.createElement('aside');
    aside.className = 'sidebar';

    var a = document.createElement('a');
    a.href = 'index.html';
    a.className = 'sidebar__logo';
    a.setAttribute('aria-label','Return to main page');
    a.style.textDecoration = 'none';

    var img = document.createElement('img');
    img.src = 'assets/Investing101.png';
    img.alt = 'Investing101 logo';
    a.appendChild(img);
    aside.appendChild(a);

    var nav = document.createElement('nav');
    nav.className = 'sidebar__nav';
    nav.setAttribute('aria-label','Primary navigation');

    var links = [
      {href:'index.html', label:'Main Dashboard', iconId:'icon-home'},
      {href:'simulator.html', label:'Simulator & AI', iconId:'icon-sim'},
      {href:'lessons.html', label:'Lessons', iconId:'icon-lessons'},
      {href:'calculators.html', label:'Calculators', iconId:'icon-calc'},
      {href:'profile.html', label:'Profile', iconId:'icon-profile'}
    ];

    links.forEach(function(it){
      var link = document.createElement('a');
      link.className = 'sidebar__btn';
      link.href = it.href;

      var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('class','icon');
      svg.setAttribute('aria-hidden','true');
      var useEl = document.createElementNS('http://www.w3.org/2000/svg','use');
      useEl.setAttributeNS('http://www.w3.org/1999/xlink','href','assets/icons.svg#' + (it.iconId || 'icon-home'));
      svg.appendChild(useEl);
      link.appendChild(svg);

      var span = document.createElement('span');
      span.textContent = it.label;
      link.appendChild(span);
      nav.appendChild(link);
    });

    aside.appendChild(nav);

    var app = document.querySelector('.app') || document.body;
    // insert at the top so layout follows prototype/index.html structure
    if (app.firstChild) app.insertBefore(aside, app.firstChild);
    else app.appendChild(aside);

    // set active
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var sidebarButtons = aside.querySelectorAll('.sidebar__btn');
    sidebarButtons.forEach(function(btn){
      if (btn.getAttribute('href') === currentPage) btn.classList.add('sidebar__btn--active');
      else btn.classList.remove('sidebar__btn--active');
    });
  }

  function ensureSharedUI(){
    try {
      createHeader();
      createTabbar();
      createSidebar();
    } catch (e) {
      console.warn('ensureSharedUI error', e);
    }
  }

  // expose
  window.sharedUI.ensureSharedUI = ensureSharedUI;

})();
