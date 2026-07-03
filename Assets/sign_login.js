/*
================================================================
  NOVA FINANCE — Auth Pages JavaScript
  File:    js/auth.js
  Pages:   pages/signup.html  |  pages/login.html

  HOW IT WORKS:
  When the page loads (DOMContentLoaded fires), this script
  checks which form exists in the DOM.
  - If #signupForm exists → runs signup logic
  - If #loginForm  exists → runs login logic
  - If neither exists    → does nothing (no errors)

  IDs THIS FILE EXPECTS IN THE HTML:
  ────────────────────────────────────
  SIGNUP PAGE:
    #signupForm       — the <form> element
    #firstName        — first name input
    #lastName         — last name input
    #signupEmail      — email input
    #signupPassword   — password input
    #agreeTerms       — checkbox
    #eyeToggle        — eye button (password field)
    #eyeIcon          — <svg> inside the eye button
    #signupBtn        — submit button
    #signupSuccess    — success alert div
    #signupError      — error alert div
    #err-firstName    — first name error span
    #err-lastName     — last name error span
    #err-signupEmail  — email error span
    #err-signupPassword — password error span
    #err-agreeTerms   — checkbox error span

  LOGIN PAGE:
    #loginForm        — the <form> element
    #loginEmail       — email input
    #loginPassword    — password input
    #rememberMe       — remember me checkbox
    #loginEyeToggle   — eye button
    #loginEyeIcon     — <svg> inside the eye button
    #loginBtn         — submit button
    #loginSuccess     — success alert div
    #loginError       — error alert div
    #err-loginEmail   — email error span
    #err-loginPassword — password error span
================================================================
*/


