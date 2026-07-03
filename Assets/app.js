/*
================================================================
  NOVA FINANCE — Main Application JavaScript
  File:    js/app.js
  Purpose: Controls all interactive behaviour on index.html

  WHAT LIVES HERE:
  ----------------
  1.  DOMContentLoaded bootstrap (entry point)
  2.  Navbar: scroll-aware background switch
  3.  SPA Smooth Scroll — intercepts every anchor click
  4.  Active Nav Link — highlights the current section
  5.  Low Data Mode — toggle + localStorage persistence
  6.  Stats Counter Animation — counts numbers up on scroll
  7.  Back-To-Top Button
  8.  Footer Copyright Year
  9.  AOS Init (Animate On Scroll)
 10.  Navbar Dropdown: hover on desktop, click on mobile
 11.  Mobile: close navbar after link click
================================================================
*/


/* ================================================================
   ENTRY POINT
   'DOMContentLoaded' fires when the browser has fully parsed
   the HTML document — all elements exist, but images may still
   be loading. This is where we call every initialisation function.
================================================================ */
document.addEventListener('DOMContentLoaded', function () {

  // Call each feature initialiser in order
  initNavbarScroll();      // 2. Navbar background on scroll
  initCarousel();          // FIX: Explicit carousel initialization to ensure it works
  initSmoothScroll();      // 3. SPA anchor interception
  initActiveNavLinks();    // 4. Highlight current section in nav
  initLowDataMode();       // 5. Low Data toggle
  initStatsCounter();      // 6. Animated number counters
  initBackToTop();         // 7. Back-to-top button
  setFooterYear();         // 8. Auto copyright year
  initAOS();               // 9. Animate On Scroll library
  initDropdownHover();     // 10. Hover dropdowns on desktop
  initMobileNavClose();    // 11. Close nav on mobile link click

  console.log('✅ Nova Finance scripts initialised');
});


/* ================================================================
   2. CAROUSEL INITIALIZATION

   FIX: Explicitly initialize Bootstrap carousel to ensure it works properly.
   ERROR: Bootstrap carousel with data-bs-ride="carousel" should auto-initialize,
          but sometimes fails if Bootstrap JS loads before DOM is fully ready.
   FIX: Use bootstrap.Carousel.getOrCreateInstance() to ensure carousel is initialized.
   This ensures the hero carousel displays images and text correctly.
================================================================ */
function initCarousel() {
  const carouselElement = document.getElementById('heroCarousel');
  if (!carouselElement) return;

  // Get or create Bootstrap carousel instance
  // This ensures the carousel is properly initialized even if auto-init failed
  const carousel = bootstrap.Carousel.getOrCreateInstance(carouselElement, {
    interval: 5500,              // Auto-slide every 5.5 seconds
    ride: 'carousel',           // Auto-start the carousel
    wrap: true,                 // Continue from last to first slide
    touch: true                 // Enable touch/swipe on mobile
  });

  console.log('✅ Hero carousel initialized');
}


/* ================================================================
   3. NAVBAR SCROLL-AWARE BACKGROUND

   WHY: The navbar starts transparent so it blends into the hero.
   Once the user scrolls 80px down, we add class "scrolled" which
   the CSS converts into a frosted-glass dark navy background.

   HOW: window.scrollY gives vertical scroll in pixels.
        classList.add/remove changes the CSS class.
        { passive: true } tells the browser the scroll listener
        will never call preventDefault() — enables scroll optimisation.
================================================================ */
function initNavbarScroll() {

  // Get the navbar element by its ID
  const nav = document.getElementById('mainNav');
  if (!nav) return;   // Guard: exit if the element doesn't exist

  // IIFE-style function: runs once on load + on every scroll
  function checkScroll() {
    // window.scrollY = pixels scrolled from the very top
    if (window.scrollY > 80) {
      // User has scrolled: apply dark background via 'scrolled' class
      nav.classList.add('scrolled');
    } else {
      // Back at the top: return to transparent
      nav.classList.remove('scrolled');
    }
  }

  // Run immediately so the correct state is set if the user
  // refreshes the page while scrolled halfway down
  checkScroll();

  // Run on every scroll event
  // passive:true = performance optimisation (we never block scrolling)
  window.addEventListener('scroll', checkScroll, { passive: true });
}


