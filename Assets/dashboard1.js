/* A demo login page for Nova Finance. This is a static login form that only works with the following credentials:
 * Username: demo
 * Password: demo
 */
// dashboard.js
if (sessionStorage.getItem('nova_auth') !== 'true') {
  // Kick them back to the home page if they aren't authenticated
  window.location.href = 'index.html';
}

  /*
  ================================================================================
    NOVA FINANCE — DASHBOARD JAVASCRIPT (UPDATED)
    File:    dashboard.js
    Pairs with: dashboard.html

    UPDATES IN THIS VERSION:
    ------------------------
    1. PANEL_TITLES updated to include the new merged panels:
      - panel-transactions (Send + Receive)
      - panel-owealth (Quick Loans + Smart Savings)
      - panel-bills now includes Airtime & Data as a subsection
    2. Added initVirtualCardOverview() — shows a virtual card preview
      on the Overview page with a "Copy Number" button.
    3. Added initVirtualCardProfile() — full virtual card management
      in the Profile panel: toggle card number/CVC/PIN visibility,
      block/unblock the card, copy all details.
    4. Added initMarketplaceCategoryNav() — "Previous" / "Next"
      navigation buttons for each product category in the Marketplace.
    5. All original logic (transactions, PIN modal, filters, CSV export,
      loans, savings, etc.) remains unchanged and fully functional.

    No external libraries were added — this remains pure vanilla JS.
  ================================================================================
  */


/* ================================================================
   1. ENTRY POINT
================================================================ */
document.addEventListener('DOMContentLoaded', function () {

  initPanelNavigation();
  initMobileSidebar();
  initNotificationsDropdown();
  initUserMenuDropdown();
  initBalanceVisibilityToggle();
  initCopyHeroAccountNumber();
  initAnalyticsChartTooltip();
  initBeneficiaryChips();
  renderAllTransactionTables();
  initSendMoneyFlow();
  initPinModal();
  initReceiveMoneyActions();
  initPillTabGroup({ groupSelector: '#panel-bills .pill-tab-group', idPrefix: 'bill-' });
  initPillTabGroup({ groupSelector: '#panel-marketplace .pill-tab-group', idPrefix: 'market-' });
  initAmountChipGroups();
  initAirtimeDataPanel();
  initMarketplaceExtras();
  initMarketplaceCategoryNav();   // NEW: category Previous/Next buttons
  initInsuranceGetCoverButtons();
  initLoanCalculator();
  initSavingsGoals();
  initTransactionHistoryFilters();
  initProfilePanel();
  initVirtualCardOverview();      // NEW: overview virtual card
  initVirtualCardProfile();       // NEW: profile virtual card management
  initLogout();
  initGenericMockSubmitForms();

  console.log('Nova Finance dashboard ready (refactored).');
});


/* ================================================================
   2. MOCK / DEMO DATA (unchanged)
   Everything in this section stands in for data that will eventually
   come from a real backend. Keeping it in ONE place, as plain data
   (not scattered across many <tr> tags typed by hand), means the
   Overview preview table and the full History table can both render
   from the exact same source — they can never drift out of sync with
   each other the way two hand-typed copies of the same data could.

================================================================ */
const transactions = [
  { type: 'Transfer',     description: 'Transfer to Emeka Nwosu',             subtext: 'Zenith Bank',              date: '2024-11-01T14:30', reference: 'NVA-2024-0481', amount: -50000,  status: 'Success' },
  { type: 'Transfer',     description: 'Salary — ABC Constructions Ltd',      subtext: 'GTBank',                   date: '2024-10-31T09:00', reference: 'NVA-2024-0478', amount: 450000,  status: 'Success' },
  { type: 'Bill',         description: 'EEDC Electricity (Prepaid)',          subtext: 'Meter: 45210067822',       date: '2024-10-30T11:15', reference: 'NVA-2024-0462', amount: -15000,  status: 'Success' },
  { type: 'Marketplace',  description: 'Marketplace Sale — Binatone Blender', subtext: 'Escrow released',          date: '2024-10-29T16:45', reference: 'NVA-2024-0455', amount: 35000,   status: 'Success' },
  { type: 'Airtime',      description: 'MTN Data Bundle — 10GB',              subtext: '0803 456 7890',            date: '2024-10-28T08:30', reference: 'NVA-2024-0449', amount: -3500,   status: 'Success' },
  { type: 'Bill',         description: 'DStv Compact Subscription',           subtext: 'Smart Card: 1234567890',   date: '2024-10-27T19:10', reference: 'NVA-2024-0441', amount: -15700,  status: 'Failed'  },
];

/* BACKEND HOOK: a real NUBAN lookup would call the bank's account-name
   API. We fake it with a small lookup table so the demo account
   numbers used on the Quick Transfer / beneficiary chips resolve to
   the SAME names when "verified" on the Send Money form — keeping the
   whole demo internally consistent. */
const MOCK_ACCOUNT_NAMES = {
  '0123456789': 'Emeka Nwosu',
  '1234567890': 'Adaeze Nwachukwu',
  '5555555555': 'Dr. Ngozi Dike',
  '9876543210': 'Ikechukwu Eze',
};

/* The PIN used everywhere a "transaction PIN" is checked in this demo.
   BACKEND HOOK: a real app never compares PINs in client-side
   JavaScript at all — the PIN would be sent (already hashed/secured
   by the channel) to the backend, which is the only place that knows
   the real value. This constant exists purely so the demo has SOME
   PIN to validate against until that backend exists. */
const DEMO_PIN = '123456';


