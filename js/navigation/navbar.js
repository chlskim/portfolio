/* ================================================================
   NAVIGATION — navbar.js
   Handles three behaviors:
     1. Adds .scrolled to .navbar once the user scrolls past 60px
        (triggers the compact, more-opaque nav style).
     2. Toggles the mobile drawer (.nav-menu.open) when the
        hamburger button is clicked, and closes it when a nav
        link inside the drawer is selected.
     3. Toggles the Projects dropdown button (aria-expanded) so
        the panel is accessible via keyboard on both desktop and
        mobile.
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

  const desktopQuery = window.matchMedia('(min-width: 769px)');
  const closeMenuOnDesktop = (event) => {
    if (event.matches) {
      setMobileMenu(false);
    }
  };

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', closeMenuOnDesktop);
  } else {
    desktopQuery.addListener(closeMenuOnDesktop);
  }

  /* Clicking any nav link inside the open drawer closes the menu.
     The dropdown trigger (.nav-link--dropdown) is excluded here —
     it controls its own sub-panel and must not close the whole drawer. */
  navLinks.forEach(link => {
    if (link.classList.contains('nav-link--dropdown')) return;
    link.addEventListener('click', () => {
      if (menu.classList.contains('open')) {
        setMobileMenu(false);
      }
    });
  });

  /* Clicking a link inside the Projects sub-panel also closes the drawer */
  const dropdownLinks = menu.querySelectorAll('.nav-dropdown__link');
  dropdownLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('open')) {
        setMobileMenu(false);
      }
    });
  });

  /* Projects dropdown button — referenced by the keydown handler below */
  const dropdownBtn = document.querySelector('.nav-link--dropdown');

  /* Pressing Escape closes the drawer (keyboard accessibility) */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    /* Close the mobile drawer if it is open */
    if (menu.classList.contains('open')) {
      setMobileMenu(false);
      toggle.focus(); /* return focus to the hamburger */
    }

    /* Close the Projects dropdown if it is open */
    if (dropdownBtn && dropdownBtn.getAttribute('aria-expanded') === 'true') {
      dropdownBtn.setAttribute('aria-expanded', 'false');
      dropdownBtn.focus();
    }
  });


  /* ================================================================
     3. PROJECTS DROPDOWN TOGGLE
     The Projects button uses aria-expanded to signal state.
     CSS shows/hides the panel via the attribute selector
     [aria-expanded="true"] + .nav-dropdown.
     On desktop the panel also appears on hover (pure CSS).
     ================================================================ */

  if (dropdownBtn) {

    /* Click: toggle aria-expanded on the button */
    dropdownBtn.addEventListener('click', () => {
      const isOpen = dropdownBtn.getAttribute('aria-expanded') === 'true';
      dropdownBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    /* Close the dropdown when focus moves outside the wrapper li */
    const dropdownWrapper = dropdownBtn.closest('.nav-item--dropdown');
    if (dropdownWrapper) {
      dropdownWrapper.addEventListener('focusout', (e) => {
        /* relatedTarget is where focus is going; if it leaves the wrapper, close */
        if (!dropdownWrapper.contains(e.relatedTarget)) {
          dropdownBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

  }

})();
