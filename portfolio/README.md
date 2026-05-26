# Chelsea Resada — Digital Portfolio

A refactored, production-ready frontend portfolio built with vanilla HTML, CSS, and JavaScript. No frameworks. No build tools required.

---

## Project Structure

```
portfolio/
├── index.html                    ← Entry point — all sections live here
├── README.md                     ← You are here
│
├── images/
│   ├── backgrounds/
│   │   └── starrynight.jpg       ← Parallax background (hero + achievements)
│   ├── about/
│   │   ├── chelsea-about.gif     ← Full-height GIF on the About left panel
│   │   └── myphoto.jpg           ← Circular profile photo on the About right panel
│   └── hero/
│       └── card.jpg              ← "My Skills" collection card (hero lower-right)
│
├── css/
│   ├── global/
│   │   ├── variables.css         ← Design tokens (colors, fonts, spacing)
│   │   ├── reset.css             ← Browser normalization
│   │   ├── typography.css        ← Base heading defaults
│   │   └── utilities.css         ← Buttons, section headers, scroll-top, reveal
│   ├── navigation/
│   │   └── navbar.css            ← Fixed nav, hamburger, mobile drawer
│   ├── hero/
│   │   ├── hero-layout.css       ← Panels, giant name, center panel, lower strip
│   │   ├── hero-animations.css   ← Shimmer, ornament spin, ring rotations
│   │   └── hero-responsive.css   ← Breakpoints: 1024px, 768px, 480px
│   ├── about/
│   │   ├── about-layout.css      ← Split panels, image frame, bio, timeline
│   │   └── about-responsive.css  ← Breakpoints: 1024px, 900px, 768px, 480px
│   ├── stellar-map/
│   │   ├── stellar-map-layout.css        ← Stage, star field, legend, mobile cards
│   │   ├── stellar-map-interactions.css  ← Nodes, pulsing rings, popups, variants
│   │   └── stellar-map-responsive.css    ← Breakpoints: 768px, 480px
│   ├── laboratory/
│   │   └── laboratory-layout.css ← Filter tabs, card grid, pagination, responsive
│   ├── achievements/
│   │   └── achievements-layout.css ← Plaque cards, grid, responsive
│   ├── contact/
│   │   └── contact-layout.css    ← Invite card, link rows, form, responsive
│   └── footer/
│       └── footer-layout.css     ← Three-column grid, responsive
│
└── js/
    ├── navigation/
    │   └── navbar.js             ← Scroll observer (.scrolled), mobile menu toggle
    ├── hero/
    │   └── hero-effects.js       ← Shimmer class added after fonts load
    ├── stellar-map/
    │   └── stellar-map-interactions.js ← Node click/keyboard toggle, outside click
    ├── laboratory/
    │   └── laboratory-filter.js  ← Period filter tabs + 4-per-page pagination
    ├── contact/
    │   └── contact-form.js       ← Formspree fetch POST (no page redirect)
    └── scroll/
        └── scroll-utilities.js   ← Scroll-to-top button + [data-reveal] observer
```

---

## Getting Started

1. Open `index.html` in any modern browser — no build step needed.
2. Make sure your images are placed in the correct `images/` subfolders (see structure above).
3. Edit your personal content directly in `index.html`.
4. All design values live in `css/global/variables.css` — change colors, fonts, and spacing in one place and it applies everywhere.

---

## Image Files

| File | Folder | Used In |
|------|--------|---------|
| `starrynight.jpg` | `images/backgrounds/` | Hero parallax background + Achievements section |
| `chelsea-about.gif` | `images/about/` | About section — full-height left panel |
| `myphoto.jpg` | `images/about/` | About section — circular profile photo |
| `card.jpg` | `images/hero/` | Hero section — "My Skills" collection card |

> The GIF has a built-in fallback — if it's missing, the About panel shows a placeholder instead of breaking.

---

## Naming Conventions

| Prefix | Used for |
|--------|----------|
| `nav-` | Navigation bar elements |
| `hero-` | Hero section elements |
| `am-` | About Me section elements |
| `stellar-` | Stellar map (skills constellation) elements |
| `lab-` | Laboratory (activities) section elements |
| `achv-` | Achievements / certificates section |
| `invite-` | Contact / invitation card elements |
| `footer-` | Footer elements |
| `section-` | Shared section primitives (utilities.css) |
| `btn` | Shared button base + modifiers |

---

## JavaScript Overview

| File | What it does |
|------|-------------|
| `js/navigation/navbar.js` | Scroll sentinel → `.scrolled`; hamburger → `.open` |
| `js/hero/hero-effects.js` | Adds shimmer class after `document.fonts.ready` |
| `js/stellar-map/stellar-map-interactions.js` | Click/Escape/outside-click toggles `.is-open` on nodes |
| `js/laboratory/laboratory-filter.js` | Period filter + 4-per-page pagination |
| `js/contact/contact-form.js` | Formspree fetch POST — no page redirect on submit |
| `js/scroll/scroll-utilities.js` | Scroll-top fade + `[data-reveal]` IntersectionObserver |

---

## Customization Tips

- **Colors / fonts / spacing** → `css/global/variables.css`
- **Add a skill node** → copy a `.stellar-node` block in `index.html`, adjust `--nx` and `--ny` percentages
- **Add a lab card** → copy a `.lab-card` block, set `data-period="midterm"` or `data-period="finals"`
- **Add a certificate** → copy an `.achv-plaque` article block
- **Formspree endpoint** → update `action="https://formspree.io/f/YOUR_ID"` on the contact form in `index.html`