/* ================================================================
   3. SMALL SHARED HELPERS (unchanged)
================================================================ */
/* ARCHITECTURE NOTES (from original dashboard.js)
 - Pure vanilla JavaScript. No framework, no build step, no imports.
 - Every "show or hide this element" decision uses ONE of exactly two
   patterns, and never mixes them on the same element:
     (1) toggling the class "is-active" on an element whose CSS default
         is `display:none` (used for: dash-panel, bill-form,
         market-tab-panel, every pill-tab/amount-chip/network-card/
         bundle-card "selected" state, sidebar-nav-link "current page"
         highlight).
     (2) toggling the class "is-hidden" (a `display:none !important`
         utility) OR the native `hidden` attribute, used for simple
         two-state toggles (balance mask, verified-name box, modals,
         dropdowns, pin success step, etc).
 - Functions that stand in for a future backend call are clearly
   marked with the comment tag "BACKEND HOOK" and return a Promise,
   so swapping them for real network requests later doesn't require
   changing calling code.
*/

/** Formats a number as Nigerian Naira, e.g. 1250000 -> "₦1,250,000". */
function formatNaira(amount) {
  const sign = amount < 0 ? '-' : '';
  return sign + '₦' + Math.abs(Math.round(amount)).toLocaleString('en-NG');
}

/** Formats an ISO datetime string into something readable, e.g. "Nov 1, 2:34pm". */
function formatDateTime(isoString) {
  const d = new Date(isoString);
  const datePart = d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  const timePart = d.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  return `${datePart}, ${timePart}`;
}

function showToast(message, type) {
  type = type || 'success';
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast is-${type}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  container.appendChild(toast);

  // Two-step class addition: the element must be painted once with
  // opacity:0 before we add is-visible, or the browser may merge both
  // states into a single frame and the transition never plays.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { toast.classList.add('is-visible'); });
  });

  // Auto-remove after ~3.2 seconds.
  setTimeout(function () {
    toast.classList.remove('is-visible');
    setTimeout(function () { toast.remove(); }, 250);
  }, 3200);
}

/* ---- Generic modal engine ----
   Every modal in this project (5 of them) opens and closes through
   these two functions and nothing else. They manage:
     - removing/adding the native `hidden` attribute (the single
       source of truth for modal visibility, see the CSS file notes)
     - locking page scroll while any modal is open
     - remembering which element had focus before opening, and
       returning focus to it on close (keyboard/screen-reader hygiene)
     - moving focus into the modal so a keyboard user lands somewhere
       useful immediately */

let lastFocusedBeforeModal = null;
const openModalIds = new Set();

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  lastFocusedBeforeModal = document.activeElement;
  modal.removeAttribute('hidden');
  openModalIds.add(modalId);
  document.body.style.overflow = 'hidden';

  const focusTarget = modal.querySelector('.modal-close-btn, input, select, textarea, button');
  if (focusTarget) focusTarget.focus();
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.setAttribute('hidden', '');
  openModalIds.delete(modalId);

  if (openModalIds.size === 0) document.body.style.overflow = '';

  if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
    lastFocusedBeforeModal.focus();
  }
}

document.addEventListener('click', function (e) {
  const closeTrigger = e.target.closest('[data-modal-close]');
  if (closeTrigger) {
    const modal = closeTrigger.closest('.modal-backdrop');
    if (modal) closeModal(modal.id);
    return;
  }

  if (e.target.classList.contains('modal-backdrop') &&
      e.target.dataset.modalCloseOnBackdrop === 'true') {
    closeModal(e.target.id);
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && openModalIds.size > 0) {
    const ids = Array.from(openModalIds);
    closeModal(ids[ids.length - 1]);
  }
});


/* ================================================================
   4. PANEL NAVIGATION (UPDATED panel titles)

   ONE delegated click-listener handles every element in the whole
   document that carries data-panel="panel-XXXX" — sidebar links,
   bottom mobile nav, the "View All" button on Recent Transactions,
   and the user-menu's "My Profile"/"Settings" links. Using a single
   delegated listener (instead of attaching a separate listener to
   each group, which is what the previous dashboard did) means there
   is no risk of the same click ever firing two competing handlers.
================================================================ */

// UPDATED: added panel-transactions and panel-owealth; removed
// panel-send, panel-receive, panel-airtime (merged into bills),
// panel-loans, panel-savings (merged into owealth).
const PANEL_TITLES = {
  'panel-overview':     'Overview',
  'panel-transactions': 'Transactions',      // merged Send + Receive
  'panel-bills':        'Pay Bills',         // merged Bills + Airtime/Data
  'panel-marketplace':  'Marketplace',
  'panel-insurance':    'Insurance',
  'panel-owealth':      'OWealth',           // merged Quick Loans + Savings
  'panel-history':      'Transaction History',
  'panel-profile':      'Profile & Settings',
};

function setActivePanel(panelId) {
  if (!PANEL_TITLES[panelId]) return;

  document.querySelectorAll('.dash-panel').forEach(function (panel) {
    panel.classList.toggle('is-active', panel.id === panelId);
  });

  document.querySelectorAll('.sidebar-nav-link, .bottom-nav-link').forEach(function (link) {
    const isMatch = link.dataset.panel === panelId;
    link.classList.toggle('is-active', isMatch);
    if (isMatch) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = PANEL_TITLES[panelId];

  const content = document.getElementById('dashContent');
  if (content) content.scrollTop = 0;

  localStorage.setItem('novaActivePanel', panelId);
}

function initPanelNavigation() {
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-panel]');
    if (!trigger) return;

    setActivePanel(trigger.dataset.panel);

    document.getElementById('appShell').classList.remove('sidebar-open');
    document.getElementById('sidebarOverlay').classList.remove('is-visible');

    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown && !userDropdown.hasAttribute('hidden')) {
      userDropdown.setAttribute('hidden', '');
    }
  });

  const saved = localStorage.getItem('novaActivePanel');
  setActivePanel(saved && PANEL_TITLES[saved] ? saved : 'panel-overview');
}