/* ================================================================
   3. SPA SMOOTH SCROLL

   This is the core of the Single-Page Application navigation.

   WHY: When a user clicks href="#about", the browser's default
   behaviour is an instant jump. We intercept it:
     1. Find the target element with document.querySelector(href)
     2. Call element.scrollIntoView({ behavior:'smooth' })
     3. This animates the scroll instead of jumping

   CSS scroll-margin-top on sections already adds 75px offset so
   the fixed navbar doesn't cover the section heading.
================================================================ */
function initSmoothScroll() {

  // querySelectorAll returns a NodeList of ALL <a> tags whose
  // href attribute starts with "#" (same-page anchors only)
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  // forEach loops over every matching link
  anchorLinks.forEach(function (link) {

    // Listen for a 'click' event on this link
    link.addEventListener('click', function (e) {

      // this.getAttribute('href') gets the href value of the clicked link
      const href = this.getAttribute('href');

      // Skip if href is just "#" (empty — goes nowhere)
      if (!href || href === '#') return;

      // Try to find the element on the page that matches this id
      const target = document.querySelector(href);

      if (target) {
        // We found the target — prevent the default instant jump
        e.preventDefault();

        // scrollIntoView: built-in browser API
        // behavior:'smooth' = animated scroll
        // block:'start'     = align the top of section with top of viewport
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}


/* ================================================================
   4. ACTIVE NAV LINK HIGHLIGHT

   As the user scrolls, the currently visible section's
   matching nav link gets the class "active" (gold underline in CSS).

   HOW: IntersectionObserver is a modern browser API that fires
   a callback whenever an element enters or leaves the viewport.
   It's more efficient than listening to the scroll event because
   the browser does all the maths internally.

   threshold: 0.25 → fires when 25% of the section is visible.
   rootMargin: shrinks the "trigger zone" so that sections activate
               slightly before they fill the viewport.
================================================================ */
function initActiveNavLinks() {

  // All <section> elements that have an id attribute
  const sections = document.querySelectorAll('section[id]');

  // All nav links that scroll to same-page sections
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  // Remove "active" from all nav links
  function clearActive() {
    navLinks.forEach(function (l) { l.classList.remove('active'); });
  }

  // Add "active" to the link whose href matches the given section id
  function setActive(id) {
    clearActive();
    // Template literal: builds the CSS selector string dynamically
    const match = document.querySelector(`.navbar-nav .nav-link[href="#${id}"]`);
    if (match) match.classList.add('active');
  }

  // Create the IntersectionObserver instance
  const observer = new IntersectionObserver(
    function (entries) {
      // entries is an array of all observed elements that changed state
      entries.forEach(function (entry) {
        // entry.isIntersecting = true when the element is inside the viewport
        if (entry.isIntersecting) {
          // getAttribute returns the element's id (e.g. "about", "services")
          setActive(entry.target.getAttribute('id'));
        }
      });
    },
    {
      threshold: 0.25,                            // 25% visible triggers
      rootMargin: '-75px 0px -35% 0px'            // Shrink trigger zone to avoid overlap
    }
  );

  // Tell the observer to watch each section
  sections.forEach(function (s) { observer.observe(s); });
}


/* ================================================================
   5. LOW DATA MODE

   A unique feature: strips all animations and heavy CSS when
   enabled, so the site works on slow 3G connections.

   MECHANISM:
   - A class "low-data-mode" on <body> triggers CSS overrides
     in style.css that disable all transitions, animations, and
     heavy background effects.
   - localStorage remembers the user's preference between visits.
   - Both the desktop and mobile toggle buttons are synced.

   localStorage:
   - localStorage.setItem(key, value) → saves to browser storage
   - localStorage.getItem(key)         → reads from browser storage
   - Persists indefinitely (until user clears browser data)
================================================================ */
function initLowDataMode() {

  // Both toggle buttons (desktop + mobile)
  const btnDesktop = document.getElementById('lowDataToggleDesktop');
  const btnMobile  = document.getElementById('lowDataToggleMobile');

  // Read saved preference from localStorage
  // If the user turned it on before, re-apply it on this visit
  const savedPref = localStorage.getItem('novaLowData');
  if (savedPref === 'on') {
    document.body.classList.add('low-data-mode');
    markButtonsActive(true);
  }

  // Toggle function: flips the low-data-mode class on/off
  function toggle() {
    const isOn = document.body.classList.toggle('low-data-mode');
    // classList.toggle returns true if the class was ADDED, false if removed

    // Save the new state to localStorage
    localStorage.setItem('novaLowData', isOn ? 'on' : 'off');

    // Update both buttons to reflect current state
    markButtonsActive(isOn);

    // Show a brief feedback toast (defined below)
    showToast(isOn
      ? '⚡ Low Data Mode ON — animations disabled'
      : '✨ Low Data Mode OFF — animations enabled'
    );
  }

  // Sync both button appearances to reflect current state
  function markButtonsActive(isOn) {
    [btnDesktop, btnMobile].forEach(function (btn) {
      if (!btn) return;
      if (isOn) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('title', 'Low Data Mode is ON — click to disable');
      } else {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('title', 'Enable Low Data Mode for faster loading');
      }
    });
  }

  // Attach click listener to both buttons
  if (btnDesktop) btnDesktop.addEventListener('click', toggle);
  if (btnMobile)  btnMobile.addEventListener('click', toggle);
}


/* ================================================================
   TOAST NOTIFICATION
   A small temporary message that slides in from the bottom-right
   corner of the screen, shows for 3 seconds, then disappears.

   This is built with pure JS — no library needed.
   We create a <div>, style it, append it to <body>, then remove it.
================================================================ */
function showToast(message) {

  // Remove any existing toast first (avoid stacking)
  const existing = document.getElementById('novaToast');
  if (existing) existing.remove();

  // Create the toast element
  const toast = document.createElement('div');
  toast.id = 'novaToast';   // id so we can remove it later

  // Inline styles (applied directly on the element)
  // We use inline here so the toast works without extra CSS
  Object.assign(toast.style, {
    position:        'fixed',
    bottom:          '80px',
    right:           '24px',
    background:      '#C9A84C',         // Gold background
    color:           '#0A1628',         // Dark navy text
    padding:         '12px 20px',
    borderRadius:    '10px',
    fontWeight:      '600',
    fontSize:        '0.86rem',
    zIndex:          '9999',
    boxShadow:       '0 4px 20px rgba(0,0,0,0.4)',
    transform:       'translateY(20px)',  // Start below final position
    opacity:         '0',
    transition:      'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    maxWidth:        '300px',
    lineHeight:      '1.4'
  });

  // role="status" makes screen readers announce the toast content
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  // Add to the page
  document.body.appendChild(toast);

  // requestAnimationFrame waits one frame before animating
  // (so the browser renders the initial state first)
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateY(0)';
    });
  });

  // After 3 seconds, fade the toast out, then remove it from the DOM
  setTimeout(function () {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateY(20px)';
    // Remove after the 0.3s fade-out transition completes
    setTimeout(function () { if (toast.parentNode) toast.remove(); }, 320);
  }, 3000);
}


