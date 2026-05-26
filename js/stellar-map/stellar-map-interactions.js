/* ================================================================
   STELLAR MAP — stellar-map-interactions.js
   Handles click/keyboard toggling of node popup cards.

   Behavior:
   - Clicking a .stellar-node toggles .is-open on that node,
     which CSS uses to reveal the popup card above it.
   - Clicking any other open node first closes it, then opens the new one.
   - Clicking anywhere outside all nodes closes all open popups.
   - Pressing Escape closes all open popups.
   - Each node is keyboard-accessible via Enter or Space.
   ================================================================ */

(function () {
  'use strict';

  /* Collect all hotspot nodes */
  const nodes = Array.from(document.querySelectorAll('.stellar-node'));
  if (!nodes.length) return;

  /* Make each node focusable via keyboard (if not already a button/link) */
  nodes.forEach(node => {
    if (!node.getAttribute('tabindex')) {
      node.setAttribute('tabindex', '0');
    }
    if (!node.getAttribute('role')) {
      node.setAttribute('role', 'button');
    }
  });


  /**
   * Opens the given node's popup (and closes all others first).
   * If the node is already open, this toggles it closed.
   * @param {Element} targetNode - the .stellar-node that was activated.
   */
  function toggleNode(targetNode) {
    const isAlreadyOpen = targetNode.classList.contains('is-open');

    /* Close every node first */
    nodes.forEach(n => n.classList.remove('is-open'));

    /* If the target wasn't already open, open it now */
    if (!isAlreadyOpen) {
      targetNode.classList.add('is-open');
    }
  }

  /** Closes all open nodes. Called on outside click or Escape key. */
  function closeAll() {
    nodes.forEach(n => n.classList.remove('is-open'));
  }


  /* ── Event listeners ─────────────────────────────────────────── */

  /* Click: toggle the clicked node */
  nodes.forEach(node => {
    node.addEventListener('click', (e) => {
      /* Stop propagation so the document-level outside-click handler
         doesn't immediately close the popup we just opened. */
      e.stopPropagation();
      toggleNode(node);
    });
  });

  /* Keyboard: Enter or Space activates the focused node */
  nodes.forEach(node => {
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();   /* prevent Space from scrolling the page */
        e.stopPropagation();
        toggleNode(node);
      }
    });
  });

  /* Outside click: clicking anywhere outside a node closes all popups */
  document.addEventListener('click', closeAll);

  /* Escape key: closes all popups regardless of focus position */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

})();