/* ================================================================
   5. MOBILE SIDEBAR (unchanged)
================================================================ */
function initMobileSidebar() {
  const appShell    = document.getElementById('appShell');
  const overlay     = document.getElementById('sidebarOverlay');
  const openBtn     = document.getElementById('sidebarToggleBtn');
  const closeBtn    = document.getElementById('sidebarCloseBtn');

  function openSidebar() {
    appShell.classList.add('sidebar-open');
    overlay.classList.add('is-visible');
    openBtn.setAttribute('aria-expanded', 'true');
  }
  function closeSidebar() {
    appShell.classList.remove('sidebar-open');
    overlay.classList.remove('is-visible');
    openBtn.setAttribute('aria-expanded', 'false');
  }

  openBtn.addEventListener('click', openSidebar);
  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);
}


/* ================================================================
   6. NOTIFICATIONS DROPDOWN (unchanged)
================================================================ */
function initNotificationsDropdown() {
  const bellBtn  = document.getElementById('notifBtn');
  const dropdown = document.getElementById('notifDropdown');
  const markReadBtn = document.getElementById('markAllReadBtn');

  bellBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    const isOpen = !dropdown.hasAttribute('hidden');
    if (isOpen) {
      dropdown.setAttribute('hidden', '');
      bellBtn.setAttribute('aria-expanded', 'false');
    } else {
      dropdown.removeAttribute('hidden');
      bellBtn.setAttribute('aria-expanded', 'true');
    }
  });

  document.addEventListener('click', function (e) {
    if (!dropdown.contains(e.target) && e.target !== bellBtn) {
      dropdown.setAttribute('hidden', '');
      bellBtn.setAttribute('aria-expanded', 'false');
    }
  });

  markReadBtn.addEventListener('click', function () {
    document.querySelectorAll('.notif-item.is-unread').forEach(function (item) {
      item.classList.remove('is-unread');
    });
    const badge = document.querySelector('.notif-badge');
    if (badge) badge.style.display = 'none';
  });
}


/* ================================================================
   7. USER MENU DROPDOWN (unchanged)
================================================================ */
function initUserMenuDropdown() {
  const menuBtn  = document.getElementById('userMenuBtn');
  const dropdown = document.getElementById('userDropdown');

  menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    const isOpen = !dropdown.hasAttribute('hidden');
    if (isOpen) {
      dropdown.setAttribute('hidden', '');
      menuBtn.setAttribute('aria-expanded', 'false');
    } else {
      dropdown.removeAttribute('hidden');
      menuBtn.setAttribute('aria-expanded', 'true');
    }
  });

  document.addEventListener('click', function (e) {
    if (!dropdown.contains(e.target) && e.target !== menuBtn) {
      dropdown.setAttribute('hidden', '');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // The "Log Out" entry inside this dropdown reuses the exact same
  // confirmation modal as the sidebar's Log Out button — see
  // initLogout() in section 24.
  document.getElementById('userMenuLogoutBtn').addEventListener('click', function () {
    dropdown.setAttribute('hidden', '');
    openModal('logoutConfirmModal');
  });
}


/* ================================================================
   8. BALANCE VISIBILITY TOGGLE (unchanged)
================================================================ */
function initBalanceVisibilityToggle() {
  const btn      = document.getElementById('toggleBalanceBtn');
  const shown    = document.getElementById('balanceAmount');
  const masked   = document.getElementById('balanceAmountMasked');
  const icon     = document.getElementById('balanceEyeIcon');

  btn.addEventListener('click', function () {
    const isCurrentlyShown = !shown.classList.contains('is-hidden');

    shown.classList.toggle('is-hidden', isCurrentlyShown);
    masked.classList.toggle('is-hidden', !isCurrentlyShown);

    icon.classList.toggle('bi-eye-fill', isCurrentlyShown);
    icon.classList.toggle('bi-eye-slash-fill', !isCurrentlyShown);

    btn.setAttribute('aria-pressed', String(isCurrentlyShown));
    btn.setAttribute('aria-label', isCurrentlyShown ? 'Show balance amount' : 'Hide balance amount');
  });
}

function copyTextToClipboard(text, successMessage) {
  navigator.clipboard.writeText(text).then(function () {
    showToast(successMessage, 'success');
  }).catch(function () {
    showToast('Could not copy automatically — please copy it manually.', 'warning');
  });
}

function initCopyHeroAccountNumber() {
  document.getElementById('copyHeroAcctBtn').addEventListener('click', function () {
    const acctNo = document.getElementById('heroAccountNumber').textContent.trim();
    copyTextToClipboard(acctNo, 'Account number copied to clipboard!');
  });
}


/* ================================================================
   9. OVERVIEW: ANALYTICS CHART HOVER TOOLTIP
   Pure DOM positioning using getBoundingClientRect() — no manual
   SVG-to-pixel scale maths, so this stays correct no matter how wide
   the chart card actually renders on any given screen.
================================================================ */
function initAnalyticsChartTooltip() {
  const wrap    = document.getElementById('analyticsChartWrap');
  const tooltip = document.getElementById('chartTooltip');
  const points  = document.querySelectorAll('#analyticsChartSvg .chart-point');

  points.forEach(function (point) {
    point.addEventListener('mouseenter', function () { showTooltipFor(point); });
    point.addEventListener('mouseleave', function () { tooltip.setAttribute('hidden', ''); });
  });

  function showTooltipFor(point) {
    const wrapRect  = wrap.getBoundingClientRect();
    const ptRect    = point.getBoundingClientRect();

    tooltip.textContent = `${point.dataset.month}: ${point.dataset.value}`;
    tooltip.style.left = (ptRect.left - wrapRect.left + ptRect.width / 2) + 'px';
    tooltip.style.top  = (ptRect.top  - wrapRect.top) + 'px';
    tooltip.removeAttribute('hidden');
  }
}


/* ================================================================
   10. BENEFICIARY CHIPS (unchanged)
================================================================ */
function initBeneficiaryChips() {
  document.addEventListener('click', function (e) {
    const chip = e.target.closest('.beneficiary-chip');
    if (!chip) return;

    setActivePanel('panel-transactions');

    const bankSelect = document.getElementById('recipientBank');
    const acctInput  = document.getElementById('recipientAcct');

    bankSelect.value = chip.dataset.bank;
    acctInput.value  = chip.dataset.account;

    resetAccountVerificationUi();

    showToast(`Form filled for ${chip.dataset.name}. Tap "Verify" to confirm the account.`, 'info');
  });
}


/* ================================================================
   11. TRANSACTION TABLE RENDERER (unchanged)
================================================================ */
function statusBadgeHtml(status) {
  const cls = status === 'Success' ? 'badge-success' : (status === 'Failed' ? 'badge-danger' : 'badge-neutral');
  return `<span class="badge ${cls}">${status}</span>`;
}

function renderOverviewTransactions() {
  const tbody = document.getElementById('overviewTxnBody');
  const rows = transactions.slice(0, 5).map(function (t) {
    const amountClass = t.amount < 0 ? 'amt-debit' : 'amt-credit';
    return `
      <tr>
        <td><strong>${t.description}</strong></td>
        <td>${t.subtext}</td>
        <td>${formatDateTime(t.date)}</td>
        <td>${t.type}</td>
        <td class="${amountClass}">${formatNaira(t.amount)}</td>
        <td>${statusBadgeHtml(t.status)}</td>
      </tr>`;
  }).join('');
  tbody.innerHTML = rows;
}

function renderHistoryTransactions(list) {
  const tbody   = document.getElementById('historyTxnBody');
  const emptyEl = document.getElementById('historyEmptyMsg');

  if (list.length === 0) {
    tbody.innerHTML = '';
    emptyEl.classList.remove('is-hidden');
    return;
  }
  emptyEl.classList.add('is-hidden');

  tbody.innerHTML = list.map(function (t) {
    const amountClass = t.amount < 0 ? 'amt-debit' : 'amt-credit';
    return `
      <tr>
        <td>${t.type}</td>
        <td>${t.description} — <span style="color:var(--ink-500)">${t.subtext}</span></td>
        <td>${formatDateTime(t.date)}</td>
        <td><code>${t.reference}</code></td>
        <td class="${amountClass}">${formatNaira(t.amount)}</td>
        <td>${statusBadgeHtml(t.status)}</td>
      </tr>`;
  }).join('');
}

function renderAllTransactionTables() {
  renderOverviewTransactions();
  renderHistoryTransactions(transactions);
}


/* ================================================================
   12. SEND MONEY FLOW (unchanged)
================================================================ */
function mockVerifyAccountName(accountNumber) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(MOCK_ACCOUNT_NAMES[accountNumber] || 'Chioma Obi');
    }, 900);
  });
}

