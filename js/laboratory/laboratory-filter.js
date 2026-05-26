/* ================================================================
   LABORATORY — laboratory-filter.js
   Period filter tabs + paginated card grid.

   How it works:
   - Each .lab-card has a data-period attribute ("midterm" or "finals").
   - Each .lab-filter-tab has a data-period-filter attribute ("all",
     "midterm", or "finals").
   - Clicking a tab sets the active period and resets to page 1.
   - renderPage() slices the visible card list into PAGE_SIZE chunks
     and shows/hides cards using display:none.
   - The pagination buttons advance/retreat the current page.
   ================================================================ */

(function () {
  'use strict';

  /* ── Configuration ───────────────────────────────────────────── */
  const PAGE_SIZE = 4;   /* cards visible per page */

  /* ── Element references ──────────────────────────────────────── */
  const periodTabs = Array.from(document.querySelectorAll('.lab-filter-tab'));
  const allCards   = Array.from(document.querySelectorAll('.lab-card'));
  const prevBtn    = document.getElementById('labPrevBtn');
  const nextBtn    = document.getElementById('labNextBtn');
  const counter    = document.getElementById('labPageCounter');
  const pagination = document.getElementById('labPagination');

  /* Guard: bail if the laboratory section is not on this page */
  if (!periodTabs.length || !allCards.length || !prevBtn || !nextBtn) return;

  /* ── State ───────────────────────────────────────────────────── */
  let activePeriod = 'all';   /* "all" | "midterm" | "finals" */
  let currentPage  = 1;


  /* ================================================================
     RENDER PAGE
     Filters cards by the active period, then shows only the cards
     in the current PAGE_SIZE window. Updates pagination controls.
     ================================================================ */
  function renderPage() {

    /* Build a list of only the cards that match the active period */
    const visibleCards = allCards.filter(card => {
      const period = card.dataset.period || 'midterm';
      return activePeriod === 'all' || period === activePeriod;
    });

    /* Recalculate total pages and clamp currentPage into valid range */
    const totalPages = Math.max(1, Math.ceil(visibleCards.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);

    /* Which cards belong to the current page? */
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageCards  = visibleCards.slice(startIndex, startIndex + PAGE_SIZE);

    /* Show/hide each card */
    allCards.forEach(card => {
      card.style.display = pageCards.includes(card) ? '' : 'none';
    });

    /* Update pagination UI */
    counter.textContent       = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled          = (currentPage === 1);
    nextBtn.disabled          = (currentPage === totalPages);

    /* Hide pagination entirely when everything fits on one page */
    pagination.style.display  = (totalPages <= 1) ? 'none' : '';
  }


  /* ================================================================
     FILTER TAB CLICK
     Marks the clicked tab active, updates activePeriod, resets page.
     ================================================================ */
  periodTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      /* Clear .is-active from all tabs, then set it on the clicked one */
      periodTabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      /* data-period-filter="all" | "midterm" | "finals" */
      activePeriod = tab.dataset.periodFilter;
      currentPage  = 1;
      renderPage();
    });
  });


  /* ================================================================
     PAGINATION BUTTONS
     After changing the page, smooth-scroll back to the section header
     so the user can immediately see the new batch of cards.
     ================================================================ */

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage();
      scrollToLab();
    }
  });

  nextBtn.addEventListener('click', () => {
    currentPage++;
    renderPage();
    scrollToLab();
  });

  /** Scrolls the viewport to the top of the #laboratory section. */
  function scrollToLab() {
    const section = document.getElementById('laboratory');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }


  /* Initial render on page load */
  renderPage();

})();
