/* ================================================================
   CONTACT — card-ambience.js
   Adds a layer of floating ambient particles around the .invite-card
   to give the "Reach Across the Stars" card a living, celestial feel.

   Two effects run on a single canvas that fills the contact section:

     1. FLOAT MOTES — small gold, teal, and white particles that drift
        upward around the edges of the card, fading in from the card
        border and dissolving before they travel too far. They spawn
        only in a band close to the card, keeping the effect intimate.

     2. CORNER GLIMMERS — periodic bursts of 3–5 tiny sparks that
        erupt from each of the four card corners, echoing the ornamental
        bracket lines already styled in CSS. Each glimmer fires from a
        random corner every 2–4 seconds.

   The canvas is inserted as the first child of .contact (the section),
   positioned absolute so it underlays the card. z-index is kept below
   the card's own stacking context.

   Respects prefers-reduced-motion: animation halts if the user prefers
   reduced motion, leaving the static card untouched.
   ================================================================ */

(function () {
  'use strict';

  /* ── Guard: requires the contact section and invite card ─────── */
  const section = document.querySelector('.contact');
  const card    = document.querySelector('.invite-card');
  if (!section || !card) return;

  /* Respect the user's motion preference */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;


  /* ================================================================
     CANVAS SETUP
     Fills the entire contact section so particles have room above
     and below the card. Stays below the card via z-index.
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

  section.insertBefore(canvas, section.firstChild);

  const ctx = canvas.getContext('2d');

  /* Track canvas dimensions — updated on resize */
  let W = 0, H = 0;
  /* Card bounding box relative to the section — updated on resize */
  let cardRect = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };

  /**
   * Measures the canvas and card geometry.
   * Called on load and whenever the window resizes.
   */
  function measure() {
    const sectionBox = section.getBoundingClientRect();
    const cardBox    = card.getBoundingClientRect();

    W = canvas.width  = sectionBox.width;
    H = canvas.height = sectionBox.height;

    /* Card position relative to the section element */
    const scrollTop  = window.scrollY || window.pageYOffset;
    const sectionTop = sectionBox.top + scrollTop;
    const cardTop    = cardBox.top    + scrollTop;

    cardRect = {
      left:   cardBox.left   - sectionBox.left,
      top:    cardTop        - sectionTop,
      right:  cardBox.right  - sectionBox.left,
      bottom: cardTop        - sectionTop + cardBox.height,
      width:  cardBox.width,
      height: cardBox.height,
    };
  }

  window.addEventListener('resize', measure);
  /* Defer first measure until layout is stable */
  requestAnimationFrame(measure);


  /* ── Design-token palette (mirrors variables.css) ─────────────── */
  const GOLD  = 'rgba(232,197,71,';
  const WHITE = 'rgba(255,255,255,';
  const TEAL  = 'rgba(32,200,180,';

  const MOTE_COLOURS = [GOLD, GOLD, GOLD, TEAL, WHITE];  /* gold weighted */


  /* ================================================================
     1. FLOAT MOTES
     Spawn within a 60px band around the card border, drift upward,
     and dissolve. The band keeps them visually tied to the card.
     ================================================================ */

  const motes    = [];
  const MAX_MOTES = 22;
  const BAND      = 60;   /* px outside card edge where motes can spawn */

  /**
   * Returns a random spawn point inside the border-band around the card.
   * Points are distributed across all four card sides.
   */
  function moteSpawnPoint() {
    const side = Math.floor(Math.random() * 4);  /* 0=top 1=right 2=bottom 3=left */
    let x, y;
    switch (side) {
      case 0: /* top */
        x = cardRect.left  + Math.random() * cardRect.width;
        y = cardRect.top   - Math.random() * BAND;
        break;
      case 1: /* right */
        x = cardRect.right + Math.random() * BAND;
        y = cardRect.top   + Math.random() * cardRect.height;
        break;
      case 2: /* bottom */
        x = cardRect.left  + Math.random() * cardRect.width;
        y = cardRect.bottom + Math.random() * BAND * 0.5;
        break;
      default: /* left */
        x = cardRect.left  - Math.random() * BAND;
        y = cardRect.top   + Math.random() * cardRect.height;
        break;
    }
    return { x, y };
  }

  function spawnMote() {
    if (motes.length >= MAX_MOTES || !cardRect.width) return;
    const { x, y } = moteSpawnPoint();
    motes.push({
      x, y,
      dx:      (Math.random() - 0.5) * 0.35,
      dy:      -(0.3 + Math.random() * 0.5),   /* drift upward */
      r:       0.7 + Math.random() * 1.4,
      colour:  MOTE_COLOURS[Math.floor(Math.random() * MOTE_COLOURS.length)],
      life:    0,
      maxLife: 90 + Math.random() * 80,
    });
  }

  function drawMotes() {
    /* Spawn a new mote occasionally each frame */
    if (Math.random() < 0.14) spawnMote();

    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i];
      m.x    += m.dx + (Math.random() - 0.5) * 0.08;   /* gentle sway */
      m.y    += m.dy;
      m.life += 1;

      const progress = m.life / m.maxLife;
      /* Ease in over first 15%, hold, ease out over last 35% */
      const opacity  = progress < 0.15
        ? progress / 0.15
        : progress > 0.65
          ? 1 - (progress - 0.65) / 0.35
          : 1;

      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fillStyle = m.colour + (opacity * 0.75).toFixed(3) + ')';
      ctx.fill();

      if (m.life >= m.maxLife) motes.splice(i, 1);
    }
  }


  /* ================================================================
     2. CORNER GLIMMERS
     Each glimmer is a micro-burst of 3–5 sparks that shoot outward
     from a card corner at shallow angles, quickly fading out.
     A new glimmer fires from a random corner every 2–4 seconds.
     ================================================================ */

  const glimmerSparks = [];

  /**
   * Returns the canvas-space coordinates of each card corner.
   * @returns {Array<{x:number, y:number, outDeg:number}>}
   *   outDeg is the base angle (degrees) sparks fly outward.
   */
  function cornerPoints() {
    return [
      { x: cardRect.left,  y: cardRect.top,    outDeg: 225 },  /* TL → up-left  */
      { x: cardRect.right, y: cardRect.top,    outDeg: 315 },  /* TR → up-right */
      { x: cardRect.left,  y: cardRect.bottom, outDeg: 135 },  /* BL → dn-left  */
      { x: cardRect.right, y: cardRect.bottom, outDeg:  45 },  /* BR → dn-right */
    ];
  }

  /**
   * Emits a small burst of sparks from a random card corner.
   */
  function emitCornerGlimmer() {
    if (!cardRect.width) return;

    const corners  = cornerPoints();
    const corner   = corners[Math.floor(Math.random() * corners.length)];
    const count    = 3 + Math.floor(Math.random() * 3);    /* 3–5 sparks */
    const baseRad  = (corner.outDeg * Math.PI) / 180;
    const spread   = Math.PI / 5;                           /* ±36° spread */

    for (let i = 0; i < count; i++) {
      const angle   = baseRad + (Math.random() - 0.5) * spread * 2;
      const speed   = 1.0 + Math.random() * 1.6;
      glimmerSparks.push({
        x:       corner.x,
        y:       corner.y,
        dx:      Math.cos(angle) * speed,
        dy:      Math.sin(angle) * speed,
        r:       0.8 + Math.random() * 1.0,
        colour:  Math.random() < 0.7 ? GOLD : WHITE,
        life:    0,
        maxLife: 35 + Math.floor(Math.random() * 25),
      });
    }
  }

  function drawGlimmerSparks() {
    for (let i = glimmerSparks.length - 1; i >= 0; i--) {
      const s = glimmerSparks[i];
      s.x    += s.dx;
      s.y    += s.dy;
      s.dx   *= 0.97;   /* gentle deceleration */
      s.dy   *= 0.97;
      s.life += 1;

      const opacity = 1 - s.life / s.maxLife;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.colour + (opacity * 0.9).toFixed(3) + ')';
      ctx.fill();

      if (s.life >= s.maxLife) glimmerSparks.splice(i, 1);
    }
  }

  /* Schedule glimmers at randomised intervals so they feel organic */
  function scheduleGlimmer() {
    const delay = 2000 + Math.random() * 2000;
    setTimeout(() => {
      emitCornerGlimmer();
      scheduleGlimmer();
    }, delay);
  }

  /* Fire the first glimmer after a short settling delay */
  setTimeout(() => {
    emitCornerGlimmer();
    scheduleGlimmer();
  }, 1200);


  /* ================================================================
     ANIMATION LOOP
     Clears and redraws both layers every frame.
     ================================================================ */

  function tick() {
    ctx.clearRect(0, 0, W, H);
    drawMotes();
    drawGlimmerSparks();
    requestAnimationFrame(tick);
  }

  tick();

})();
