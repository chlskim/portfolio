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


  /* ================================================================
     SHOOTING STARS
     A canvas overlays the stage and renders randomised streaks at
     staggered intervals to evoke meteor activity across the map.

     Each star is spawned at a random point along the top or left
     edge and travels diagonally toward the bottom-right at a slight
     angle variation. It fades in at the head and fades out as it
     dissipates, matching the colour palette of the existing field
     (white, gold, and teal accents defined in the layout CSS).
     ================================================================ */

  const canvas = document.querySelector('.stellar-map__shooting-stars');
  const stage  = document.getElementById('stellarStage');

  if (canvas && stage) {
    const ctx = canvas.getContext('2d');

    /* Active star objects — each tick updates their progress */
    const activeStars = [];

    /* Palette pulled from the existing star field — white, gold, teal */
    const STAR_COLOURS = [
      'rgba(255,255,255,',   /* white — most common */
      'rgba(232,197,71,',    /* gold  — matches accent-primary */
      'rgba(32,200,180,',    /* teal  — matches the teal accent dots */
    ];

    /**
     * Resize the canvas to match the stage's rendered pixel dimensions.
     * Called on load and whenever the window resizes.
     */
    function resizeCanvas() {
      const rect = stage.getBoundingClientRect();
      canvas.width  = rect.width;
      canvas.height = rect.height;
    }

    /**
     * Spawns a new shooting star with randomised start position,
     * angle, speed, length, and colour.
     */
    function spawnStar() {
      /* Start near the top or left edge so the streak travels across */
      const spawnEdge = Math.random() < 0.65 ? 'top' : 'left';
      const x = spawnEdge === 'top'
        ? Math.random() * canvas.width
        : Math.random() * canvas.width * 0.25;
      const y = spawnEdge === 'top'
        ? Math.random() * canvas.height * 0.35
        : Math.random() * canvas.height * 0.5;

      /* Angle: mostly down-right, with ±15° variation */
      const angleDeg = 30 + (Math.random() * 30);
      const angleRad = (angleDeg * Math.PI) / 180;

      const colour = STAR_COLOURS[Math.floor(Math.random() * STAR_COLOURS.length)];
      const length = 60 + Math.random() * 90;   /* streak length in px */
      const speed  = 3.5 + Math.random() * 3;   /* px per frame         */

      activeStars.push({
        x, y,
        dx: Math.cos(angleRad) * speed,
        dy: Math.sin(angleRad) * speed,
        speed,
        length,
        colour,
        progress: 0,          /* 0 → 1 over the star's lifetime */
        maxDist: length * 2,  /* total travel distance           */
        dist: 0,              /* distance covered so far         */
      });
    }

    /**
     * Draws a single shooting-star streak.
     * The head is fully opaque; the tail fades to transparent.
     * Opacity also ramps in at birth and out at death so streaks
     * don't pop in or vanish abruptly.
     */
    function drawStar(star) {
      const lifeFade = Math.sin(star.progress * Math.PI); /* 0→1→0 arc */

      const tailX = star.x - star.dx * (star.length / star.speed || 10);
      const tailY = star.y - star.dy * (star.length / star.speed || 10);

      const grad = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
      grad.addColorStop(0, star.colour + '0)');
      grad.addColorStop(1, star.colour + (0.9 * lifeFade).toFixed(3) + ')');

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(star.x, star.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.5;
      ctx.lineCap     = 'round';
      ctx.stroke();

      /* Bright head dot */
      ctx.beginPath();
      ctx.arc(star.x, star.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = star.colour + (lifeFade * 0.95).toFixed(3) + ')';
      ctx.fill();
    }

    /**
     * Main animation loop — clears the canvas each frame, updates
     * star positions, draws them, and removes finished streaks.
     */
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = activeStars.length - 1; i >= 0; i--) {
        const s = activeStars[i];

        s.x    += s.dx;
        s.y    += s.dy;
        s.dist += Math.hypot(s.dx, s.dy);
        s.progress = Math.min(s.dist / s.maxDist, 1);

        drawStar(s);

        /* Remove once the star has travelled its full distance or left the canvas */
        if (s.dist >= s.maxDist || s.x > canvas.width || s.y > canvas.height) {
          activeStars.splice(i, 1);
        }
      }

      requestAnimationFrame(tick);
    }

    /**
     * Schedules the next star spawn with a randomised delay so
     * streaks appear organically, not in a mechanical rhythm.
     */
    function scheduleNextStar() {
      const delay = 1800 + Math.random() * 3200; /* 1.8 – 5 s between stars */
      setTimeout(() => {
        spawnStar();
        scheduleNextStar();
      }, delay);
    }

    /* Initialise */
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    /* Stagger the first two bursts so the map feels lively quickly */
    setTimeout(spawnStar, 600);
    setTimeout(spawnStar, 2200);
    scheduleNextStar();

    tick();
  }

})();
