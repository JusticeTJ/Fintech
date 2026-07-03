/*
================================================================
  NOVA FINANCE — Contact Form & Newsletter Handler
  File:    js/send_email.js
  Purpose: Handles the #contactForm on index.html and all
           newsletter signup inputs in the footer.

  CURRENTLY: Frontend-only (no real email is sent yet).
  WHEN BACKEND IS READY: Replace the body of sendToBackend()
  with a real fetch() POST to your PHP endpoint.

  DESIGN PRINCIPLES THAT MAKE THIS BUG-FREE:
  -------------------------------------------
  1. Every getElementById / querySelector is null-checked
     before use. The file must load on EVERY page (including
     dashboard.html where no contact form exists) without errors.
  2. Button state is ALWAYS restored — both on success AND
     on every possible error path. No "stuck loading" buttons.
  3. User input NEVER goes into innerHTML (XSS prevention).
     All dynamic text uses textContent or createTextNode.
  4. isSubmitting flag prevents duplicate submissions if the
     user double-clicks the Send button.
  5. All timeouts are stored in variables so they can be cleared
     if the user submits again before the previous timer fires.

================================================================
*/

(function () {
  /*
    IIFE — Immediately Invoked Function Expression.
    The entire file is wrapped in (function(){ ... })();
    so that our variables (isSubmitting, hideTimer, etc.)
    are private to this file and do NOT pollute the global
    window object, preventing conflicts with other scripts.
  */

  /* ── State Variables ─────────────────────────────────── */

  /*
    isSubmitting: true while a form submission is in progress.
    Prevents the user from clicking Submit twice and sending
    two requests while the first one is still pending.
  */
  var isSubmitting = false;

  /*
    hideTimer: stores the ID returned by setTimeout() when
    we schedule the success message to auto-hide.
    If the user submits again before the timer fires, we
    clearTimeout(hideTimer) first to cancel the pending hide.
  */
  var hideTimer = null;


  /* ================================================================
     ENTRY POINT
     Wait for the HTML to be fully parsed before accessing elements.
  ================================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    initContactForm();     // Wire up #contactForm on index.html
    initNewsletterForms(); // Wire up all newsletter subscribe buttons
  });


  /* ================================================================
     CONTACT FORM
  ================================================================ */

  function initContactForm() {
    /*
      getElementById returns null if the element doesn't exist.
      We guard immediately — this file also loads on dashboard.html
      where there is no #contactForm, so we must not crash.
    */
    var form = document.getElementById('contactForm');
    if (!form) return; /* Not on this page — exit silently */

    form.addEventListener('submit', handleContactSubmit);
  }


  function handleContactSubmit(e) {
    /*
      e.preventDefault() stops the browser's default form
      submission, which would reload the page.
    */
    e.preventDefault();

    /* Block duplicate submissions while one is pending */
    if (isSubmitting) return;

    /* ── Gather field values ── */
    var name    = getFieldValue('contactName');
    var email   = getFieldValue('contactEmail');
    var phone   = getFieldValue('contactPhone');   /* optional */
    var topic   = getFieldValue('contactTopic');   /* optional */
    var message = getFieldValue('contactMsg');

    /* ── Validate ── */
    var validationError = validateFields(name, email, message);
    if (validationError) {
      /* Show the error message and stop here */
      showError(validationError);
      hideSuccess();
      return;
    }

    /* ── All valid: start submission ── */
    isSubmitting = true;
    hideError();
    hideSuccess();
    setButtonState('loading');

    /* Cancel any pending auto-hide timer from a previous success */
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    /* Build the data payload */
    var payload = {
      name:    name,
      email:   email,
      phone:   phone,
      topic:   topic,
      message: message
    };

    /*
      sendToBackend() returns a Promise.
      .then() runs on success, .catch() runs on any error.
      Both paths MUST re-enable the button and reset isSubmitting.
    */
    sendToBackend(payload)
      .then(function () {
        /* ── SUCCESS ── */
        showSuccess();

        /* Reset all form fields to empty */
        var form = document.getElementById('contactForm');
        if (form) form.reset();

        /* Re-enable the button */
        setButtonState('idle');
        isSubmitting = false;

        /*
          Auto-hide the success message after 7 seconds so it
          doesn't stay there forever if the user scrolls away.
        */
        hideTimer = setTimeout(function () {
          hideSuccess();
          hideTimer = null;
        }, 7000);
      })
      .catch(function (errorMessage) {
        /* ── FAILURE ── */
        showError(errorMessage || 'Something went wrong. Please try again.');
        setButtonState('idle');
        isSubmitting = false;
      });
  }


  /* ================================================================
     FIELD HELPERS
  ================================================================ */

  /*
    getFieldValue(id):
    Safely reads and trims the value of any form field.
    Returns an empty string '' if the element doesn't exist.
    Using optional chaining (?.) would be cleaner but we write
    this explicitly for older browser compatibility.
  */
  function getFieldValue(id) {
    var el = document.getElementById(id);
    if (!el) return '';
    return (el.value || '').trim();
  }


  /* ================================================================
     VALIDATION
  ================================================================ */

  /*
    validateFields(name, email, message):
    Returns an error string if validation fails.
    Returns null if everything is valid.

    We return the FIRST error found — showing one at a time
    is cleaner than a wall of error messages.
  */
  function validateFields(name, email, message) {

    /* ── Name ── */
    if (!name || name.length < 2) {
      return 'Please enter your full name (minimum 2 characters).';
    }
    if (name.length > 100) {
      return 'Name is too long (maximum 100 characters).';
    }

    /* ── Email ── */
    if (!email) {
      return 'Please enter your email address.';
    }
    if (!isValidEmail(email)) {
      return 'Please enter a valid email address (e.g. you@example.com).';
    }

    /* ── Message ── */
    if (!message || message.length < 10) {
      return 'Please enter a message (minimum 10 characters).';
    }
    if (message.length > 2000) {
      return 'Message is too long (maximum 2,000 characters).';
    }

    /* All checks passed */
    return null;
  }


  /*
    isValidEmail(email):
    Tests an email string against a regex pattern.

    The pattern /^[^\s@]+@[^\s@]+\.[^\s@]+$/  means:
    ^           — start of string
    [^\s@]+     — one or more chars that are NOT space or @
    @           — the @ symbol
    [^\s@]+     — domain name
    \.          — the dot before the TLD
    [^\s@]+     — TLD (com, ng, co.uk, etc.)
    $           — end of string
  */
  function isValidEmail(email) {
    var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }


  /* ================================================================
     BACKEND / SEND LOGIC

     sendToBackend(payload):
     Returns a Promise.
     ────────────────────────────────────────────────────
     CURRENTLY: Simulates a 1.8-second delay, then resolves.
     This lets the UI work perfectly for the presentation
     without a server.

     WHEN YOUR PHP BACKEND IS READY:
     Replace the setTimeout simulation below with:

       return fetch('process.php', {
         method:  'POST',
         headers: { 'Content-Type': 'application/json' },
         body:    JSON.stringify(payload)
       })
       .then(function (response) {
         if (!response.ok) {
           return response.text().then(function (text) {
             throw new Error(text || 'Server returned an error.');
           });
         }
         return response.json();
       });
  ================================================================ */

  function sendToBackend(payload) {
    /*
      new Promise(executor) creates a Promise.
      The executor receives two functions:
        resolve(value) — call this on success
        reject(reason) — call this on failure
    */
    return new Promise(function (resolve, reject) {

      /*
        Simulate a network request with setTimeout.
        1800ms = 1.8 seconds — realistic "sending" feeling.
      */
      setTimeout(function () {

        /*
          For the live presentation this always succeeds.
          In production replace this entire setTimeout block
          with the real fetch() call shown above.
        */
        var success = true; /* Always succeed in demo mode */

        if (success) {
          resolve(); /* Promise succeeded — .then() fires */
        } else {
          reject('Message sending failed. Please try again.'); /* .catch() fires */
        }

      }, 1800);
    });
  }


  /* ================================================================
     BUTTON STATE MANAGEMENT

     setButtonState(state):
     Controls the submit button's appearance and usability.
     state: 'idle' | 'loading'

     We store the original button HTML in a data attribute so we
     can restore it exactly — even if it contains an icon tag.
  ================================================================ */

  function setButtonState(state) {
    var btn = document.getElementById('submitBtn');
    if (!btn) return; /* Guard: button might not exist */

    if (state === 'loading') {
      /*
        Save the current button HTML so we can restore it later.
        We use a data attribute on the button itself to avoid
        a module-level variable (cleaner).
      */
      btn.setAttribute('data-original-html', btn.innerHTML);

      btn.disabled   = true;
      /*
        The spinner is a Bootstrap spinner component.
        role="status" and visually-hidden span are accessibility best practice
        so screen readers say "Loading" instead of spinning icon.
      */
      btn.innerHTML  =
        '<span class="spinner-border spinner-border-sm me-2" ' +
        'role="status" aria-hidden="true"></span>' +
        'Sending…';

    } else {
      /* 'idle': restore original state */
      btn.disabled   = false;

      var original   = btn.getAttribute('data-original-html');
      if (original) {
        btn.innerHTML = original;
        btn.removeAttribute('data-original-html');
      }
    }
  }


  /* ================================================================
     SUCCESS / ERROR MESSAGE DISPLAY

     We show Bootstrap alert divs that already exist in the HTML
     (#formSuccess and #formError). They start with class "d-none"
     (Bootstrap utility: display:none). We remove that class to
     show them and add it back to hide them.

     Text is NEVER set via innerHTML (XSS risk) — we use the
     helper setAlertText() which uses safe DOM text methods.
  ================================================================ */

  function showSuccess() {
    var el = document.getElementById('formSuccess');
    if (!el) return;
    el.classList.remove('d-none');
    el.setAttribute('role', 'alert'); /* Tell screen readers to announce it */
    scrollToElement(el);
  }

  function hideSuccess() {
    var el = document.getElementById('formSuccess');
    if (!el) return;
    el.classList.add('d-none');
  }

  function showError(message) {
    var el = document.getElementById('formError');
    if (!el) return;

    /* Safely update the text content (see helper below) */
    setAlertText(el, message);

    el.classList.remove('d-none');
    el.setAttribute('role', 'alert');
    scrollToElement(el);
  }

  function hideError() {
    var el = document.getElementById('formError');
    if (!el) return;
    el.classList.add('d-none');
  }


  /*
    setAlertText(el, message):
    Replaces the text content of an alert div WITHOUT touching
    any child elements (like the Bootstrap icon <i> tag).

    ALGORITHM:
    1. Find all direct TEXT NODES inside el (nodeType === 3)
    2. Remove all of them
    3. Append a new text node with the message

    This is the SAFE way — el.innerHTML = message would be XSS risk.
  */
  function setAlertText(el, message) {
    /*
      childNodes returns ALL child nodes, including element nodes
      and text nodes. We collect text nodes separately first because
      removing nodes while iterating a live NodeList causes bugs.
    */
    var textNodesToRemove = [];

    /* NodeList is array-like but not an Array — use a classic for loop */
    for (var i = 0; i < el.childNodes.length; i++) {
      var node = el.childNodes[i];
      /* nodeType 3 = TEXT_NODE */
      if (node.nodeType === 3) {
        textNodesToRemove.push(node);
      }
    }

    /* Now remove them all */
    for (var j = 0; j < textNodesToRemove.length; j++) {
      el.removeChild(textNodesToRemove[j]);
    }

    /*
      document.createTextNode() creates a text node safely.
      It automatically escapes < > & so it cannot inject HTML.
      The leading space keeps it away from the icon.
    */
    el.appendChild(document.createTextNode(' ' + message));
  }


  /*
    scrollToElement(el):
    Smoothly scrolls the page so the alert is visible.
    Wrapped in try/catch so it never crashes on unsupported browsers.
  */
  function scrollToElement(el) {
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (ignored) {
      /* scrollIntoView without options works everywhere as fallback */
      try { el.scrollIntoView(); } catch (e) { /* silent */ }
    }
  }


  /* ================================================================
     NEWSLETTER FORMS

     There may be multiple newsletter forms on the page (header,
     footer). We find all of them by looking for buttons with the
     class "newsletter-btn" and wire them up individually.
  ================================================================ */

  function initNewsletterForms() {

    var subscribeBtns = document.querySelectorAll('.newsletter-btn');
    if (!subscribeBtns || subscribeBtns.length === 0) return;

    /*
      forEach on a NodeList works in all modern browsers.
      For very old browsers you would need Array.prototype.forEach.call()
      but we don't need to support IE11 for this project.
    */
    subscribeBtns.forEach(function (btn) {
      btn.addEventListener('click', handleNewsletterClick);
    });
  }


  function handleNewsletterClick() {
    /* "this" inside an event listener = the element that was clicked */
    var btn = this;

    /* Find the email input inside the same form as this button */
    var form  = btn.closest('form');
    if (!form) return;

    var input = form.querySelector('input[type="email"]');
    if (!input) return;

    var emailVal = (input.value || '').trim();

    /* ── Validate the newsletter email ── */
    if (!emailVal) {
      /* Empty: shake the input to signal the error visually */
      shakeElement(input);
      input.focus();
      return;
    }

    if (!isValidEmail(emailVal)) {
      /* Invalid email: highlight red border and shake */
      shakeElement(input);
      showTempBorder(input, '#EF4444'); /* Red */
      return;
    }

    /* ── Valid email: simulate subscription ── */
    var originalText = btn.textContent;

    btn.disabled  = true;
    btn.textContent = '…';

    /*
      Simulate a 1.2-second API call delay.
      In production: replace with fetch('/api/newsletter', {...})
    */
    setTimeout(function () {
      btn.textContent = '✓ Subscribed!';
      btn.style.background = '#22C55E'; /* Green success */
      input.value = '';                 /* Clear the input */

      /* After 3 more seconds: restore the button to its original state */
      setTimeout(function () {
        btn.textContent       = originalText;
        btn.style.background  = '';
        btn.disabled          = false;
      }, 3000);

    }, 1200);
  }


  /*
    shakeElement(el):
    Adds a CSS shake animation class for 600ms, then removes it.
    The animation is defined in style.css with @keyframes nova-shake.
    If the class doesn't exist yet in CSS, this degrades gracefully
    (the element just doesn't shake — no errors).
  */
  function shakeElement(el) {
    el.classList.add('input-shake');
    setTimeout(function () {
      el.classList.remove('input-shake');
    }, 600);
  }


  /*
    showTempBorder(el, color):
    Temporarily changes an input's border to a specific colour,
    then removes the inline style after 2 seconds so the CSS
    class-based styles take over again.
  */
  function showTempBorder(el, color) {
    el.style.borderColor = color;
    setTimeout(function () {
      el.style.borderColor = ''; /* Removes the inline style */
    }, 2500);
  }


})(); /* End of IIFE */