/* ================================================================
   6. STATS COUNTER ANIMATION

   When the #stats section scrolls into view, each number counts
   up from 0 to its target value (set in data-target attribute).

   HOW:
   - IntersectionObserver fires when #stats enters viewport
   - We get all .counter-up elements and animate each one
   - requestAnimationFrame drives a 60fps animation loop
   - easeOutCubic slows down the count near the end (natural feel)
   - hasAnimated flag prevents it running more than once
================================================================ */
function initStatsCounter() {

  // All elements we need to animate
  const counters = document.querySelectorAll('.counter-up');
  if (!counters.length) return;

  // Flag: set to true after first animation so we don't re-run
  let hasAnimated = false;

  // Easing function: maps linear progress (0→1) to eased progress.
  // t=0 → result=0, t=1 → result=1, but in-between it slows at the end.
  function easeOutCubic(t) {
    // (1-t)^3 gives the cubic ease
    return 1 - Math.pow(1 - t, 3);
  }

  // Animate a single counter element
  function animateCounter(el) {

    // data-target is the final value set in the HTML attribute
    // parseInt(..., 10) converts the string "75000" to number 75000
    // 10 = decimal base (always use 10 to avoid octal interpretation)
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;   // Animation runs for 2000ms (2 seconds)

    // performance.now() = high-resolution timestamp in milliseconds
    const startTime = performance.now();

    // The animation loop function
    function update(now) {
      // How much time has passed since animation started?
      const elapsed = now - startTime;

      // progress goes from 0 (start) to 1 (end)
      // Math.min caps it at 1 even if elapsed > duration
      const progress = Math.min(elapsed / duration, 1);

      // Apply easing to make the counter slow down as it approaches target
      const eased = easeOutCubic(progress);

      // Calculate the current displayed value
      const current = Math.round(eased * target);

      // Update the element's text
      // toLocaleString adds commas: 75000 → "75,000"
      el.textContent = current.toLocaleString('en-NG');

      // Keep animating until we reach the end (progress < 1)
      if (progress < 1) {
        // requestAnimationFrame: browser calls update() before next repaint
        // This creates a smooth ~60 frames-per-second animation
        requestAnimationFrame(update);
      } else {
        // Final value: ensure we display exactly the target
        el.textContent = target.toLocaleString('en-NG');
      }
    }

    // Start the animation loop
    requestAnimationFrame(update);
  }

  // Watch the #stats section with IntersectionObserver
  const statsSection = document.getElementById('stats');
  if (!statsSection) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      // Only run once, when the section first becomes visible
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        // Animate all counter elements with a slight stagger
        counters.forEach(function (counter, index) {
          // setTimeout staggers each counter by 100ms
          setTimeout(function () { animateCounter(counter); }, index * 100);
        });
      }
    });
  }, { threshold: 0.50 }); // 50% of the section must be visible

  observer.observe(statsSection);
}


