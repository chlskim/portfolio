/* ================================================================
   NAVIGATION — navbar.js
   Handles two behaviors:
     1. Adds .scrolled to .navbar once the user scrolls past 60px
        (triggers the compact, more-opaque nav style).
     2. Toggles the mobile drawer (.nav-menu.open) when the
        hamburger button is clicked, and closes it when a nav
        link inside the drawer is selected.
   ================================================================ */

(function () {
  'use strict';

  /* ── Element references ──────────────────────────────────────── */
  const navbar   = document.querySelector('.navbar');
  const toggle   = document.querySelector('.nav-toggle');
  const menu     = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  /* Guard: bail if any required element is missing */
  if (!navbar || !toggle || !menu) return;


  /* ================================================================
     1. SCROLL BEHAVIOR
     IntersectionObserver watches a 1px sentinel element at the top
     of the page. When it leaves the viewport the nav gets .scrolled.
     Using an observer is cheaper than running logic on every scroll event.
     ================================================================ */

  /* Create a tiny sentinel div at the very top of the document body */
  const scrollSentinel = document.createElement('div');
  scrollSentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:60px;pointer-events:none;';
  document.body.prepend(scrollSentinel);

  const scrollObserver = new IntersectionObserver(
    ([entry]) => {
      /* entry.isIntersecting = sentinel is still visible → not scrolled */
      navbar.classList.toggle('scrolled', !entry.isIntersecting);
    },
    { threshold: 0 }
  );

  scrollObserver.observe(scrollSentinel);


  /* ================================================================
     2. MOBILE MENU TOGGLE
     The hamburger button (.nav-toggle) opens and closes the
     slide-in drawer (.nav-menu). Clicking any nav link inside
     the open drawer closes it automatically.
     ================================================================ */

  /**
   * Opens or closes the mobile drawer.
   * @param {boolean} open - true to open, false to close.
   */
  function setMobileMenu(open) {
    menu.classList.toggle('open', open);
    toggle.classList.toggle('active', open);

    /* Accessibility: tell screen readers whether the menu is expanded */
    toggle.setAttribute('aria-expanded', String(open));

    /* Prevent body scroll while the overlay drawer is open */
    document.body.style.overflow = open ? 'hidden' : '';
  }

  /* Hamburger click: toggle between open and closed */
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('open');
    setMobileMenu(!isOpen);
  });

  /* Clicking any nav link inside the open drawer closes the menu */
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('open')) {
        setMobileMenu(false);
      }
    });
  });

  /* Pressing Escape closes the drawer (keyboard accessibility) */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      setMobileMenu(false);
      toggle.focus(); /* return focus to the hamburger */
    }
  });

})();