function resetAccountVerificationUi() {
  document.getElementById('verifyStatusMsg').textContent = '';
  document.getElementById('verifiedNameBox').classList.add('is-hidden');
  document.getElementById('verifiedNameText').textContent = '—';
  updateTransferFeeNote();
}

function updateTransferFeeNote() {
  const bank = document.getElementById('recipientBank').value;
  const note = document.getElementById('transferFeeNote');
  const isInternal = bank === 'Nova Finance (Internal)';
  note.innerHTML = isInternal
    ? 'Transfer fee: <strong>Free</strong> (Nova-to-Nova transfer)'
    : 'Transfer fee: <strong>₦10.00</strong> (flat fee for other banks)';
}

function initSendMoneyFlow() {
  const bankSelect   = document.getElementById('recipientBank');
  const acctInput    = document.getElementById('recipientAcct');
  const verifyBtn     = document.getElementById('verifyAcctBtn');
  const statusMsg     = document.getElementById('verifyStatusMsg');
  const verifiedBox   = document.getElementById('verifiedNameBox');
  const verifiedText  = document.getElementById('verifiedNameText');
  const sendForm      = document.getElementById('sendForm');

  bankSelect.addEventListener('change', updateTransferFeeNote);

  verifyBtn.addEventListener('click', function () {
    const acctNo = acctInput.value.trim();

    if (!/^\d{10}$/.test(acctNo)) {
      statusMsg.textContent = 'Enter a valid 10-digit account number first.';
      statusMsg.classList.add('is-error');
      return;
    }
    if (!bankSelect.value) {
      statusMsg.textContent = 'Please select a bank first.';
      statusMsg.classList.add('is-error');
      return;
    }

    statusMsg.classList.remove('is-error');
    statusMsg.textContent = 'Looking up account name…';
    verifyBtn.disabled = true;

    mockVerifyAccountName(acctNo).then(function (name) {
      verifiedText.textContent = name;
      verifiedBox.classList.remove('is-hidden');
      statusMsg.textContent = 'Account verified successfully.';
      verifyBtn.disabled = false;
    });
  });

  sendForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('transferAmount').value || '0');

    if (!bankSelect.value) { showToast('Please select a recipient bank.', 'warning'); return; }
    if (verifiedBox.classList.contains('is-hidden')) { showToast('Please verify the recipient account first.', 'warning'); return; }
    if (!amount || amount < 100) { showToast('Minimum transfer amount is ₦100.', 'warning'); return; }

    const isInternal = bankSelect.value === 'Nova Finance (Internal)';
    const fee = isInternal ? 0 : 10;

    document.getElementById('pinSummaryRecipient').textContent = verifiedText.textContent;
    document.getElementById('pinSummaryAmount').textContent = formatNaira(amount);
    document.getElementById('pinSummaryFee').textContent = fee === 0 ? 'Free' : formatNaira(fee);

    openSendPinModal();
  });
}