/* ── IIFE (Immediately Invoked Function Expression) ───────────
   Wrapping the whole file in (function(){ ... })() creates a
   private scope. Variables declared inside cannot be accessed
   or accidentally overwritten by other scripts on the page.
   Think of it as a sealed room for this script's code.
─────────────────────────────────────────────────────────────── */
(function () {

  /*
    isSubmitting: a flag that tracks whether a form submit
    is currently in progress. If the user clicks the button
    twice, the second click is ignored because isSubmitting
    is already true. Prevents duplicate submissions.
  */
  var isSubmitting = false;


  /* ── Entry Point ─────────────────────────────────────────────
     DOMContentLoaded fires once the browser has finished parsing
     all the HTML. We must wait for this before we can safely
     call getElementById — if we didn't wait, the elements
     wouldn't exist in the DOM yet.
  ─────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {

    /* Check which page we're on and run the right initialiser */
    if (document.getElementById('signupForm')) {
      initSignup(); /* We are on the signup page */
    }

    if (document.getElementById('loginForm')) {
      initLogin();  /* We are on the login page */
    }

    /* If neither form exists, we do nothing. No errors. */
  });


  /* ================================================================
     SIGNUP PAGE
  ================================================================ */

  function initSignup() {

    /* ── Wire up the password eye toggle ── */
    initEyeToggle('signupPassword', 'eyeToggle', 'eyeIcon');

    /* ── Wire up the form submit event ── */
    var form = document.getElementById('signupForm');

    /*
      Guard clause: if getElementById returns null (element
      not found in the DOM), we stop the function immediately.
      This prevents "Cannot read properties of null" errors.
    */
    if (!form) { return; }

    form.addEventListener('submit', function (e) {
      /*
        e.preventDefault() stops the browser's default behaviour
        of reloading the page when a form is submitted.
        Without this, the page would refresh and we'd lose the data.
      */
      e.preventDefault();

      /* Block if already submitting */
      if (isSubmitting) { return; }

      /* ── Read all field values ── */
      var firstName = getVal('firstName');
      var lastName  = getVal('lastName');
      var email     = getVal('signupEmail');
      var password  = getVal('signupPassword');
      var agreed    = getChecked('agreeTerms');

      /* ── Clear any previous errors before validating again ── */
      clearAllErrors(['firstName','lastName','signupEmail','signupPassword','agreeTerms']);
      hideAlert('signupSuccess');
      hideAlert('signupError');

      /* ── Validate each field — stop if any fail ── */
      var isValid = true;

      /* First name: must not be empty and at least 2 chars */
      if (!firstName || firstName.length < 2) {
        showFieldError('firstName', 'Please enter your first name.');
        isValid = false;
      }

      /* Last name: same rule */
      if (!lastName || lastName.length < 2) {
        showFieldError('lastName', 'Please enter your last name.');
        isValid = false;
      }

      /* Email: must look like an email address */
      if (!email) {
        showFieldError('signupEmail', 'Please enter your email address.');
        isValid = false;
      } else if (!isValidEmail(email)) {
        showFieldError('signupEmail', 'Please enter a valid email (e.g. you@example.com).');
        isValid = false;
      }

      /* Password: at least 8 chars, one uppercase, one number */
      if (!password) {
        showFieldError('signupPassword', 'Please create a password.');
        isValid = false;
      } else if (password.length < 8) {
        showFieldError('signupPassword', 'Password must be at least 8 characters.');
        isValid = false;
      } else if (!/[A-Z]/.test(password)) {
        /*
          /[A-Z]/ is a Regular Expression (regex).
          .test(string) returns true if the pattern is found.
          [A-Z] matches any uppercase letter A through Z.
        */
        showFieldError('signupPassword', 'Password must include at least one uppercase letter.');
        isValid = false;
      } else if (!/[0-9]/.test(password)) {
        /* [0-9] matches any digit 0 through 9 */
        showFieldError('signupPassword', 'Password must include at least one number.');
        isValid = false;
      }

      /* Terms checkbox: must be checked */
      if (!agreed) {
        showFieldError('agreeTerms', 'You must agree to the Terms and Privacy Policy.');
        isValid = false;
      }

      /* If any field failed validation, stop here */
      if (!isValid) { return; }

      /* ── All valid: submit ── */
      isSubmitting = true;
      setButtonLoading('signupBtn', true);

      /*
        Simulated API call using setTimeout.
        In production, replace this with:
          fetch('/api/register', { method:'POST', body:... })
            .then(...).catch(...)
        We use 1800ms (1.8 seconds) to feel realistic.
      */
      setTimeout(function () {

        /* ── Success ── */
        showAlert('signupSuccess',
          '✓ Account created! Welcome to Nova Finance. Redirecting to your dashboard…');

        /* After 1.5 seconds, redirect to the dashboard */
        setTimeout(function () {
          window.location.href = 'dashboard.html';
        }, 1500);

        /* Note: we don't re-enable the button because the page
           is about to navigate away anyway */

      }, 1800);

    }); /* end form submit listener */

    /* ── Auto-clear field errors when user starts typing ── */
    autoClearErrors(['firstName','lastName','signupEmail','signupPassword']);

    /* ── Also clear terms error when checkbox is changed ── */
    var termsBox = document.getElementById('agreeTerms');
    if (termsBox) {
      termsBox.addEventListener('change', function () {
        clearFieldError('agreeTerms');
      });
    }

  } /* end initSignup */


  /* ================================================================
     LOGIN PAGE
  ================================================================ */

  function initLogin() {

    /* ── Wire up the password eye toggle ── */
    initEyeToggle('loginPassword', 'loginEyeToggle', 'loginEyeIcon');

    /* ── Restore remembered email if user had "remember me" on ── */
    restoreRememberedEmail();

    /* ── Wire up the form submit event ── */
    var form = document.getElementById('loginForm');
    if (!form) { return; } /* Guard */

    form.addEventListener('submit', function (e) {
      e.preventDefault(); /* Prevent page reload */

      if (isSubmitting) { return; } /* Block duplicate clicks */

      /* ── Read values ── */
      var email    = getVal('loginEmail');
      var password = getVal('loginPassword');
      var remember = getChecked('rememberMe');

      /* ── Clear previous errors ── */
      clearAllErrors(['loginEmail', 'loginPassword']);
      hideAlert('loginSuccess');
      hideAlert('loginError');

      /* ── Validate ── */
      var isValid = true;

      if (!email) {
        showFieldError('loginEmail', 'Please enter your email address.');
        isValid = false;
      } else if (!isValidEmail(email)) {
        showFieldError('loginEmail', 'Please enter a valid email address.');
        isValid = false;
      }

      if (!password) {
        showFieldError('loginPassword', 'Please enter your password.');
        isValid = false;
      } else if (password.length < 6) {
        showFieldError('loginPassword', 'Password must be at least 6 characters.');
        isValid = false;
      }

      if (!isValid) { return; }

      /* ── Handle remember me ── */
      if (remember) {
        /*
          localStorage stores data in the browser that persists
          even after the tab is closed. The key is 'novaEmail'
          and the value is the user's email address.
        */
        localStorage.setItem('novaEmail', email);
      } else {
        /* Remove any previously saved email */
        localStorage.removeItem('novaEmail');
      }

      /* ── Submit ── */
      isSubmitting = true;
      setButtonLoading('loginBtn', true);

      /* Simulated login request — replace with real fetch() */
      setTimeout(function () {

        /* ── Save authentication state ── */
        sessionStorage.setItem('nova_auth', 'true');

        /* ── Success ── */
        showAlert('loginSuccess', '✓ Login successful! Redirecting to your dashboard…');

        setTimeout(function () {
          window.location.href = 'dahboard1.html';
        }, 1200);

      }, 1800);

    }); /* end form submit listener */

    /* ── Auto-clear errors when user types ── */
    autoClearErrors(['loginEmail', 'loginPassword']);

  } /* end initLogin */


  /* ================================================================
     PASSWORD EYE TOGGLE

     initEyeToggle(inputId, buttonId, iconId):
     - inputId:  the password <input> element's id
     - buttonId: the eye button's id
     - iconId:   the <svg> element id inside the button

     Clicking the button switches the input between:
       type="password" → shows dots  ●●●●●●
       type="text"     → shows text  abc123
     The SVG icon switches to show either an open or closed eye.
  ================================================================ */
  function initEyeToggle(inputId, buttonId, iconId) {

    var input  = document.getElementById(inputId);
    var button = document.getElementById(buttonId);
    var icon   = document.getElementById(iconId);

    /* Guard: all three must exist */
    if (!input || !button || !icon) { return; }

    button.addEventListener('click', function () {

      /* Check the current state of the input */
      var isHidden = (input.type === 'password');

      if (isHidden) {
        /* Switch to visible */
        input.type = 'text';
        /* Show the "eye closed" icon (password is now visible) */
        icon.innerHTML = getEyeClosedSVG();
        button.setAttribute('aria-label', 'Hide password');
      } else {
        /* Switch back to hidden */
        input.type = 'password';
        /* Show the "eye open" icon (password is now hidden) */
        icon.innerHTML = getEyeOpenSVG();
        button.setAttribute('aria-label', 'Show password');
      }

      /*
        Keep focus on the input after the button click so the
        cursor stays in the field ready to keep typing.
      */
      input.focus();
    });
  }

  /* SVG path for the "eye open" icon (password is hidden) */
  function getEyeOpenSVG() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  }

  /* SVG path for the "eye closed/slash" icon (password is visible) */
  function getEyeClosedSVG() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  }


  /* ================================================================
     BUTTON LOADING STATE

     setButtonLoading(buttonId, isLoading):
     - When isLoading = true:  disables the button and shows a spinner
     - When isLoading = false: restores the original button text

     We save the original innerHTML in a data attribute so it can
     be restored exactly — even if the original contained SVG icons.
  ================================================================ */
  function setButtonLoading(buttonId, isLoading) {

    var btn = document.getElementById(buttonId);
    if (!btn) { return; } /* Guard */

    if (isLoading) {
      /* Save original text before we overwrite it */
      btn.setAttribute('data-orig', btn.innerHTML);
      btn.disabled = true; /* Prevent clicks */
      /* Show a spinner + loading text */
      btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;">'
        + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 0.8s linear infinite;">'
        + '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>'
        + '</svg>Please wait…</span>';
    } else {
      /* Restore original button content */
      btn.disabled = false;
      var original = btn.getAttribute('data-orig');
      if (original) {
        btn.innerHTML = original;
        btn.removeAttribute('data-orig');
      }
    }
  }

  /*
    CSS keyframe for the spinner rotation.
    We inject this once into the document <head> so it's available
    without needing a separate CSS rule in auth.css.
  */
  (function injectSpinnerCSS() {
    var style = document.createElement('style');
    style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  })();


  /* ================================================================
     ALERT BANNERS — showAlert / hideAlert

     showAlert(id, message):
     - Finds the element by id
     - Sets its text safely using textContent (NOT innerHTML —
       textContent prevents XSS attacks by treating the string
       as plain text, not HTML that could be injected)
     - Adds class 'visible' so CSS displays it

     hideAlert(id):
     - Removes class 'visible' so CSS hides it
  ================================================================ */
  function showAlert(alertId, message) {
    var el = document.getElementById(alertId);
    if (!el) { return; }

    /* Find the text span inside the alert and update it */
    var msgSpan = el.querySelector('.auth-alert-msg');
    if (msgSpan) {
      msgSpan.textContent = message; /* Safe: textContent escapes HTML */
    } else {
      el.textContent = message;
    }

    el.classList.add('visible');

    /* Scroll the alert into view so the user sees it */
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert(alertId) {
    var el = document.getElementById(alertId);
    if (el) { el.classList.remove('visible'); }
  }


  /* ================================================================
     FIELD ERRORS — showFieldError / clearFieldError

     showFieldError(fieldId, message):
     - Adds .input-error class to the input (red border via CSS)
     - Makes the matching error span visible

     The error span id convention is "err-" + fieldId.
     e.g. fieldId = "signupEmail" → error span id = "err-signupEmail"
  ================================================================ */
  function showFieldError(fieldId, message) {

    /* Add red border to the input */
    var input = document.getElementById(fieldId);
    if (input) { input.classList.add('input-error'); }

    /* Show the error message below the input */
    var errEl = document.getElementById('err-' + fieldId);
    if (errEl) {
      errEl.textContent = message; /* Safe text update */
      errEl.classList.add('visible');
    }
  }

  function clearFieldError(fieldId) {
    var input = document.getElementById(fieldId);
    if (input) { input.classList.remove('input-error'); }

    var errEl = document.getElementById('err-' + fieldId);
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.remove('visible');
    }
  }

  /* Clear errors for an array of field IDs */
  function clearAllErrors(fieldIds) {
    fieldIds.forEach(function (id) { clearFieldError(id); });
  }

  /*
    Auto-clear a field's error as soon as the user starts typing.
    This gives instant feedback that their correction is working.
  */
  function autoClearErrors(fieldIds) {
    fieldIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', function () {
          clearFieldError(id);
        });
      }
    });
  }


  /* ================================================================
     REMEMBER ME — Save and restore email

     restoreRememberedEmail():
     Checks if there's a saved email in localStorage.
     If yes, pre-fills the email input and ticks the checkbox.
  ================================================================ */
  function restoreRememberedEmail() {
    var saved = localStorage.getItem('novaEmail');
    if (!saved) { return; } /* Nothing saved — do nothing */

    var emailInput = document.getElementById('loginEmail');
    var checkbox   = document.getElementById('rememberMe');

    if (emailInput) { emailInput.value   = saved; }
    if (checkbox)   { checkbox.checked   = true;  }
  }


  /* ================================================================
     VALIDATION HELPERS
  ================================================================ */

  /*
    isValidEmail(email):
    Tests a string against an email regex pattern.

    Regex breakdown: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      ^        = start of string
      [^\s@]+  = one or more characters that are NOT space or @
      @        = the @ symbol
      [^\s@]+  = domain name (like gmail)
      \.       = a literal dot
      [^\s@]+  = top-level domain (com, ng, etc.)
      $        = end of string
  */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }


  /* ================================================================
     UTILITY HELPERS
  ================================================================ */

  /*
    getVal(id): safely reads and trims an input's value.
    Returns '' (empty string) if the element doesn't exist.
    .trim() removes leading/trailing whitespace so "  John  "
    becomes "John".
  */
  function getVal(id) {
    var el = document.getElementById(id);
    if (!el) { return ''; }
    return (el.value || '').trim();
  }

  /*
    getChecked(id): safely reads a checkbox's checked state.
    Returns false if the element doesn't exist.
  */
  function getChecked(id) {
    var el = document.getElementById(id);
    if (!el) { return false; }
    return el.checked === true;
  }

})(); /* ── End of IIFE ── */