/* ================================================================
   SCROLL — scroll-utilities.js
   Two independent scroll-driven behaviors:

   1. SCROLL-TO-TOP BUTTON
      Fades in a fixed "↑" button once the user scrolls past 400px.
      Clicking it smooth-scrolls back to the top of the page.

   2. SCROLL-IN REVEAL
      Watches every [data-reveal] element with an IntersectionObserver.
      When 15% of the element enters the viewport, .is-visible is added,
      triggering the CSS opacity+translateY transition defined in utilities.css.
      An optional data-reveal-delay="ms" attribute staggers the transition.
      Each element is observed exactly once (unobserve after trigger).
   ================================================================ */

(function () {
  'use strict';


  /* ================================================================
     1. SCROLL-TO-TOP BUTTON
     ================================================================ */

  const scrollTopBtn = document.getElementById('scrollTop');

  if (scrollTopBtn) {
    let ticking = false;

    /**
     * Shows or hides the scroll-top button based on scroll position.
     * The button becomes visible after 400px of vertical scroll.
     */
    function updateScrollTopVisibility() {
      scrollTopBtn.classList.toggle('is-visible', window.scrollY > 400);
      ticking = false;
    }

    function requestScrollTopVisibilityUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateScrollTopVisibility);
    }

    /* Listen for scroll — passive: true for performance (no preventDefault) */
    window.addEventListener('scroll', requestScrollTopVisibilityUpdate, { passive: true });

    /* Smooth-scroll to the very top when clicked */
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* Run once on load in case the page starts partially scrolled */
    updateScrollTopVisibility();
  }


  /* ================================================================
     2. SCROLL-IN REVEAL — IntersectionObserver
     ================================================================ */

  const revealElements = document.querySelectorAll('[data-reveal]');

  if (!revealElements.length) return;

  /**
   * Called by the observer when a watched element enters the viewport.
   * Applies an optional delay (data-reveal-delay in ms) before adding
   * the .is-visible class that triggers the CSS animation.
   * @param {IntersectionObserverEntry[]} entries
   * @param {IntersectionObserver} observer
   */
  function onReveal(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el    = entry.target;
      const delay = parseInt(el.dataset.revealDelay, 10) || 0;

      /* Delay lets sibling elements stagger their entrance */
      setTimeout(() => el.classList.add('is-visible'), delay);

      /* Stop watching — the animation only plays once */
      observer.unobserve(el);
    });
  }

  /*
   * threshold: 0.15 — the callback fires when 15% of the element
   * is visible. This feels natural: the element isn't too early
   * (still mostly off-screen) or too late (half gone by the time it animates).
   */
  const revealObserver = new IntersectionObserver(onReveal, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));

})();