/* ================================================================
   13. PIN MODAL (unchanged)
================================================================ */
function openSendPinModal() {
  document.getElementById('pinEntryStep').classList.remove('is-hidden');
  document.getElementById('pinSuccessStep').classList.add('is-hidden');
  document.getElementById('pinErrorMsg').classList.add('is-hidden');
  clearPinBoxes();
  openModal('pinModal');
}

function clearPinBoxes() {
  const boxes = document.querySelectorAll('#pinModal .pin-box');
  boxes.forEach(function (box) { box.value = ''; });
  if (boxes[0]) boxes[0].focus();
}

function initPinModal() {
  const boxes = document.querySelectorAll('#pinModal .pin-box');

  boxes.forEach(function (box, index) {
    box.addEventListener('input', function () {
      box.value = box.value.replace(/[^0-9]/g, '').slice(0, 1);
      if (box.value && boxes[index + 1]) boxes[index + 1].focus();
    });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !box.value && boxes[index - 1]) {
        boxes[index - 1].focus();
      }
    });
  });

  document.getElementById('confirmPinBtn').addEventListener('click', function () {
    const enteredPin = Array.from(boxes).map(function (b) { return b.value; }).join('');
    const errorMsg = document.getElementById('pinErrorMsg');

    if (enteredPin.length !== 6) {
      errorMsg.textContent = 'Please enter all 6 digits.';
      errorMsg.classList.remove('is-hidden');
      return;
    }
    if (enteredPin !== DEMO_PIN) {
      errorMsg.textContent = 'Incorrect PIN. Please try again.';
      errorMsg.classList.remove('is-hidden');
      clearPinBoxes();
      return;
    }

    errorMsg.classList.add('is-hidden');
    completeSendMoneyTransfer();
  });

  document.getElementById('pinSuccessDoneBtn').addEventListener('click', function () {
    closeModal('pinModal');
    resetSendMoneyForm();
  });
}

function mockSubmitTransfer() {
  return new Promise(function (resolve) { setTimeout(resolve, 1100); });
}

function completeSendMoneyTransfer() {
  const confirmBtn = document.getElementById('confirmPinBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Processing…';

  mockSubmitTransfer().then(function () {
    const recipient = document.getElementById('pinSummaryRecipient').textContent;
    const amount    = document.getElementById('pinSummaryAmount').textContent;

    document.getElementById('pinSuccessMessage').textContent =
      `${amount} was sent to ${recipient} successfully.`;

    document.getElementById('pinEntryStep').classList.add('is-hidden');
    document.getElementById('pinSuccessStep').classList.remove('is-hidden');

    confirmBtn.disabled = false;
    confirmBtn.innerHTML = 'Confirm Transfer <i class="bi bi-check-lg" aria-hidden="true"></i>';

    showToast('Transfer successful!', 'success');
  });
}

function resetSendMoneyForm() {
  document.getElementById('sendForm').reset();
  resetAccountVerificationUi();
}


/* ================================================================
   14. RECEIVE MONEY ACTIONS (unchanged)
================================================================ */
function initReceiveMoneyActions() {
  document.getElementById('copyReceiveAcctBtn').addEventListener('click', function () {
    const acctNo = document.getElementById('receiveAccountNumber').textContent.trim();
    copyTextToClipboard(acctNo, 'Account number copied to clipboard!');
  });

  document.getElementById('shareAcctBtn').addEventListener('click', function () {
    const shareText = 'Send money to my Nova Finance account: 0012 3456 7890 (Chukwuemeka Okafor, Providus Bank).';

    if (navigator.share) {
      navigator.share({ title: 'Nova Finance account details', text: shareText }).catch(function () {});
    } else {
      copyTextToClipboard(shareText, 'Sharing isn\'t supported here, so we copied the details instead!');
    }
  });
}


/* ================================================================
   15. GENERIC PILL-TAB GROUPS (unchanged)
================================================================ */
function initPillTabGroup(config) {
  const group = document.querySelector(config.groupSelector);
  if (!group) return;

  const tabs = group.querySelectorAll('.pill-tab');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      const targetId = config.idPrefix + tab.dataset.tab;

      const panelClass = config.idPrefix === 'bill-' ? '.bill-form' : '.market-tab-panel';
      document.querySelectorAll(panelClass).forEach(function (panel) {
        panel.classList.toggle('is-active', panel.id === targetId);
      });
    });
  });
}


/* ================================================================
   16. GENERIC AMOUNT-CHIP GROUPS (unchanged)
================================================================ */
function initAmountChipGroups() {
  document.addEventListener('click', function (e) {
    const chip = e.target.closest('.amount-chip');
    if (!chip) return;

    const group = chip.closest('.amount-chip-group');
    const targetInput = document.getElementById(group.dataset.target);
    if (targetInput) targetInput.value = chip.dataset.amount;

    group.querySelectorAll('.amount-chip').forEach(function (c) {
      c.classList.toggle('is-active', c === chip);
    });
  });
}


