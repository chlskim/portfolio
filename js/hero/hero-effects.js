/* ================================================================
   HERO — hero-effects.js
   Adds the name shimmer class once the hero fonts have loaded so
   the gradient animation starts from a clean state (not mid-sweep).
   ================================================================ */

(function () {
  'use strict';

  /* ── Shimmer trigger ─────────────────────────────────────────── */
  const nameRows = document.querySelectorAll('.hero-giant-name__row');

  if (!nameRows.length) return;

  /**
   * Adds the shimmer animation class to all giant-name rows.
   * Called after document fonts are ready so the initial paint
   * is correct before any animation runs.
   */
  function activateNameShimmer() {
    nameRows.forEach(row => row.classList.add('hero-name-shimmer'));
  }

  /* document.fonts.ready resolves once all declared @font-face fonts
     have finished loading (or failed). Falls back gracefully if the
     Fonts API is unavailable. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(activateNameShimmer);
  } else {
    /* Fallback: small delay to let fonts load before animation starts */
    setTimeout(activateNameShimmer, 600);
  }

})();
