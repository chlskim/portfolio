/* ================================================================
   ABOUT — photo-ambience.js
   Draws a slowly drifting low-opacity constellation behind the
   entire right panel (.am-right-panel), foreshadowing the Stellar
   Map section that follows.

   The effect:
   - A fixed set of nodes are distributed across the panel.
   - Each node drifts very slowly in a random direction, bouncing
     softly off the panel edges (they never leave).
   - Pairs of nearby nodes are connected with thin lines, exactly
     like the SVG constellation lines in the stellar map.
   - Opacity is kept very low so the effect reads as texture, not
     clutter — it never competes with the text or photo.
   - Node colours match the stellar-map palette: white, gold
     (#e8c547), and teal (#20c8b4) defined in variables.css.

   The canvas sits at z-index 0 inside .am-right-panel, between
   the grain/atmo layers and the content (z-index 1), so it never
   obstructs text, the photo, or any interactive element.

   Respects prefers-reduced-motion: if opted in, nodes are static
   (no drift) and only the lines and dots are drawn at rest.
   ================================================================ */

(function () {
  'use strict';

  /* ── Guard: the right panel must exist ──────────────────────── */
  const panel = document.querySelector('.am-right-panel');
  if (!panel) return;

  const profileImage = document.querySelector('.am-left-panel__gif');
  const profileFallback = document.querySelector('.am-left-panel__placeholder');

  if (profileImage && profileFallback) {
    profileImage.addEventListener('error', () => {
      profileImage.hidden = true;
      profileFallback.hidden = false;
    }, { once: true });
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ================================================================
     CANVAS SETUP
     Fills the right panel completely. Inserted after the atmospheric
     decoration divs so it layers above grain/atmo (z-index 0) but
     below .am-right-panel__inner (z-index 1).
     ================================================================ */

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = [
    'position:absolute',
    'inset:0',
    'width:100%',
    'height:100%',
    'pointer-events:none',
    'z-index:0',
  ].join(';');

  /* Insert after the last atmospheric decoration div, before __inner */
  const inner = panel.querySelector('.am-right-panel__inner');
  panel.insertBefore(canvas, inner);

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  let animationFrameId = 0;
  let shouldAnimate = false;
  let isRunning = false;

  function resize() {
    W = canvas.width  = panel.offsetWidth;
    H = canvas.height = panel.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();


  /* ================================================================
     NODES
     24 nodes spread across the panel. Each has a position, a very
     slow velocity, and a colour drawn from the stellar-map palette.
     ================================================================ */

  const NODE_COUNT   = 24;
  const MAX_LINK_DST = 0.28;   /* fraction of panel diagonal — links up to this distance */
  const NODE_SPEED   = 0.18;   /* px per frame — very slow drift */

  /* Palette: mostly white, accent gold and teal to echo stellar map */
  const COLOURS = [
    { r: 255, g: 255, b: 255 },   /* white  */
    { r: 255, g: 255, b: 255 },   /* white  (weighted 3×) */
    { r: 255, g: 255, b: 255 },
    { r: 232, g: 197, b:  71 },   /* gold   */
    { r:  32, g: 200, b: 180 },   /* teal   */
  ];

  /**
   * Builds a node at a random position inside the panel with a
   * random slow drift direction.
   */
  function makeNode() {
    const angle  = Math.random() * Math.PI * 2;
    const colour = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    return {
      x:  0.05 + Math.random() * 0.9,   /* normalised 0–1 */
      y:  0.05 + Math.random() * 0.9,
      vx: Math.cos(angle) * NODE_SPEED,
      vy: Math.sin(angle) * NODE_SPEED,
      r:  0.9 + Math.random() * 1.0,    /* dot radius px */
      colour,
    };
  }

  const nodes = Array.from({ length: NODE_COUNT }, makeNode);


  /* ================================================================
     DRAW
     Each frame:
       1. Move nodes (unless reduced motion).
       2. Bounce off edges (position clamped to 2%–98% of panel).
       3. Draw connecting lines between close-enough node pairs.
       4. Draw node dots on top.
     All strokes and fills use very low opacity so the layer reads
     as a subtle, atmospheric texture.
     ================================================================ */

  const LINE_OPACITY = 0.07;    /* constellation line opacity */
  const DOT_OPACITY  = 0.18;    /* node dot opacity           */

  function tick() {

    ctx.clearRect(0, 0, W, H);

    const diagonal = Math.hypot(W, H);
    const maxDist  = diagonal * MAX_LINK_DST;

    /* ── 1 & 2. Move nodes and bounce ──────────────────────── */
    if (!prefersReduced) {
      nodes.forEach(n => {
        n.x += n.vx / W;
        n.y += n.vy / H;

        /* Soft bounce: reverse velocity when the node nears an edge */
        if (n.x < 0.02)  { n.x = 0.02;  n.vx =  Math.abs(n.vx); }
        if (n.x > 0.98)  { n.x = 0.98;  n.vx = -Math.abs(n.vx); }
        if (n.y < 0.02)  { n.y = 0.02;  n.vy =  Math.abs(n.vy); }
        if (n.y > 0.98)  { n.y = 0.98;  n.vy = -Math.abs(n.vy); }
      });
    }

    /* ── 3. Constellation lines ─────────────────────────────── */
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a  = nodes[i];
        const b  = nodes[j];
        const ax = a.x * W, ay = a.y * H;
        const bx = b.x * W, by = b.y * H;
        const dist = Math.hypot(ax - bx, ay - by);

        if (dist > maxDist) continue;

        /* Fade the line out as nodes grow apart */
        const fade = 1 - dist / maxDist;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        /* Use the midpoint colour as a simple blend: white for white pairs,
           gold or teal when either node carries an accent colour */
        const useGold = a.colour.g === 197 || b.colour.g === 197;
        const useTeal = a.colour.g === 200 || b.colour.g === 200;
        const lr = useGold ? 232 : useTeal ? 32  : 255;
        const lg = useGold ? 197 : useTeal ? 200 : 255;
        const lb = useGold ?  71 : useTeal ? 180 : 255;
        ctx.strokeStyle = `rgba(${lr},${lg},${lb},${(LINE_OPACITY * fade).toFixed(3)})`;
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      }
    }

    /* ── 4. Node dots ───────────────────────────────────────── */
    nodes.forEach(n => {
      const { r: cr, g: cg, b: cb } = n.colour;
      ctx.beginPath();
      ctx.arc(n.x * W, n.y * H, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${DOT_OPACITY})`;
      ctx.fill();
    });

    if (isRunning) {
      animationFrameId = requestAnimationFrame(tick);
    }
  }

  function startAnimation() {
    if (isRunning) return;
    isRunning = true;
    resize();
    tick();
  }

  function stopAnimation() {
    isRunning = false;
    cancelAnimationFrame(animationFrameId);
  }

  function syncAnimationState() {
    if (shouldAnimate && !document.hidden) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }

  if (prefersReduced) {
    tick();
    return;
  }

  if ('IntersectionObserver' in window) {
    const panelObserver = new IntersectionObserver(([entry]) => {
      shouldAnimate = entry.isIntersecting;
      syncAnimationState();
    }, { rootMargin: '120px 0px' });

    panelObserver.observe(panel);
  } else {
    shouldAnimate = true;
    syncAnimationState();
  }

  document.addEventListener('visibilitychange', syncAnimationState);

})();