/* ================================================================
   17. AIRTIME & DATA PANEL (unchanged)
================================================================ */
function initAirtimeDataPanel() {
  const toggleButtons = document.querySelectorAll('#panel-bills .pill-tab[data-type]');
  const airtimeSection = document.getElementById('airtimeSection');
  const dataSection    = document.getElementById('dataSection');
  const buyBtn         = document.getElementById('buyAirtimeDataBtn');

  toggleButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      toggleButtons.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');

      const isAirtime = btn.dataset.type === 'airtime';
      airtimeSection.classList.toggle('is-hidden', !isAirtime);
      dataSection.classList.toggle('is-hidden', isAirtime);
      buyBtn.innerHTML = isAirtime
        ? 'Buy Airtime <i class="bi bi-phone-fill" aria-hidden="true"></i>'
        : 'Buy Data Bundle <i class="bi bi-wifi" aria-hidden="true"></i>';
    });
  });

  const networkCards = document.querySelectorAll('.network-card');
  networkCards.forEach(function (card) {
    card.addEventListener('click', function () {
      networkCards.forEach(function (c) {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      card.classList.add('is-active');
      card.setAttribute('aria-pressed', 'true');
    });
  });

  const bundleCards = document.querySelectorAll('.bundle-card');
  bundleCards.forEach(function (card) {
    card.addEventListener('click', function () {
      bundleCards.forEach(function (c) {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      card.classList.add('is-active');
      card.setAttribute('aria-pressed', 'true');
    });
  });

  document.getElementById('useMyNumberBtn').addEventListener('click', function () {
    const myNumber = document.getElementById('profilePhone').value || '0803 456 7890';
    document.getElementById('airtimePhone').value = myNumber;
  });

  buyBtn.addEventListener('click', function () {
    const network = document.querySelector('.network-card.is-active').dataset.network.toUpperCase();
    const isAirtime = !airtimeSection.classList.contains('is-hidden');

    let message;
    if (isAirtime) {
      const amount = document.getElementById('airtimeAmount').value;
      message = `₦${Number(amount).toLocaleString('en-NG')} ${network} airtime purchased successfully!`;
    } else {
      const bundle = document.querySelector('.bundle-card.is-active');
      message = `${bundle.dataset.size} ${network} data bundle (${bundle.dataset.validity}) activated successfully!`;
    }
    showToast(message, 'success');
  });
}


/* ================================================================
   18. MARKETPLACE EXTRAS (unchanged)
================================================================ */
function initMarketplaceExtras() {
  document.getElementById('openSellModalBtn').addEventListener('click', function () { openModal('sellItemModal'); });
  document.getElementById('openSellModalBtnEmpty').addEventListener('click', function () { openModal('sellItemModal'); });

  document.getElementById('itemPhotoInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      const preview = document.getElementById('itemPhotoPreview');
      preview.src = reader.result;
      preview.classList.remove('is-hidden');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('sellItemForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name  = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;

    addListingToMyListings(name, price);
    closeModal('sellItemModal');
    e.target.reset();
    document.getElementById('itemPhotoPreview').classList.add('is-hidden');
    showToast(`"${name}" was listed for sale!`, 'success');
  });

  document.addEventListener('click', function (e) {
    const actionBtn = e.target.closest('[data-action="confirm-receipt"], [data-action="dispute"]');
    if (!actionBtn) return;

    const orderCard = actionBtn.closest('.order-card');
    const amount = Number(orderCard.dataset.escrowAmount);

    if (actionBtn.dataset.action === 'confirm-receipt') {
      const statusBadge = orderCard.querySelector('[data-role="order-status"]');
      statusBadge.textContent = 'Confirmed';
      statusBadge.className = 'badge badge-success';
      orderCard.querySelectorAll('button').forEach(function (b) { b.disabled = true; b.style.opacity = '0.5'; });
      showToast(`Receipt confirmed — ${formatNaira(amount)} released to the seller.`, 'success');
    } else {
      showToast('Dispute raised. The Nova support team will contact you within 2 hours.', 'warning');
    }
  });
}

function addListingToMyListings(name, price) {
  const container = document.getElementById('market-listings');
  const emptyState = container.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  const row = document.createElement('div');
  row.className = 'order-card';
  row.innerHTML = `
    <div class="order-thumb"><i class="bi bi-tag-fill" aria-hidden="true"></i></div>
    <div class="order-body">
      <strong>${name}</strong>
      <p>Listed just now · Awaiting a buyer</p>
    </div>
    <div class="order-meta"><span class="badge badge-neutral">Live</span><p class="order-escrow-note">₦${Number(price).toLocaleString('en-NG')}</p></div>`;
  container.prepend(row);
}


/* ================================================================
   19. NEW: MARKETPLACE CATEGORY NAVIGATION
   Handles "Previous" / "Next" buttons for each product category.
   Each category's product grid is scrolled horizontally by 1 item.
================================================================ */
function initMarketplaceCategoryNav() {
  document.addEventListener('click', function (e) {
    // Find if the click was on a Previous or Next button
    const prevBtn = e.target.closest('.category-prev');
    const nextBtn = e.target.closest('.category-next');
    if (!prevBtn && !nextBtn) return;

    const category = prevBtn ? prevBtn.dataset.category : nextBtn.dataset.category;
    const grid = document.querySelector(`.product-grid[data-category="${category}"]`);
    if (!grid) return;

    // Get the first product card's width (including gap) to determine scroll amount
    const firstCard = grid.querySelector('.product-card');
    if (!firstCard) return;

    // Calculate the width of one card + gap
    const cardWidth = firstCard.offsetWidth;
    const gap = 14; // matches the gap in CSS
    const scrollAmount = cardWidth + gap;

    if (prevBtn) {
      grid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (nextBtn) {
      grid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  });
}


/* ================================================================
   20. INSURANCE GET COVER BUTTONS (unchanged)
================================================================ */
function initInsuranceGetCoverButtons() {
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-action="get-cover"]');
    if (!btn) return;
    showToast(`Quote request sent for ${btn.dataset.plan}. Our team will reach out shortly.`, 'info');
  });
}


/* ================================================================
   21. LOAN CALCULATOR (unchanged)
================================================================ */
function initLoanCalculator() {
  const slider = document.getElementById('loanAmountSlider');
  const input  = document.getElementById('loanAmountInput');
  const label  = document.getElementById('loanAmountLabel');
  const tenureSelect = document.getElementById('loanTenure');

  function recalculate() {
    const principal = Number(slider.value);
    const months    = Number(tenureSelect.value);
    const monthlyRate = 0.025;

    label.textContent = formatNaira(principal);

    const growth = Math.pow(1 + monthlyRate, months);
    const monthlyPayment = principal * monthlyRate * growth / (growth - 1);
    const totalRepayment = monthlyPayment * months;
    const totalInterest  = totalRepayment - principal;

    document.getElementById('loanMonthlyRepayment').textContent = formatNaira(monthlyPayment);
    document.getElementById('loanTotalRepayment').textContent   = formatNaira(totalRepayment);
    document.getElementById('loanTotalInterest').textContent    = formatNaira(totalInterest);
  }

  slider.addEventListener('input', function () {
    input.value = slider.value;
    recalculate();
  });
  input.addEventListener('input', function () {
    const clamped = Math.min(500000, Math.max(10000, Number(input.value) || 10000));
    slider.value = clamped;
    recalculate();
  });
  tenureSelect.addEventListener('change', recalculate);

  recalculate();

  document.getElementById('makeRepaymentBtn').addEventListener('click', function () {
    showToast('Repayment of ₦16,667 received — thank you!', 'success');
  });
}


/* ================================================================
   22. SMART SAVINGS GOALS (unchanged)
================================================================ */
function initSavingsGoals() {
  document.getElementById('openNewGoalModalBtn').addEventListener('click', function () { openModal('newGoalModal'); });

  document.getElementById('newGoalForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name   = document.getElementById('goalName').value;
    const target = Number(document.getElementById('goalTarget').value);
    const dateVal = document.getElementById('goalDate').value;
    const dateLabel = dateVal
      ? new Date(dateVal + '-02').toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })
      : 'No target date';

    const goalCard = document.createElement('div');
    goalCard.className = 'goal-card';
    goalCard.innerHTML = `
      <div class="goal-head">
        <span class="goal-icon" aria-hidden="true"><i class="bi bi-star-fill"></i></span>
        <span class="goal-meta">
          <strong>${name}</strong>
          <small>₦0 saved of ${formatNaira(target)} target</small>
        </span>
        <span class="goal-date">${dateLabel}</span>
      </div>
      <div class="progress-row">
        <div class="progress-track" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-fill is-gold" style="width:0%"></div>
        </div>
        <span class="progress-pct">0%</span>
      </div>`;

    document.getElementById('savingsGoalList').appendChild(goalCard);

    closeModal('newGoalModal');
    e.target.reset();
    showToast(`New savings goal "${name}" created!`, 'success');
  });
}


