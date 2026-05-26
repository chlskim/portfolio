/* ================================================================
   CONTACT — contact-form.js
   Handles the Formspree contact form submission in-page via
   the Fetch API so visitors stay on the portfolio after sending.

   Flow:
   1. User submits the form.
   2. Default HTML form submission is prevented (e.preventDefault).
   3. The button is disabled and its text changes to "Sending…"
      to give immediate visual feedback.
   4. fetch() POSTs form data to the Formspree endpoint.
   5. On success: form is cleared and the success message appears.
      On failure: the error message appears instead.
   6. Button is always re-enabled in the finally block.
   ================================================================ */

(function () {
  'use strict';

  /* ── Element references ──────────────────────────────────────── */
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('contactSubmitBtn');
  const btnText    = document.getElementById('contactBtnText');
  const successMsg = document.getElementById('contactSuccess');
  const errorMsg   = document.getElementById('contactError');

  /* Guard: bail if the contact form is not on this page */
  if (!form || !submitBtn || !btnText || !successMsg || !errorMsg) return;

  const formEndpoint = new URL(form.action);


  /* ── Form submission handler ─────────────────────────────────── */
  form.addEventListener('submit', (e) => {
    /* Prevent the default browser redirect to Formspree's thank-you page */
    e.preventDefault();

    /* Reset any previously shown status messages */
    successMsg.style.display = 'none';
    errorMsg.style.display   = 'none';

    /* Disable the button and show loading state */
    submitBtn.disabled    = true;
    btnText.textContent   = 'Sending…';

    /* POST the form data to the Formspree endpoint */
    if (formEndpoint.protocol !== 'https:' || formEndpoint.hostname !== 'formspree.io') {
      errorMsg.style.display = 'block';
      submitBtn.disabled  = false;
      btnText.textContent = 'Send Message';
      return;
    }

    fetch(formEndpoint.href, {
      method : 'POST',
      body   : new FormData(form),
      headers: { 'Accept': 'application/json' },
      credentials: 'omit'
    })
    .then(response => {
      if (response.ok) {
        /* Success — show confirmation and clear all fields */
        successMsg.style.display = 'block';
        form.reset();
      } else {
        /* Server returned a non-2xx status (e.g. 422 validation error) */
        errorMsg.style.display = 'block';
      }
    })
    .catch(() => {
      /* Network failure (offline, DNS error, etc.) */
      errorMsg.style.display = 'block';
    })
    .finally(() => {
      /* Always re-enable the button, even if something went wrong */
      submitBtn.disabled  = false;
      btnText.textContent = 'Send Message';
    });
  });

})();