/* ================================================================
   7. BACK TO TOP BUTTON

   Shows a button in the bottom-right corner after the user
   scrolls 300px. Clicking it smoothly scrolls back to the top.

   CSS defines .back-to-top (hidden) and .back-to-top.visible (shown).
   We toggle the "visible" class with JavaScript.
================================================================ */
function initBackToTop() {

  // The back-to-top button element
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  // Show or hide based on scroll position
  window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
      btn.classList.add('visible');     // CSS: opacity:1, visibility:visible
    } else {
      btn.classList.remove('visible'); // CSS: opacity:0, visibility:hidden
    }
  }, { passive: true });

  // Smooth scroll to top on click
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ================================================================
   8. FOOTER COPYRIGHT YEAR

   Automatically writes the current year into the footer's
   copyright line so you never need to update it manually.
================================================================ */
function setFooterYear() {

  // querySelector finds the FIRST element matching the CSS selector
  const yearEl = document.getElementById('copyrightYear');
  if (!yearEl) return;

  // new Date() creates a date object for "right now"
  // .getFullYear() extracts just the 4-digit year (e.g. 2024)
  yearEl.textContent = new Date().getFullYear();
}


/* ================================================================
   9. AOS INITIALISATION

   AOS (Animate On Scroll) is a library loaded via CDN.
   When AOS.init() runs, it watches all elements with data-aos="..."
   attributes and adds/removes CSS classes when they enter/leave
   the viewport, creating smooth fade-in/slide-in effects.

   We check typeof AOS !== 'undefined' first to guard against
   the CDN failing to load (no errors if the library is missing).
================================================================ */
function initAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,             // Each animation lasts 700ms
      easing:   'ease-out-cubic', // Smooth deceleration curve
      once:     true,            // Animate only the FIRST time (not on re-scroll)
      offset:   80,              // Start 80px before element enters viewport
      delay:    0                // Base delay (individual delays set via data-aos-delay)
    });
  }
}


/* ================================================================
  10. DROPDOWN HOVER ON DESKTOP

   Bootstrap dropdowns normally require a click to open.
   On desktop (≥ 992px), we want hover behaviour (like LasLas).
   On mobile we keep the click behaviour (touch-friendly).

   HOW: mouseover event opens the dropdown by adding Bootstrap's
   "show" class and triggering the Dropdown instance.
   mouseleave closes it.
================================================================ */
function initDropdownHover() {

  // Only run on desktop (992px+)
  // window.innerWidth = current viewport width in pixels
  if (window.innerWidth < 992) return;

  // All dropdown trigger elements in the navbar
  const dropdowns = document.querySelectorAll('.navbar .dropdown');

  dropdowns.forEach(function (dropdown) {

    // Open on mouse enter
    dropdown.addEventListener('mouseover', function () {
      // Get the Bootstrap Dropdown instance for this element
      const toggle = this.querySelector('[data-bs-toggle="dropdown"]');
      if (!toggle) return;

      // bootstrap.Dropdown.getOrCreateInstance() gets or creates a
      // Bootstrap Dropdown JS instance for this toggle element
      const bsDropdown = bootstrap.Dropdown.getOrCreateInstance(toggle);
      bsDropdown.show();  // Open the dropdown
    });

    // Close on mouse leave
    dropdown.addEventListener('mouseleave', function () {
      const toggle = this.querySelector('[data-bs-toggle="dropdown"]');
      if (!toggle) return;
      const bsDropdown = bootstrap.Dropdown.getInstance(toggle);
      if (bsDropdown) bsDropdown.hide();  // Close the dropdown
    });
  });
}


/* ================================================================
  11. MOBILE: CLOSE NAVBAR AFTER LINK CLICK

   On mobile, the Bootstrap collapse navbar stays open after
   clicking a link unless we close it manually.
   This intercepts the click and hides the collapse.

   bootstrap.Collapse.getInstance() gets the existing Bootstrap
   Collapse instance (the navbar collapse mechanism).
   .hide() triggers the slide-up closing animation.
================================================================ */
function initMobileNavClose() {

  // The collapsible navbar container
  const navCollapse = document.getElementById('navbarMenu');
  if (!navCollapse) return;

  // Every link inside the navbar
  const navLinks = navCollapse.querySelectorAll('a');

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {

      // Only close if the navbar is currently shown (open)
      // classList.contains returns true if the element has that class
      if (navCollapse.classList.contains('show')) {

        // Get the Bootstrap Collapse instance and hide it
        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });
}