/* ================================================================
   23. TRANSACTION HISTORY FILTERS (unchanged)
================================================================ */
function getFilteredTransactions() {
  const search = document.getElementById('historySearchInput').value.trim().toLowerCase();
  const type   = document.getElementById('historyTypeFilter').value;
  const month  = document.getElementById('historyMonthFilter').value;

  return transactions.filter(function (t) {
    const matchesSearch = !search || t.description.toLowerCase().includes(search) || t.subtext.toLowerCase().includes(search);
    const matchesType   = !type || t.type === type;
    const matchesMonth  = !month || t.date.startsWith(month);
    return matchesSearch && matchesType && matchesMonth;
  });
}

function initTransactionHistoryFilters() {
  ['historySearchInput', 'historyTypeFilter', 'historyMonthFilter'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      renderHistoryTransactions(getFilteredTransactions());
    });
  });

  document.getElementById('exportHistoryBtn').addEventListener('click', exportHistoryToCsv);
}

function exportHistoryToCsv() {
  const rows = getFilteredTransactions();
  const header = ['Type', 'Description', 'Date', 'Reference', 'Amount (NGN)', 'Status'];

  const csvLines = [header.join(',')];
  rows.forEach(function (t) {
    const safeDescription = `"${t.description.replace(/"/g, '""')}"`;
    csvLines.push([t.type, safeDescription, t.date, t.reference, t.amount, t.status].join(','));
  });

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'nova-finance-transaction-history.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('Transaction history exported as CSV.', 'success');
}


