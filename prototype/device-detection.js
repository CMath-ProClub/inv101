/**
 * Device Detection and Responsive Behavior
 * Detects device type and adds appropriate classes to the document
 */

(function() {
  'use strict';

  /**
   * Detect device type based on screen size and user agent
   */
  function detectDevice() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Device type detection
    const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent) || 
                     (isMobile && Math.min(width, height) >= 768);
    const isDesktop = !isMobile && !isTablet;
    
    // Screen size categories
    const isSmallMobile = width < 480;
    const isMediumMobile = width >= 480 && width < 768;
    const isTabletPortrait = width >= 768 && width < 1024;
    const isTabletLandscape = width >= 1024 && width < 1280;
    const isDesktopSmall = width >= 1280 && width < 1600;
    const isDesktopMedium = width >= 1600 && width < 1920;
    const isDesktopLarge = width >= 1920;
    
    // Orientation
    const isPortrait = height > width;
    const isLandscape = width > height;
    
    return {
      type: isDesktop ? 'desktop' : (isTablet ? 'tablet' : 'mobile'),
      isMobile,
      isTablet,
      isDesktop,
      isSmallMobile,
      isMediumMobile,
      isTabletPortrait,
      isTabletLandscape,
      isDesktopSmall,
      isDesktopMedium,
      isDesktopLarge,
      isPortrait,
      isLandscape,
      width,
      height,
      userAgent
    };
  }

  /**
   * Apply device-specific classes to the document
   */
  function applyDeviceClasses(device) {
    const html = document.documentElement;
    const body = document.body;
    
    // Remove all device classes
    const deviceClasses = [
      'device-mobile', 'device-tablet', 'device-desktop',
      'device-small-mobile', 'device-medium-mobile',
      'device-tablet-portrait', 'device-tablet-landscape',
      'device-desktop-small', 'device-desktop-medium', 'device-desktop-large',
      'orientation-portrait', 'orientation-landscape'
    ];
    
    deviceClasses.forEach(cls => {
      html.classList.remove(cls);
      body.classList.remove(cls);
    });
    
    // Add current device classes
    const classesToAdd = [];
    
    if (device.isMobile) classesToAdd.push('device-mobile');
    if (device.isTablet) classesToAdd.push('device-tablet');
    if (device.isDesktop) classesToAdd.push('device-desktop');
    
    if (device.isSmallMobile) classesToAdd.push('device-small-mobile');
    if (device.isMediumMobile) classesToAdd.push('device-medium-mobile');
    if (device.isTabletPortrait) classesToAdd.push('device-tablet-portrait');
    if (device.isTabletLandscape) classesToAdd.push('device-tablet-landscape');
    if (device.isDesktopSmall) classesToAdd.push('device-desktop-small');
    if (device.isDesktopMedium) classesToAdd.push('device-desktop-medium');
    if (device.isDesktopLarge) classesToAdd.push('device-desktop-large');
    
    if (device.isPortrait) classesToAdd.push('orientation-portrait');
    if (device.isLandscape) classesToAdd.push('orientation-landscape');
    
    classesToAdd.forEach(cls => {
      html.classList.add(cls);
      body.classList.add(cls);
    });
  }

  /**
   * Update layout based on device
   */
  function updateLayout() {
    const device = detectDevice();
    applyDeviceClasses(device);
    
    // Log device info (can be removed in production)
    console.log('Device detected:', {
      type: device.type,
      width: device.width,
      height: device.height,
      orientation: device.isPortrait ? 'portrait' : 'landscape'
    });
    
    // Store device info for other scripts
    window.deviceInfo = device;
  }

  /**
   * Handle sidebar active state on desktop
   */
  function handleSidebarNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const sidebarButtons = document.querySelectorAll('.sidebar__btn');
    
    sidebarButtons.forEach(btn => {
      const href = btn.getAttribute('href');
      if (href === currentPage) {
        btn.classList.add('sidebar__btn--active');
      } else {
        btn.classList.remove('sidebar__btn--active');
      }
    });
  }

  /**
   * Initialize device detection
   */
  function init() {
    // Initial detection
    updateLayout();
    
    // Update on resize with debouncing
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateLayout, 250);
    });
    
    // Update on orientation change
    window.addEventListener('orientationchange', function() {
      setTimeout(updateLayout, 100);
    });
    
    // Handle sidebar navigation when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        handleSidebarNavigation();
        loadSharedAssets();
      });
    } else {
      handleSidebarNavigation();
      loadSharedAssets();
    }
  }

  // Start detection
  init();

  /**
   * Dynamically load shared UI CSS/JS and initialize shared UI elements
   * This keeps existing pages untouched while ensuring a consistent header/tabbar/sidebar
   */
  function loadSharedAssets() {
    try {
      // Avoid double-loading
      if (document.querySelector('link[data-shared-ui]')) return;

      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'shared-ui.css';
      link.setAttribute('data-shared-ui', 'true');
      document.head.appendChild(link);

      var script = document.createElement('script');
      script.src = 'shared-ui.js';
      script.defer = true;
      script.onload = function() {
        if (window.sharedUI && typeof window.sharedUI.ensureSharedUI === 'function') {
          try { window.sharedUI.ensureSharedUI(); } catch (e) { console.warn('sharedUI init failed', e); }
        }
      };
      document.head.appendChild(script);
    } catch (e) {
      console.warn('Failed to load shared UI assets', e);
    }
  }

})();
