/* ================================================================
   ADMIN AUTH SCRIPT — NOVA Finance Admin Console Login
   ================================================================
   This file only handles two things on pages/admin-login.html:
     1. Merged: This is where we link or rather make the user able to login into the user dashboard

     2. Toggling the password field between hidden (dots) and
        visible (plain text)

     3. A basic client-side check, then a *simulated* submit for
        the login form — there is no real backend yet. The exact
        spot where a future fetch() call replaces the simulation
        is marked clearly below.

   Wrapped in an IIFE (Immediately Invoked Function Expression) —
   the (function () { ... })() pattern below — so none of these
   variables leak into the global scope and accidentally clash
   with variables from any other script on the page. This is the
   same pattern already used in auth.js and send_email.js.
   ================================================================ */
(function () {
  "use strict"; // makes the browser treat common mistakes (like a mistyped variable name) as errors instead of failing silently

  // Wait for the HTML to finish loading before looking for elements
  // on the page — otherwise document.getElementById() below could
  // run before those elements exist yet, and return null.
  document.addEventListener("DOMContentLoaded", function () {


    /* ------------------------------------------------------------
       1. LOGIN FORM SUBMISSION
       ------------------------------------------------------------
        This is where the user can login into the dashboard. 
        The login is static and can only work with the following credentials:
         - Email: "ceo@nova.com"
         - Password: "NovaCommand2026"
         --------------------------------------------------------------- */

         const adminLoginForm = document.getElementById('novaAdminLoginForm');

if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', function(e) {
    e.preventDefault(); 

    // Assuming you have inputs with these IDs on your admin login page
    const email = document.getElementById('adminEmailInput').value;
    const password = document.getElementById('adminPasswordInput').value;

    // Your custom CEO/Admin credentials
    if (email === "ceo@nova.com" && password === "NovaCommand2026") {
      
      // 1. Save a UNIQUE admin state to the browser
      sessionStorage.setItem('nova_admin_auth', 'true');
      
      // 2. Redirect the user to the admin dashboard
      window.location.href = 'admin-dashboard.html'; // Change to your actual admin file name
      
    } else {
      alert("Access Denied. Invalid Admin Credentials.");
    }
  });
}

     /* ------------------------------------------------------------
       2. PASSWORD VISIBILITY TOGGLE
       ------------------------------------------------------------
       Clicking the eye icon swaps the password field's "type"
       attribute between "password" (renders as dots) and "text"
       (renders as plain readable text), and swaps the icon and
       its accessible label to match whichever state it's now in.
    --------------------------------------------------------------- */
    const passwordInput = document.getElementById("adminPassword");
    const toggleButton = document.getElementById("togglePassword");
    const toggleIcon = document.getElementById("toggleIcon");

    if (toggleButton && passwordInput && toggleIcon) {
      toggleButton.addEventListener("click", function () {
        const isCurrentlyHidden = passwordInput.type === "password";

        // Flip the input's type — this is what actually shows/hides the characters
        passwordInput.type = isCurrentlyHidden ? "text" : "password";

        // classList.toggle("name", true/false) adds the class when the second
        // argument is true, and removes it when false — used here so only one
        // of the two icon classes is ever present at a time.
        toggleIcon.classList.toggle("bi-eye", !isCurrentlyHidden);
        toggleIcon.classList.toggle("bi-eye-slash", isCurrentlyHidden);

        // Screen readers announce this label, so it needs to describe
        // what clicking the button will do *next*, not its current state.
        toggleButton.setAttribute(
          "aria-label",
          isCurrentlyHidden ? "Hide password" : "Show password"
        );
      });
    }


    /* ------------------------------------------------------------
       3. FORM SUBMISSION
    --------------------------------------------------------------- */
    const form = document.getElementById("adminLoginForm");
    const emailInput = document.getElementById("adminEmail");
    const errorBox = document.getElementById("formError");
    const submitBtn = document.getElementById("submitBtn");

    // This flag stops the form from being submitted a second time
    // (e.g. someone double-clicking "Sign In") while the first
    // attempt is still being "processed".
    let isSubmitting = false;

    // Two small helper functions so the error-handling code below
    // doesn't have to repeat itself every time it needs to show or
    // clear a message.
    //
    // textContent (not innerHTML) is used on purpose: it inserts the
    // message as plain text only, so even if a message ever somehow
    // contained characters like "<script>", they could never be run
    // as code. Same XSS-safe pattern used in send_email.js.
    function showError(message) {
      errorBox.textContent = message;
      errorBox.classList.add("visible");
    }

    function clearError() {
      errorBox.textContent = "";
      errorBox.classList.remove("visible");
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault(); // stops the browser's default full-page form submission/reload
        clearError();

        if (isSubmitting) {
          return; // ignore the click — a submission is already in progress
        }

        // ---- Basic client-side validation --------------------------
        // This only checks that something was typed, and that the email
        // field roughly looks like an email address. It is NOT real
        // authentication — checking whether the password is actually
        // correct, and enforcing the 4-admin-account limit, both happen
        // on the server once the backend exists.
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const looksLikeEmail = /^\S+@\S+\.\S+$/.test(email); // \S+ = "one or more non-space characters"

        if (!email || !password) {
          showError("Please enter both your email and password.");
          return;
        }

        if (!looksLikeEmail) {
          showError("Please enter a valid email address.");
          return;
        }

        // ---- Simulated submit ---------------------------------------
        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.textContent = "Signing in…";

        // =================================================================
        // BACKEND INTEGRATION POINT
        // Replace this entire setTimeout block with a real fetch() call
        // once the admin login API exists. For example:
        //
        //   fetch("/api/admin/login", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ email, password })
        //   })
        //     .then(function (response) { return response.json(); })
        //     .then(function (data) { /* redirect on success, or showError(data.message) */ })
        //     .catch(function () { showError("Something went wrong. Please try again."); })
        //     .finally(function () {
        //       isSubmitting = false;
        //       submitBtn.disabled = false;
        //       submitBtn.textContent = "Sign In";
        //     });
        // =================================================================
        setTimeout(function () {
          isSubmitting = false;
          submitBtn.disabled = false;
          submitBtn.textContent = "Sign In";

          // Placeholder message until the real backend exists.
          showError("Admin login is not yet connected to a backend.");
        }, 1200);
      });
    }

  });
})();