/* ================================================================
   24. PROFILE PANEL (unchanged, except virtual card is separate)
================================================================ */
function initProfilePanel() {
  document.getElementById('changePhotoBtn').addEventListener('click', function () {
    document.getElementById('avatarFileInput').click();
  });
  document.getElementById('avatarFileInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      const avatarEl = document.getElementById('profileAvatar');
      avatarEl.style.backgroundImage = `url(${reader.result})`;
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.style.backgroundPosition = 'center';
      avatarEl.textContent = '';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('changePinOpenBtn').addEventListener('click', function () { openModal('changePinModal'); });

  document.getElementById('changePinForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const oldPin     = document.getElementById('oldPinInput').value;
    const newPin     = document.getElementById('newPinInput').value;
    const confirmPin = document.getElementById('confirmPinInput').value;
    const errorEl    = document.getElementById('changePinErrorMsg');

    if (oldPin !== DEMO_PIN) {
      errorEl.textContent = 'Current PIN is incorrect.';
      errorEl.classList.remove('is-hidden');
      return;
    }
    if (!/^\d{6}$/.test(newPin)) {
      errorEl.textContent = 'New PIN must be exactly 6 digits.';
      errorEl.classList.remove('is-hidden');
      return;
    }
    if (newPin !== confirmPin) {
      errorEl.textContent = 'New PIN and confirmation do not match.';
      errorEl.classList.remove('is-hidden');
      return;
    }

    errorEl.classList.add('is-hidden');
    closeModal('changePinModal');
    e.target.reset();
    showToast('Transaction PIN updated successfully!', 'success');
  });

  document.getElementById('twoFaToggle').addEventListener('change', function (e) {
    showToast(e.target.checked ? 'Two-factor authentication enabled.' : 'Two-factor authentication disabled.', 'info');
  });
  document.getElementById('bioToggle').addEventListener('change', function (e) {
    showToast(e.target.checked ? 'Biometric login enabled.' : 'Biometric login disabled.', 'info');
  });
}


/* ================================================================
   25. NEW: VIRTUAL CARD (Overview panel)
   Shows a compact card preview with a "Copy Number" button.
================================================================ */
function initVirtualCardOverview() {
  const copyBtn = document.getElementById('vcCopyNumberBtn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', function () {
    // The card number shown on the overview card is masked.
    // We copy the full unmasked number (demo value).
    const fullNumber = '4532 1234 5678 7890';
    copyTextToClipboard(fullNumber, 'Virtual card number copied to clipboard!');
  });
}


/* ================================================================
   26. NEW: VIRTUAL CARD (Profile panel)
   Full management: toggle CVC, number, PIN visibility; block/unblock;
   copy all details.
================================================================ */
function initVirtualCardProfile() {
  // ---- Toggle visibility of card details (CVC, number, PIN) ----
  const toggleBtns = document.querySelectorAll('.vc-toggle-btn');
  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      // The data-reveal attribute holds the actual value to show.
      const revealValue = btn.dataset.reveal;

      // If the current text is masked (contains * or •), reveal it.
      // Otherwise, mask it again.
      const isMasked = targetEl.textContent.includes('*') || targetEl.textContent.includes('•');
      if (isMasked) {
        targetEl.textContent = revealValue;
        btn.innerHTML = '<i class="bi bi-eye-slash" aria-hidden="true"></i>';
      } else {
        // Mask it based on the type of field
        const label = targetEl.closest('.vc-detail-item').querySelector('.vc-detail-label');
        if (label) {
          const labelText = label.textContent.trim();
          if (labelText === 'Card Number') {
            targetEl.textContent = '**** **** **** 7890';
          } else if (labelText === 'CVC') {
            targetEl.textContent = '***';
          } else if (labelText === 'PIN') {
            targetEl.textContent = '****';
          }
        }
        btn.innerHTML = '<i class="bi bi-eye" aria-hidden="true"></i>';
      }
    });
  });

  // ---- Block / Unblock card ----
  const blockBtn = document.getElementById('vcBlockBtn');
  const statusEl = document.getElementById('vcStatus');
  let isBlocked = false;

  if (blockBtn && statusEl) {
    blockBtn.addEventListener('click', function () {
      isBlocked = !isBlocked;
      if (isBlocked) {
        blockBtn.innerHTML = '<i class="bi bi-unlock-fill" aria-hidden="true"></i> Unblock Card';
        blockBtn.className = 'btn btn-primary btn-sm';
        statusEl.innerHTML = '<i class="bi bi-lock-fill" aria-hidden="true"></i> Blocked';
        statusEl.className = 'vc-status is-blocked';
        showToast('Virtual card has been blocked.', 'warning');
      } else {
        blockBtn.innerHTML = '<i class="bi bi-lock-fill" aria-hidden="true"></i> Block Card';
        blockBtn.className = 'btn btn-danger-outline btn-sm';
        statusEl.innerHTML = '<i class="bi bi-check-circle-fill" aria-hidden="true"></i> Active';
        statusEl.className = 'vc-status';
        showToast('Virtual card has been unblocked.', 'success');
      }
    });
  }

  // ---- Copy all card details ----
  const copyDetailsBtn = document.getElementById('vcCopyDetailsBtn');
  if (copyDetailsBtn) {
    copyDetailsBtn.addEventListener('click', function () {
      const cardNumber = '4532 1234 5678 7890';
      const cvc = '123';
      const pin = '4567';
      const expiry = '12/27';
      const holder = 'Chukwuemeka Okafor';

      const details = `Card: ${cardNumber}\nCVC: ${cvc}\nPIN: ${pin}\nExpiry: ${expiry}\nHolder: ${holder}`;
      copyTextToClipboard(details, 'Card details copied to clipboard!');
    });
  }
}


/* ================================================================
   27. LOGOUT (unchanged)
================================================================ */
function initLogout() {
  document.getElementById('logoutBtn').addEventListener('click', function () { openModal('logoutConfirmModal'); });

  document.getElementById('confirmLogoutBtn').addEventListener('click', function () {
    showToast('Logged out successfully. Redirecting…', 'success');
    setTimeout(function () { window.location.href = '../index.html'; }, 1200);
  });
}


/* ================================================================
   28. GENERIC MOCK SUBMIT FORMS (unchanged)
================================================================ */
function initGenericMockSubmitForms() {
  document.querySelectorAll('form[data-mock-submit]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalLabel = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Processing…';
      }

      setTimeout(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalLabel;
        }
        showToast(form.dataset.mockSubmit, 'success');
        form.reset();
      }, 1200);
    });
  });
}