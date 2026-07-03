/*
================================================================================
  NOVA FINANCE — ADMIN DASHBOARD JAVASCRIPT
  File:    admin-dashboard.js
  Pairs with: admin-dashboard.html, admin-dashboard.css

  HOW THIS FILE IS ORGANISED
  ----------------------------
  1.  Entry point (runs everything once the page has loaded)
  2.  Mock data (stands in for your future PHP/MySQL backend)
  3.  Small shared helpers (formatting, toasts, modals)
  4.  SPA panel navigation (the routing engine)
  5.  Header widgets (sidebar, notifications, user menu, global search)
  6.  One section per dashboard panel (Overview, Users & KYC, Ledger,
      Owealth, Billers, Marketplace, Settings)
  7.  Shared generic helpers (mock-submit forms, logout)

  HOW TO CONNECT YOUR REAL PHP BACKEND LATER
  ---------------------------------------------
  Search this file for the words "BACKEND INTEGRATION POINT". Every
  fetchX() function below already returns a Promise — exactly the shape
  a real fetch() call returns — so swapping the mock data for a real
  network request is a one-function change, not a rewrite. For example:

    function fetchUsers() {
      return new Promise(function (resolve) {
        setTimeout(function () { resolve(USERS); }, 500); // <-- MOCK
      });
    }

  becomes:

    function fetchUsers() {
      return fetch('/api/admin/users.php')                // <-- REAL
        .then(function (res) { return res.json(); });
    }

  Nothing that CALLS fetchUsers() needs to change at all.
================================================================================
*/


/* ================================================================
   1. ENTRY POINT
   This whole block waits for the HTML to be fully parsed before
   touching the DOM — otherwise getElementById() calls below would
   return null because the elements wouldn't exist yet.
================================================================ */
document.addEventListener('DOMContentLoaded', function () {

  // ---- Chrome / shell behaviour (sidebar, header dropdowns, routing) ----
  initPanelNavigation();
  initMobileSidebar();
  initNotificationsDropdown();
  initUserMenuDropdown();
  initGlobalSearch();
  initConfirmModalEngine();

  // ---- Panel 1: Overview ----
  initOverviewPanel();

  // ---- Panel 2: Users & KYC ----
  initUsersPanel();

  // ---- Panel 3: Transaction Ledger ----
  initLedgerPanel();

  // ---- Panel 4: Owealth ----
  initOwealthPanel();

  // ---- Panel 5: Billers & Top-Ups ----
  initBillersPanel();

  // ---- Panel 6: Mini Marketplace ----
  initMarketplacePanel();

  // ---- Panel 7: System Settings ----
  initSettingsPanel();

  // ---- Shared / generic behaviour ----
  initGenericMockSubmitForms();
  initLogout();

  console.log('Nova Finance Command Center ready.');
});


/* ================================================================
   2. MOCK DATA
   This stands in for your PHP/MySQL backend until it exists. Every
   array below is shaped exactly like a real API response would be,
   so the render functions further down won't need to change later.
================================================================ */

// ---- The admin currently "logged in" — swap for real session data later ----
const CURRENT_ADMIN_ID = 'ADM-1';

// ---- Registered platform users, for the Users & KYC panel ----
const USERS = [
  { id: 'USR-1001', name: 'Chukwuemeka Okafor', email: 'chukwu.okafor@email.com', phone: '+234 803 456 7890', balance: 1250000, tier: 'Tier 3', kycStatus: 'Verified', accountStatus: 'Active', joined: '2023-02-14' },
  { id: 'USR-1002', name: 'Adaeze Nwachukwu',  email: 'adaeze.nwa@email.com',    phone: '+234 805 234 1190', balance: 320500,  tier: 'Tier 2', kycStatus: 'Verified', accountStatus: 'Active', joined: '2023-05-02' },
  { id: 'USR-1003', name: 'Emeka Nwosu',       email: 'emeka.nwosu@email.com',  phone: '+234 802 119 4456', balance: 87250,   tier: 'Tier 1', kycStatus: 'Verified', accountStatus: 'Active', joined: '2023-07-19' },
  { id: 'USR-1004', name: 'Dr. Ngozi Dike',    email: 'ngozi.dike@email.com',   phone: '+234 807 654 3322', balance: 2104000, tier: 'Tier 3', kycStatus: 'Verified', accountStatus: 'Active', joined: '2022-11-30' },
  { id: 'USR-1005', name: 'Ikechukwu Eze',     email: 'ike.eze@email.com',      phone: '+234 809 887 2201', balance: 54300,   tier: 'Tier 1', kycStatus: 'Verified', accountStatus: 'Active', joined: '2024-01-08' },
  { id: 'USR-1006', name: 'Tobi Adewale',      email: 'tobi.adewale@email.com', phone: '+234 813 220 7765', balance: 12000,   tier: 'Tier 1', kycStatus: 'Pending',  accountStatus: 'Active', joined: '2026-06-20' },
  { id: 'USR-1007', name: 'Funmilayo Bello',   email: 'funmi.bello@email.com',  phone: '+234 816 442 9981', balance: 8500,    tier: 'Tier 1', kycStatus: 'Pending',  accountStatus: 'Active', joined: '2026-06-21' },
  { id: 'USR-1008', name: 'Grace Effiong',     email: 'grace.effiong@email.com',phone: '+234 814 778 0023', balance: 21750,  tier: 'Tier 1', kycStatus: 'Pending',  accountStatus: 'Active', joined: '2026-06-22' },
  { id: 'USR-1009', name: 'Chidi Umeh',        email: 'chidi.umeh@email.com',   phone: '+234 811 556 0099', balance: 4300,   tier: 'Tier 1', kycStatus: 'Rejected', accountStatus: 'Active', joined: '2026-05-30' },
  { id: 'USR-1010', name: 'Bola Adeyemi',      email: 'bola.adeyemi@email.com', phone: '+234 818 332 6671', balance: 615000, tier: 'Tier 2', kycStatus: 'Verified', accountStatus: 'Frozen', joined: '2023-09-12' },
  { id: 'USR-1011', name: 'Samuel Okonkwo',    email: 'sam.okonkwo@email.com',  phone: '+234 803 990 1144', balance: 198400, tier: 'Tier 2', kycStatus: 'Verified', accountStatus: 'Frozen', joined: '2023-12-03' },
  { id: 'USR-1012', name: 'Aisha Mohammed',    email: 'aisha.m@email.com',      phone: '+234 806 221 8834', balance: 432900, tier: 'Tier 2', kycStatus: 'Verified', accountStatus: 'Active', joined: '2024-03-21' },
];

// ---- Platform-wide transaction ledger, for the Overview feed + Ledger panel ----
const LEDGER_TRANSACTIONS = [
  { reference: 'NVA-LG-30021', user: 'Chukwuemeka Okafor', type: 'Transfer',     description: 'Transfer to Emeka Nwosu',          amount: -50000,  status: 'Success', date: '2026-06-22T09:15' },
  { reference: 'NVA-LG-30020', user: 'Dr. Ngozi Dike',     type: 'Loan',         description: 'Personal loan disbursement',       amount: 150000,  status: 'Success', date: '2026-06-22T08:50' },
  { reference: 'NVA-LG-30019', user: 'Bola Adeyemi',       type: 'Marketplace',  description: 'Sale — Samsung Galaxy A54',        amount: 185000,  status: 'Pending', date: '2026-06-22T08:10' },
  { reference: 'NVA-LG-30018', user: 'Aisha Mohammed',     type: 'Bill Payment', description: 'EEDC Electricity (Prepaid)',       amount: -15000,  status: 'Success', date: '2026-06-21T19:40' },
  { reference: 'NVA-LG-30017', user: 'Tobi Adewale',       type: 'Airtime/Data', description: 'MTN Data Bundle — 5GB',            amount: -1200,   status: 'Failed',  date: '2026-06-21T17:05' },
  { reference: 'NVA-LG-30016', user: 'Samuel Okonkwo',     type: 'Transfer',     description: 'Transfer to Adaeze Nwachukwu',     amount: -220000, status: 'Success', date: '2026-06-21T15:22' },
  { reference: 'NVA-LG-30015', user: 'Ikechukwu Eze',      type: 'Savings',      description: 'Auto-save deposit — Rent Goal',    amount: -10000,  status: 'Success', date: '2026-06-21T12:00' },
  { reference: 'NVA-LG-30014', user: 'Grace Effiong',      type: 'Bill Payment', description: 'DStv Compact Subscription',       amount: -15700,  status: 'Success', date: '2026-06-21T10:18' },
  { reference: 'NVA-LG-30013', user: 'Funmilayo Bello',    type: 'Airtime/Data', description: 'Airtel Airtime Top-Up',           amount: -1000,   status: 'Success', date: '2026-06-20T21:47' },
  { reference: 'NVA-LG-30012', user: 'Emeka Nwosu',        type: 'Marketplace',  description: 'Purchase — Logitech MX Keys S',   amount: -45000,  status: 'Success', date: '2026-06-20T18:30' },
  { reference: 'NVA-LG-30011', user: 'Chidi Umeh',         type: 'Transfer',     description: 'Salary credit — Zenith Bank',     amount: 240000,  status: 'Success', date: '2026-06-20T09:05' },
  { reference: 'NVA-LG-30010', user: 'Adaeze Nwachukwu',   type: 'Loan',         description: 'Loan repayment instalment',       amount: -16667,  status: 'Success', date: '2026-06-19T14:12' },
  { reference: 'NVA-LG-30009', user: 'Bola Adeyemi',       type: 'Bill Payment', description: 'Imo Water Corp bill',             amount: -3200,   status: 'Failed',  date: '2026-06-19T11:55' },
  { reference: 'NVA-LG-30008', user: 'Dr. Ngozi Dike',     type: 'Savings',      description: 'Withdrawal — Emergency Fund',     amount: -50000,  status: 'Success', date: '2026-06-18T16:40' },
  { reference: 'NVA-LG-30007', user: 'Samuel Okonkwo',     type: 'Airtime/Data', description: 'Glo Data Bundle — 10GB',          amount: -2500,   status: 'Pending', date: '2026-06-18T10:02' },
  { reference: 'NVA-LG-30006', user: 'Aisha Mohammed',     type: 'Marketplace',  description: 'Sale — JBL Flip 6 Speaker',       amount: 65000,   status: 'Success', date: '2026-06-17T20:15' },
  { reference: 'NVA-LG-30005', user: 'Ikechukwu Eze',      type: 'Transfer',     description: 'Transfer to Chukwuemeka Okafor',  amount: -30000,  status: 'Success', date: '2026-06-17T08:30' },
  { reference: 'NVA-LG-30004', user: 'Chukwuemeka Okafor', type: 'Bill Payment', description: 'GOtv Max Subscription',          amount: -6200,   status: 'Success', date: '2026-06-16T13:00' },
];

// ---- Loan book, for the Owealth panel ----
const LOANS = [
  { id: 'LN-2031', user: 'Chukwuemeka Okafor', principal: 150000, tenure: '6 months',  outstanding: 100000, status: 'Active',    nextDue: '2026-07-15' },
  { id: 'LN-2030', user: 'Dr. Ngozi Dike',     principal: 500000, tenure: '12 months', outstanding: 420000, status: 'Active',    nextDue: '2026-07-02' },
  { id: 'LN-2029', user: 'Adaeze Nwachukwu',   principal: 80000,  tenure: '3 months',  outstanding: 0,      status: 'Completed', nextDue: '—' },
  { id: 'LN-2028', user: 'Bola Adeyemi',       principal: 220000, tenure: '6 months',  outstanding: 220000, status: 'Overdue',   nextDue: '2026-06-10' },
  { id: 'LN-2027', user: 'Samuel Okonkwo',     principal: 95000,  tenure: '3 months',  outstanding: 95000,  status: 'Defaulted', nextDue: '2026-05-28' },
  { id: 'LN-2026', user: 'Emeka Nwosu',        principal: 60000,  tenure: '1 month',   outstanding: 0,      status: 'Completed', nextDue: '—' },
  { id: 'LN-2025', user: 'Aisha Mohammed',     principal: 310000, tenure: '12 months', outstanding: 280000, status: 'Active',    nextDue: '2026-07-05' },
  { id: 'LN-2024', user: 'Ikechukwu Eze',      principal: 45000,  tenure: '3 months',  outstanding: 30000,  status: 'Active',    nextDue: '2026-06-29' },
];

// ---- Largest active savings goals across all users, for the Owealth panel ----
const SAVINGS_VAULTS = [
  { user: 'Dr. Ngozi Dike',     goalName: 'New Clinic Equipment', target: 2000000, saved: 1450000 },
  { user: 'Chukwuemeka Okafor', goalName: 'House Rent 2025',      target: 450000,  saved: 270000  },
  { user: 'Aisha Mohammed',     goalName: 'Wedding Fund',         target: 1200000, saved: 640000  },
  { user: 'Bola Adeyemi',       goalName: 'Shop Inventory',       target: 800000,  saved: 512000  },
  { user: 'Ikechukwu Eze',      goalName: 'Emergency Fund',       target: 200000,  saved: 85000   },
  { user: 'Funmilayo Bello',    goalName: 'School Fees',          target: 350000,  saved: 96000   },
];

// ---- Airtime/Data (VTU) network providers, for the Billers panel ----
// costPrice and marginPercent are both percentages of the face value of
// the airtime/data being sold (e.g. 97% cost + 3% margin = 100% charged to the user).
const VTU_PROVIDERS = [
  { id: 'mtn',     name: 'MTN',     costPrice: 97.0, marginPercent: 3.0, enabled: true  },
  { id: 'airtel',  name: 'Airtel',  costPrice: 96.5, marginPercent: 3.5, enabled: true  },
  { id: 'glo',     name: 'Glo',     costPrice: 95.0, marginPercent: 5.0, enabled: true  },
  { id: '9mobile', name: '9mobile', costPrice: 96.0, marginPercent: 4.0, enabled: false },
];

// ---- Utility / subscription billers, for the Billers panel ----
const UTILITY_BILLERS = [
  { name: 'EEDC Electricity',  category: 'Electricity', successRate: 98.4, apiStatus: 'Online',      lastChecked: '2 minutes ago' },
  { name: 'IKEDC Electricity', category: 'Electricity', successRate: 97.1, apiStatus: 'Online',      lastChecked: '2 minutes ago' },
  { name: 'KPLC Electricity',  category: 'Electricity', successRate: 91.8, apiStatus: 'Maintenance', lastChecked: '5 minutes ago' },
  { name: 'DStv',               category: 'TV',          successRate: 99.2, apiStatus: 'Online',      lastChecked: '3 minutes ago' },
  { name: 'GOtv',               category: 'TV',          successRate: 98.9, apiStatus: 'Online',      lastChecked: '3 minutes ago' },
  { name: 'Imo Water Corp',     category: 'Water',       successRate: 95.5, apiStatus: 'Online',      lastChecked: '6 minutes ago' },
  { name: 'Bet9ja',             category: 'Betting',     successRate: 99.6, apiStatus: 'Online',      lastChecked: '1 minute ago'  },
];

// ---- Marketplace listings awaiting moderation, for the Marketplace panel ----
const MARKETPLACE_LISTINGS = [
  { id: 'LST-501', itemName: 'iPhone 12 (Used)',          seller: 'Tobi Adewale',    category: 'Phones & Accessories', price: 280000, submitted: '2026-06-21' },
  { id: 'LST-502', itemName: 'Generator — Mikano 5kVA',   seller: 'Chidi Umeh',      category: 'Electronics',          price: 320000, submitted: '2026-06-21' },
  { id: 'LST-503', itemName: 'Office Chair (Ergonomic)',  seller: 'Grace Effiong',   category: 'Home & Furniture',     price: 38000,  submitted: '2026-06-20' },
  { id: 'LST-504', itemName: 'Canon EOS 2000D Camera',    seller: 'Funmilayo Bello', category: 'Electronics',          price: 210000, submitted: '2026-06-20' },
  { id: 'LST-505', itemName: 'Ankara Fabric Bundle (x6)', seller: 'Aisha Mohammed',  category: 'Fashion & Clothing',   price: 24000,  submitted: '2026-06-19' },
  { id: 'LST-506', itemName: 'Study Table + Bookshelf',   seller: 'Samuel Okonkwo',  category: 'Home & Furniture',     price: 56000,  submitted: '2026-06-19' },
];

// ---- Staff who can log into this Command Center, for the Settings panel ----
const ADMIN_ACCOUNTS = [
  { id: 'ADM-1', name: 'Adaeze Balogun', email: 'adaeze.balogun@novafinance.ng', role: 'Super Admin',      status: 'Active' },
  { id: 'ADM-2', name: 'Tunde Bakare',   email: 'tunde.bakare@novafinance.ng',   role: 'Finance Admin',    status: 'Active' },
  { id: 'ADM-3', name: 'Chiamaka Eze',   email: 'chiamaka.eze@novafinance.ng',   role: 'Support Admin',    status: 'Active' },
  { id: 'ADM-4', name: 'Yusuf Garba',    email: 'yusuf.garba@novafinance.ng',    role: 'Compliance Admin', status: 'Active' },
];

// ---- Pre-canned numbers shown on the Overview KPI cards per reporting period ----
// In production these four numbers would come from a single backend
// aggregate-stats endpoint (e.g. /api/admin/overview-stats.php?period=week).
const PERIOD_METRICS = {
  today:   { inflow: '₦18,920,000',    inflowChange: '+2.1%',  users: '48,210', usersChange: '+0.3%',  revenue: '₦1,140,000',   revenueChange: '+1.8%',  uptime: '99.97%' },
  week:    { inflow: '₦128,450,000',   inflowChange: '+12.4%', users: '48,210', usersChange: '+3.8%',  revenue: '₦9,820,000',   revenueChange: '+8.1%',  uptime: '99.95%' },
  month:   { inflow: '₦512,300,000',   inflowChange: '+18.9%', users: '48,210', usersChange: '+9.1%',  revenue: '₦38,640,000',  revenueChange: '+14.2%', uptime: '99.92%' },
  quarter: { inflow: '₦1,486,700,000', inflowChange: '+27.5%', users: '48,210', usersChange: '+22.4%', revenue: '₦112,950,000', revenueChange: '+24.0%', uptime: '99.88%' },
};


/* ================================================================
   3. SMALL SHARED HELPERS
   Generic utility functions used by several panels at once.
================================================================ */

// Formats a number as a Nigerian Naira string, e.g. -50000 -> "-₦50,000"
function formatNaira(amount) {
  const sign = amount < 0 ? '-' : '';
  return sign + '₦' + Math.abs(Math.round(amount)).toLocaleString('en-NG');
}

// Formats an ISO date/time string into something like "Jun 22, 9:15am"
function formatDateTime(isoString) {
  const d = new Date(isoString);
  const datePart = d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  const timePart = d.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  return `${datePart}, ${timePart}`;
}

// Formats a plain "YYYY-MM-DD" date into something like "Jun 22, 2026"
function formatDateOnly(isoDateString) {
  if (!isoDateString || isoDateString === '—') return '—';
  const d = new Date(isoDateString + 'T00:00');
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Turns two initials out of a full name, e.g. "Tobi Adewale" -> "TA" (used for avatar circles)
function initialsFromName(name) {
  const parts = name.replace('Dr. ', '').trim().split(' ');
  return ((parts[0] || '')[0] || '') + ((parts[1] || '')[0] || '');
}

// Maps every status word used anywhere in the app to a consistent badge colour.
// Centralising this in ONE map means every table's status column looks/behaves
// identically, and adding a brand-new status later is a one-line change.
const STATUS_BADGE_MAP = {
  Success: 'badge-success', Active: 'badge-success', Verified: 'badge-success',
  Online: 'badge-success', Completed: 'badge-success',
  Pending: 'badge-warning', Maintenance: 'badge-warning',
  Failed: 'badge-danger', Frozen: 'badge-danger', Rejected: 'badge-danger',
  Defaulted: 'badge-danger', Offline: 'badge-danger', Overdue: 'badge-danger',
};
function statusBadgeHtml(status) {
  const cls = STATUS_BADGE_MAP[status] || 'badge-neutral';
  return `<span class="badge ${cls}">${status}</span>`;
}

// Shows a small pop-up confirmation message in the bottom-right corner.
// type can be 'success' | 'warning' | 'error' | 'info'.
function showToast(message, type) {
  type = type || 'success';
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast is-${type}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message; // textContent (not innerHTML) keeps this safe from any HTML injection
  container.appendChild(toast);

  // Two nested rAF calls let the browser paint the toast at opacity:0 FIRST,
  // so the CSS transition to opacity:1 actually has something to animate from.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { toast.classList.add('is-visible'); });
  });

  setTimeout(function () {
    toast.classList.remove('is-visible');
    setTimeout(function () { toast.remove(); }, 250); // wait for the fade-out transition before removing from the DOM
  }, 3200);
}

// ---- Generic modal open/close engine ----
// Every modal on this page (confirm dialogs, profile view, add admin, logout)
// shares this exact mechanism, so behaviour (focus handling, Escape key,
// backdrop click) only has to be written and tested once.
let lastFocusedBeforeModal = null;
const openModalIds = new Set();

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  lastFocusedBeforeModal = document.activeElement; // remember what was focused, to restore it later
  modal.removeAttribute('hidden');
  openModalIds.add(modalId);
  document.body.style.overflow = 'hidden'; // stops the page scrolling behind the modal

  // Accessibility: move keyboard focus INTO the modal the instant it opens
  const focusTarget = modal.querySelector('.modal-close-btn, input, select, textarea, button');
  if (focusTarget) focusTarget.focus();
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.setAttribute('hidden', '');
  openModalIds.delete(modalId);

  if (openModalIds.size === 0) document.body.style.overflow = ''; // re-enable page scroll once ALL modals are closed

  // Accessibility: give keyboard focus back to whatever triggered the modal
  if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
    lastFocusedBeforeModal.focus();
  }
}

// Clicking anything with [data-modal-close], or clicking the dark backdrop
// itself (if it opts in via data-modal-close-on-backdrop), closes that modal.
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

// Pressing Escape closes whichever modal was opened most recently.
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && openModalIds.size > 0) {
    const ids = Array.from(openModalIds);
    closeModal(ids[ids.length - 1]);
  }
});


/* ================================================================
   3b. GENERIC "CONFIRM ACTION" MODAL
   One single modal in the HTML (#confirmActionModal) is reused for
   EVERY yes/no confirmation in the whole admin panel: freezing an
   account, approving KYC, approving/rejecting a listing, removing an
   admin, etc. This keeps the HTML small and guarantees every
   confirmation in the app looks and behaves identically.
================================================================ */

// Holds whatever function should run if the admin clicks "Confirm".
// It is set right before the modal opens, and cleared immediately after use.
let pendingConfirmCallback = null;

// Opens the shared confirm modal with custom text and a custom callback.
//   title        - short heading, e.g. "Freeze Account"
//   description  - the question/explanation shown to the admin
//   confirmLabel - text on the confirm button, e.g. "Freeze Account"
//   isDangerous  - true = red/destructive-style button, false = gold/primary
//   onConfirm    - function to run ONLY if the admin actually confirms
function openConfirmModal(title, description, confirmLabel, isDangerous, onConfirm) {
  document.getElementById('confirmActionTitle').innerHTML =
    `<i class="bi bi-question-circle-fill text-gold" aria-hidden="true"></i> ${title}`;
  document.getElementById('confirmActionDesc').textContent = description;

  const confirmBtn = document.getElementById('confirmActionBtn');
  confirmBtn.textContent = confirmLabel || 'Confirm';
  confirmBtn.classList.toggle('btn-danger-outline', !!isDangerous);
  confirmBtn.classList.toggle('btn-primary', !isDangerous);

  pendingConfirmCallback = onConfirm;
  openModal('confirmActionModal');
}

// Wires the single "Confirm" button inside the shared modal, once, at startup.
function initConfirmModalEngine() {
  document.getElementById('confirmActionBtn').addEventListener('click', function () {
    const callback = pendingConfirmCallback;
    pendingConfirmCallback = null; // always clear it, even if there's nothing to run
    closeModal('confirmActionModal');
    if (typeof callback === 'function') callback();
  });
}


/* ================================================================
   4. SPA PANEL NAVIGATION (the routing engine)
   This is the entire mechanism behind "clicking a sidebar tab changes
   the page without reloading it". Every clickable nav element in the
   HTML carries a "data-panel" attribute whose value matches a
   <section id="..."> further down the page.
================================================================ */

// Maps every panel id to the text shown in the header's page title.
const PANEL_TITLES = {
  'panel-overview':    'Overview',
  'panel-users':       'Users & KYC',
  'panel-ledger':      'Transaction Ledger',
  'panel-owealth':     'Owealth',
  'panel-billers':     'Billers & Top-Ups',
  'panel-marketplace': 'Mini Marketplace',
  'panel-settings':    'System Settings',
};

// Shows the requested panel and hides every other one. Also keeps the
// sidebar, bottom nav, and header title in sync with whatever is showing.
function setActivePanel(panelId) {
  if (!PANEL_TITLES[panelId]) return; // ignore unknown / malformed panel ids defensively

  // Show only the matching <section>; CSS hides everything else by default
  document.querySelectorAll('.dash-panel').forEach(function (panel) {
    panel.classList.toggle('is-active', panel.id === panelId);
  });

  // Highlight the matching nav button in BOTH the sidebar and the mobile bottom bar
  document.querySelectorAll('.sidebar-nav-link, .bottom-nav-link').forEach(function (link) {
    const isMatch = link.dataset.panel === panelId;
    link.classList.toggle('is-active', isMatch);
    if (isMatch) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  // Update the <h1> in the header so it always names the panel you're looking at
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = PANEL_TITLES[panelId];

  // Scroll the content area back to the top every time you switch panels
  const content = document.getElementById('adminContent');
  if (content) content.scrollTop = 0;

  // Remember the last open panel so a page refresh lands you back where you were
  localStorage.setItem('novaAdminActivePanel', panelId);
}

// Attaches ONE click listener to the whole document (event delegation) instead
// of one listener per button. Any element with [data-panel] — sidebar links,
// "View All" buttons, the gear icon, the bottom nav — is automatically routed.
function initPanelNavigation() {
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-panel]');
    if (!trigger) return;

    setActivePanel(trigger.dataset.panel);

    // On mobile, switching panels should also close the sidebar drawer
    document.getElementById('appShell').classList.remove('sidebar-open');
    document.getElementById('sidebarOverlay').classList.remove('is-visible');

    // If the click came from inside the user-account dropdown, close that too
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown && !userDropdown.hasAttribute('hidden')) {
      userDropdown.setAttribute('hidden', '');
    }
  });

  // On first load, restore whichever panel the admin was last looking at
  const saved = localStorage.getItem('novaAdminActivePanel');
  setActivePanel(saved && PANEL_TITLES[saved] ? saved : 'panel-overview');
}


/* ================================================================
   5. HEADER + SIDEBAR WIDGETS
================================================================ */

// Handles opening/closing the sidebar as a slide-in drawer on small screens.
function initMobileSidebar() {
  const appShell = document.getElementById('appShell');
  const overlay  = document.getElementById('sidebarOverlay');
  const openBtn  = document.getElementById('sidebarToggleBtn');
  const closeBtn = document.getElementById('sidebarCloseBtn');

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
  overlay.addEventListener('click', closeSidebar); // tapping the dimmed backdrop also closes it
}

// Handles showing/hiding the notifications dropdown and the "mark all read" action.
function initNotificationsDropdown() {
  const bellBtn = document.getElementById('notifBtn');
  const dropdown = document.getElementById('notifDropdown');
  const markReadBtn = document.getElementById('markAllReadBtn');

  bellBtn.addEventListener('click', function (e) {
    e.stopPropagation(); // stops this click from also triggering the document-wide "close dropdown" listener below
    const isOpen = !dropdown.hasAttribute('hidden');
    if (isOpen) {
      dropdown.setAttribute('hidden', '');
      bellBtn.setAttribute('aria-expanded', 'false');
    } else {
      dropdown.removeAttribute('hidden');
      bellBtn.setAttribute('aria-expanded', 'true');
    }
  });

  // Clicking anywhere OUTSIDE the dropdown closes it
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
    showToast('All notifications marked as read.', 'success');
  });
}

// Handles showing/hiding the admin account dropdown (Account Settings / Activity Log / Log Out).
function initUserMenuDropdown() {
  const menuBtn = document.getElementById('userMenuBtn');
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

  document.getElementById('userMenuLogoutBtn').addEventListener('click', function () {
    dropdown.setAttribute('hidden', '');
    openModal('logoutConfirmModal');
  });

  // Placeholder for a future "audit trail of everything this admin has done" screen
  document.getElementById('activityLogBtn').addEventListener('click', function () {
    dropdown.setAttribute('hidden', '');
    showToast('Activity log coming soon — every action you take here will be recorded.', 'info');
  });
}

// Pressing Enter in the global header search jumps to the Transaction
// Ledger and pre-fills its own search box with the same term — a small
// but genuinely useful cross-panel shortcut for a busy admin.
function initGlobalSearch() {
  const input = document.getElementById('globalSearchInput');
  input.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    const term = input.value.trim();
    if (!term) return;

    setActivePanel('panel-ledger');
    const ledgerSearch = document.getElementById('ledgerSearchInput');
    ledgerSearch.value = term;
    ledgerCurrentPage = 1;
    renderLedgerTable();
    showToast(`Showing ledger results for "${term}".`, 'info');
  });
}


/* ================================================================
   6. PANEL: OVERVIEW
================================================================ */

// Builds the rows of the "Live Transaction Activity" table from the
// most recent entries in the ledger (newest first, as already ordered above).
function renderOverviewLiveTable() {
  const tbody = document.getElementById('overviewLiveTxnBody');
  const rows = LEDGER_TRANSACTIONS.slice(0, 6).map(function (t) {
    const amountClass = t.amount < 0 ? 'amt-debit' : 'amt-credit';
    return `
      <tr>
        <td><code>${t.reference}</code></td>
        <td>${t.user}</td>
        <td>${t.type}</td>
        <td class="${amountClass}">${formatNaira(t.amount)}</td>
        <td>${statusBadgeHtml(t.status)}</td>
        <td>${formatDateTime(t.date)}</td>
        <td>
          <button type="button" class="btn btn-outline btn-sm" data-action="view-transaction" data-txn-id="${t.reference}">
            View Detail
          </button>
        </td>
      </tr>`;
  }).join('');
  tbody.innerHTML = rows;
}

// Fills the API/biller health side-widget list with live-looking status rows.
function renderApiHealthWidget() {
  const list = document.getElementById('apiHealthList');
  const rows = UTILITY_BILLERS.slice(0, 5).map(function (b) {
    return `
      <li class="api-health-item">
        <span class="api-health-item-name">${b.name}</span>
        <span class="api-health-item-rate">${b.successRate}%</span>
        ${statusBadgeHtml(b.apiStatus)}
      </li>`;
  }).join('');
  list.innerHTML = rows;
}

// Updates the 4 big KPI cards to match whichever reporting period is selected.
function applyOverviewPeriod(periodKey) {
  const data = PERIOD_METRICS[periodKey] || PERIOD_METRICS.week;

  // Helper that rewrites both the big number AND its "+x% vs last period" line
  function updateMetric(valueId, value, changeText, isPositive) {
    const valueEl = document.getElementById(valueId);
    if (!valueEl) return;
    valueEl.textContent = value;

    const changeEl = valueEl.closest('.metric-card').querySelector('.metric-change');
    changeEl.classList.toggle('is-positive', isPositive);
    changeEl.classList.toggle('is-negative', !isPositive);
    const arrowIcon = isPositive ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow';
    changeEl.innerHTML = `<i class="bi ${arrowIcon}" aria-hidden="true"></i> ${changeText} vs last period`;
  }

  updateMetric('metricTotalInflow',    data.inflow,  data.inflowChange,  true);
  updateMetric('metricActiveUsers',    data.users,   data.usersChange,   true);
  updateMetric('metricOverallRevenue', data.revenue, data.revenueChange, true);

  // Uptime card keeps its own "All systems normal" wording rather than a % change
  const uptimeEl = document.getElementById('metricApiUptime');
  if (uptimeEl) uptimeEl.textContent = data.uptime;
}

// Wires up the Overview panel: the reporting-period dropdown plus the two render calls above.
function initOverviewPanel() {
  renderOverviewLiveTable();
  renderApiHealthWidget();

  document.getElementById('overviewPeriodSelect').addEventListener('change', function (e) {
    applyOverviewPeriod(e.target.value);
  });
}


/* ================================================================
   7. PANEL: USERS & KYC
================================================================ */

// Running counters shown in the mini-metric strip at the top of this panel.
// These represent PLATFORM-WIDE totals (as a real backend aggregate query
// would return), which is why they don't simply equal USERS.length — the
// table below only ever shows a small paginated sample of the full user base.
let liveVerifiedCount = 44512;
let livePendingCount  = USERS.filter(function (u) { return u.kycStatus === 'Pending'; }).length;
let liveFrozenCount   = USERS.filter(function (u) { return u.accountStatus === 'Frozen'; }).length;

let usersCurrentPage = 1;
const USERS_PER_PAGE = 5;

// Returns the USERS array filtered down by the search box + the two dropdowns.
function getFilteredUsers() {
  const search = document.getElementById('usersSearchInput').value.trim().toLowerCase();
  const kycFilter = document.getElementById('usersKycFilter').value;
  const accountFilter = document.getElementById('usersAccountFilter').value;

  return USERS.filter(function (u) {
    const matchesSearch = !search ||
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.phone.toLowerCase().includes(search);
    const matchesKyc = !kycFilter || u.kycStatus === kycFilter;
    const matchesAccount = !accountFilter || u.accountStatus === accountFilter;
    return matchesSearch && matchesKyc && matchesAccount;
  });
}

// Builds one <tr> for a single user row, including their action buttons.
// The "Approve KYC" button only appears at all when it's actually relevant.
function userRowHtml(u) {
  const freezeIsFreezing = u.accountStatus === 'Active'; // true = the button will freeze; false = it will unfreeze
  const freezeLabel = freezeIsFreezing ? 'Freeze' : 'Unfreeze';
  const freezeIcon = freezeIsFreezing ? 'bi-lock-fill' : 'bi-unlock-fill';
  const freezeBtnClass = freezeIsFreezing ? 'btn-danger-outline' : 'btn-success-outline';

  const approveKycButton = u.kycStatus === 'Pending'
    ? `<button type="button" class="btn btn-primary btn-sm" data-action="approve-kyc" data-user-id="${u.id}">
         <i class="bi bi-patch-check-fill" aria-hidden="true"></i> Approve KYC
       </button>`
    : '';

  return `
    <tr>
      <td>
        <span class="cell-user-name">${u.name}</span>
        <span class="cell-user-sub">${u.email}</span>
      </td>
      <td>${u.phone}</td>
      <td>${formatNaira(u.balance)}</td>
      <td>${u.tier}</td>
      <td>${statusBadgeHtml(u.kycStatus)}</td>
      <td>${statusBadgeHtml(u.accountStatus)}</td>
      <td>
        <div class="table-action-group">
          <button type="button" class="btn btn-outline btn-sm" data-action="view-profile" data-user-id="${u.id}">
            <i class="bi bi-eye" aria-hidden="true"></i> View
          </button>
          ${approveKycButton}
          <button type="button" class="btn ${freezeBtnClass} btn-sm" data-action="toggle-freeze" data-user-id="${u.id}">
            <i class="bi ${freezeIcon}" aria-hidden="true"></i> ${freezeLabel}
          </button>
        </div>
      </td>
    </tr>`;
}

// Re-draws the Users table for whatever the CURRENT filters + CURRENT page are.
// Called every time a filter changes, a page button is clicked, or the
// underlying USERS data is mutated (e.g. after approving someone's KYC).
function renderUsersTable() {
  const filtered = getFilteredUsers();
  const totalPages = Math.max(1, Math.ceil(filtered.length / USERS_PER_PAGE));
  usersCurrentPage = Math.min(usersCurrentPage, totalPages); // clamp in case a filter shrank the result set

  const start = (usersCurrentPage - 1) * USERS_PER_PAGE;
  const pageItems = filtered.slice(start, start + USERS_PER_PAGE);

  const tbody = document.getElementById('usersTableBody');
  const emptyMsg = document.getElementById('usersEmptyMsg');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyMsg.classList.remove('is-hidden');
  } else {
    emptyMsg.classList.add('is-hidden');
    tbody.innerHTML = pageItems.map(userRowHtml).join('');
  }

  document.getElementById('usersPageInfo').textContent = `Page ${usersCurrentPage} of ${totalPages}`;
  document.getElementById('usersPrevPageBtn').disabled = usersCurrentPage <= 1;
  document.getElementById('usersNextPageBtn').disabled = usersCurrentPage >= totalPages;
}

// Refreshes the 4 small numbers above the Users table (Total / Verified / Pending / Frozen).
function updateUsersMiniMetrics() {
  document.getElementById('miniVerifiedUsers').textContent = liveVerifiedCount.toLocaleString('en-NG');
  document.getElementById('miniPendingUsers').textContent = String(livePendingCount);
  document.getElementById('miniFrozenUsers').textContent = String(liveFrozenCount);
}

// Updates the little gold "pending KYC" counter badge next to the sidebar link.
function updateKycNavBadge() {
  const badge = document.getElementById('navBadgeKyc');
  badge.textContent = String(livePendingCount);
  badge.classList.toggle('is-hidden', livePendingCount === 0);
}

// Fills out and opens the "View User Profile" modal for one specific user.
function openUserProfileModal(userId) {
  const user = USERS.find(function (u) { return u.id === userId; });
  if (!user) return;

  document.getElementById('upAvatar').textContent = initialsFromName(user.name).toUpperCase();
  document.getElementById('upName').textContent = user.name;
  document.getElementById('upEmail').textContent = user.email;
  document.getElementById('upPhone').textContent = user.phone;
  document.getElementById('upBalance').textContent = formatNaira(user.balance);
  document.getElementById('upTier').textContent = user.tier;
  document.getElementById('upKycStatus').innerHTML = statusBadgeHtml(user.kycStatus);
  document.getElementById('upAccountStatus').innerHTML = statusBadgeHtml(user.accountStatus);
  document.getElementById('upJoined').textContent = formatDateOnly(user.joined);

  openModal('userProfileModal');
}

// Approves a pending KYC submission: flips the user's status, updates every
// counter that depends on it, and re-renders the table — all in one place.
function approveUserKyc(userId) {
  const user = USERS.find(function (u) { return u.id === userId; });
  if (!user || user.kycStatus !== 'Pending') return;

  // ============================================================
  // BACKEND INTEGRATION POINT
  // Replace this in-memory mutation with a real API call, e.g.:
  //   fetch('/api/admin/approve-kyc.php', { method: 'POST', body: JSON.stringify({ userId }) })
  // and only update the UI (below) once that request succeeds.
  // ============================================================
  user.kycStatus = 'Verified';
  livePendingCount = Math.max(0, livePendingCount - 1);
  liveVerifiedCount += 1;

  renderUsersTable();
  updateUsersMiniMetrics();
  updateKycNavBadge();
  showToast(`${user.name}'s KYC has been approved.`, 'success');
}

// Freezes or unfreezes a user's account (the button itself decides which,
// based on the user's CURRENT status at the moment it's clicked).
function toggleUserFreeze(userId) {
  const user = USERS.find(function (u) { return u.id === userId; });
  if (!user) return;

  const willFreeze = user.accountStatus === 'Active';
  const title = willFreeze ? 'Freeze Account' : 'Unfreeze Account';
  const description = willFreeze
    ? `Freezing ${user.name}'s account immediately blocks all outgoing transactions. Continue?`
    : `Unfreezing ${user.name}'s account will restore their normal transaction ability. Continue?`;

  openConfirmModal(title, description, willFreeze ? 'Freeze Account' : 'Unfreeze Account', willFreeze, function () {
    // ============================================================
    // BACKEND INTEGRATION POINT
    // Replace this with: fetch('/api/admin/toggle-freeze.php', { method: 'POST', body: JSON.stringify({ userId }) })
    // ============================================================
    user.accountStatus = willFreeze ? 'Frozen' : 'Active';
    liveFrozenCount = Math.max(0, liveFrozenCount + (willFreeze ? 1 : -1));

    renderUsersTable();
    updateUsersMiniMetrics();
    showToast(`${user.name}'s account has been ${willFreeze ? 'frozen' : 'unfrozen'}.`, willFreeze ? 'warning' : 'success');
  });
}

// Wires every control on the Users & KYC panel: search, filters,
// pagination buttons, and the View/Approve/Freeze action buttons inside
// the table (handled with ONE delegated listener — see initTableActions()).
function initUsersPanel() {
  updateUsersMiniMetrics();
  renderUsersTable();

  ['usersSearchInput', 'usersKycFilter', 'usersAccountFilter'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      usersCurrentPage = 1; // any new filter always restarts from page 1
      renderUsersTable();
    });
  });

  document.getElementById('usersPrevPageBtn').addEventListener('click', function () {
    usersCurrentPage = Math.max(1, usersCurrentPage - 1);
    renderUsersTable();
  });
  document.getElementById('usersNextPageBtn').addEventListener('click', function () {
    usersCurrentPage += 1;
    renderUsersTable();
  });

  initTableActions(); // sets up the single shared [data-action] click handler used by every panel
}


/* ================================================================
   8. PANEL: TRANSACTION LEDGER
================================================================ */

let ledgerCurrentPage = 1;
const LEDGER_PER_PAGE = 6;

// Returns LEDGER_TRANSACTIONS filtered by the search box + 3 dropdown/date filters.
function getFilteredLedger() {
  const search = document.getElementById('ledgerSearchInput').value.trim().toLowerCase();
  const type = document.getElementById('ledgerTypeFilter').value;
  const status = document.getElementById('ledgerStatusFilter').value;
  const month = document.getElementById('ledgerMonthFilter').value;

  return LEDGER_TRANSACTIONS.filter(function (t) {
    const matchesSearch = !search ||
      t.user.toLowerCase().includes(search) ||
      t.reference.toLowerCase().includes(search) ||
      t.description.toLowerCase().includes(search);
    const matchesType = !type || t.type === type;
    const matchesStatus = !status || t.status === status;
    const matchesMonth = !month || t.date.startsWith(month);
    return matchesSearch && matchesType && matchesStatus && matchesMonth;
  });
}

// Re-draws the Transaction Ledger table for the current filters + page.
function renderLedgerTable() {
  const filtered = getFilteredLedger();
  const totalPages = Math.max(1, Math.ceil(filtered.length / LEDGER_PER_PAGE));
  ledgerCurrentPage = Math.min(ledgerCurrentPage, totalPages);

  const start = (ledgerCurrentPage - 1) * LEDGER_PER_PAGE;
  const pageItems = filtered.slice(start, start + LEDGER_PER_PAGE);

  const tbody = document.getElementById('ledgerTableBody');
  const emptyMsg = document.getElementById('ledgerEmptyMsg');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyMsg.classList.remove('is-hidden');
  } else {
    emptyMsg.classList.add('is-hidden');
    tbody.innerHTML = pageItems.map(function (t) {
      const amountClass = t.amount < 0 ? 'amt-debit' : 'amt-credit';
      return `
        <tr>
          <td><code>${t.reference}</code></td>
          <td>${t.user}</td>
          <td>${t.type}</td>
          <td>${t.description}</td>
          <td class="${amountClass}">${formatNaira(t.amount)}</td>
          <td>${statusBadgeHtml(t.status)}</td>
          <td>${formatDateTime(t.date)}</td>
          <td>
            <button type="button" class="btn btn-outline btn-sm" data-action="view-transaction" data-txn-id="${t.reference}">
              View Detail
            </button>
          </td>
        </tr>`;
    }).join('');
  }

  document.getElementById('ledgerPageInfo').textContent = `Page ${ledgerCurrentPage} of ${totalPages}`;
  document.getElementById('ledgerPrevPageBtn').disabled = ledgerCurrentPage <= 1;
  document.getElementById('ledgerNextPageBtn').disabled = ledgerCurrentPage >= totalPages;
}

// Fills out and opens the Transaction Detail modal for one reference number.
// Used by BOTH the Overview live feed and the full Ledger table.
function openTransactionDetailModal(reference) {
  const txn = LEDGER_TRANSACTIONS.find(function (t) { return t.reference === reference; });
  if (!txn) return;

  document.getElementById('tdReference').textContent = txn.reference;
  document.getElementById('tdUser').textContent = txn.user;
  document.getElementById('tdType').textContent = txn.type;
  document.getElementById('tdDescription').textContent = txn.description;
  document.getElementById('tdAmount').textContent = formatNaira(txn.amount);
  document.getElementById('tdStatus').innerHTML = statusBadgeHtml(txn.status);
  document.getElementById('tdTimestamp').textContent = formatDateTime(txn.date);

  openModal('transactionDetailModal');
}

// Builds a CSV file in-browser (no server round-trip needed) from whatever
// rows are currently passing the active filters, and triggers a download.
function exportLedgerToCsv() {
  const rows = getFilteredLedger();
  const header = ['Reference', 'User', 'Type', 'Description', 'Amount (NGN)', 'Status', 'Date'];

  const csvLines = [header.join(',')];
  rows.forEach(function (t) {
    const safeDescription = `"${t.description.replace(/"/g, '""')}"`; // escape any embedded quote marks safely
    csvLines.push([t.reference, t.user, t.type, safeDescription, t.amount, t.status, t.date].join(','));
  });

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'nova-finance-transaction-ledger.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // frees the temporary in-memory file once the download has started

  showToast('Transaction ledger exported as CSV.', 'success');
}

// Wires every control on the Transaction Ledger panel.
function initLedgerPanel() {
  renderLedgerTable();

  ['ledgerSearchInput', 'ledgerTypeFilter', 'ledgerStatusFilter', 'ledgerMonthFilter'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      ledgerCurrentPage = 1;
      renderLedgerTable();
    });
  });

  document.getElementById('ledgerPrevPageBtn').addEventListener('click', function () {
    ledgerCurrentPage = Math.max(1, ledgerCurrentPage - 1);
    renderLedgerTable();
  });
  document.getElementById('ledgerNextPageBtn').addEventListener('click', function () {
    ledgerCurrentPage += 1;
    renderLedgerTable();
  });

  document.getElementById('exportLedgerBtn').addEventListener('click', exportLedgerToCsv);
}


/* ================================================================
   9. PANEL: OWEALTH (Loans + Savings)
================================================================ */

// Draws every row of the loan book table. Read-only for now — wiring up
// "View" / "Mark as Defaulted" actions later just means adding a button
// here plus a new case in initTableActions(), following the same pattern
// already used for Users & KYC above.
function renderLoansTable() {
  const tbody = document.getElementById('loansTableBody');
  tbody.innerHTML = LOANS.map(function (loan) {
    return `
      <tr>
        <td><code>${loan.id}</code></td>
        <td>${loan.user}</td>
        <td>${formatNaira(loan.principal)}</td>
        <td>${loan.tenure}</td>
        <td>${formatNaira(loan.outstanding)}</td>
        <td>${statusBadgeHtml(loan.status)}</td>
        <td>${loan.nextDue === '—' ? '—' : formatDateOnly(loan.nextDue)}</td>
      </tr>`;
  }).join('');
}

// Draws the savings-vault progress cards, sorted by amount saved (largest first)
// so the admin immediately sees the platform's biggest savers.
function renderVaultsList() {
  const container = document.getElementById('vaultsListContainer');
  const sorted = SAVINGS_VAULTS.slice().sort(function (a, b) { return b.saved - a.saved; });

  container.innerHTML = sorted.map(function (v) {
    const pct = Math.min(100, Math.round((v.saved / v.target) * 100));
    return `
      <div class="vault-card">
        <div class="vault-head">
          <span class="vault-icon" aria-hidden="true"><i class="bi bi-piggy-bank-fill"></i></span>
          <span class="vault-meta">
            <strong>${v.goalName}</strong>
            <small>${v.user} — ${formatNaira(v.saved)} of ${formatNaira(v.target)}</small>
          </span>
          <span class="vault-amount">${pct}%</span>
        </div>
        <div class="vault-progress-row">
          <div class="progress-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
               aria-label="${v.goalName} progress">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>
        </div>
      </div>`;
  }).join('');
}

function initOwealthPanel() {
  renderLoansTable();
  renderVaultsList();
}


/* ================================================================
   10. PANEL: BILLERS & TOP-UPS (VTU + Utilities)
================================================================ */

// Draws the VTU provider table, including the editable margin input and
// Enabled/Disabled switch for each network. The "Save" button reads the
// CURRENT value out of the input at click-time rather than on every
// keystroke, so an admin can type a margin and only commit it deliberately.
function renderVtuTable() {
  const tbody = document.getElementById('vtuTableBody');
  tbody.innerHTML = VTU_PROVIDERS.map(function (p) {
    return `
      <tr data-provider-row="${p.id}">
        <td><strong>${p.name}</strong></td>
        <td>${p.costPrice.toFixed(1)}% of face value</td>
        <td>
          <input type="number" class="table-inline-input" step="0.1" min="0" max="100"
                 value="${p.marginPercent.toFixed(1)}" data-margin-input="${p.id}"
                 aria-label="${p.name} profit margin percentage">
        </td>
        <td>
          <label class="switch">
            <input type="checkbox" data-action="toggle-vtu-enabled" data-provider="${p.id}"
                   ${p.enabled ? 'checked' : ''} aria-label="Enable ${p.name}">
            <span class="switch-track"><span class="switch-thumb"></span></span>
          </label>
        </td>
        <td>
          <button type="button" class="btn btn-outline btn-sm" data-action="save-margin" data-provider="${p.id}">
            <i class="bi bi-check-lg" aria-hidden="true"></i> Save
          </button>
        </td>
      </tr>`;
  }).join('');
}

// Draws the read-only utility/subscription biller uptime table.
function renderBillersUptimeTable() {
  const tbody = document.getElementById('billersUptimeTableBody');
  tbody.innerHTML = UTILITY_BILLERS.map(function (b) {
    return `
      <tr>
        <td><strong>${b.name}</strong></td>
        <td>${b.category}</td>
        <td>${b.successRate}%</td>
        <td>${statusBadgeHtml(b.apiStatus)}</td>
        <td>${b.lastChecked}</td>
      </tr>`;
  }).join('');
}

// Reads whatever margin value is currently typed for one provider and saves it.
function saveVtuMargin(providerId) {
  const provider = VTU_PROVIDERS.find(function (p) { return p.id === providerId; });
  const input = document.querySelector(`[data-margin-input="${providerId}"]`);
  if (!provider || !input) return;

  const newMargin = parseFloat(input.value);
  if (Number.isNaN(newMargin) || newMargin < 0 || newMargin > 100) {
    showToast('Enter a valid margin between 0 and 100%.', 'warning');
    return;
  }

  // ============================================================
  // BACKEND INTEGRATION POINT
  // Replace with: fetch('/api/admin/update-vtu-margin.php', { method:'POST', body: JSON.stringify({ providerId, newMargin }) })
  // ============================================================
  provider.marginPercent = newMargin;
  showToast(`${provider.name} profit margin updated to ${newMargin.toFixed(1)}%.`, 'success');
}

// Flips a VTU provider between enabled/disabled the moment its switch is toggled.
function toggleVtuEnabled(providerId, isNowEnabled) {
  const provider = VTU_PROVIDERS.find(function (p) { return p.id === providerId; });
  if (!provider) return;

  // ============================================================
  // BACKEND INTEGRATION POINT
  // Replace with: fetch('/api/admin/toggle-vtu-provider.php', { method:'POST', body: JSON.stringify({ providerId, isNowEnabled }) })
  // ============================================================
  provider.enabled = isNowEnabled;
  showToast(`${provider.name} has been ${isNowEnabled ? 'enabled' : 'disabled'} for customers.`, isNowEnabled ? 'success' : 'warning');
}

function initBillersPanel() {
  renderVtuTable();
  renderBillersUptimeTable();

  // The Enabled/Disabled switches are "change" events, not clicks, so they
  // get their own small delegated listener here rather than living inside
  // the generic click-based initTableActions() handler below.
  document.getElementById('vtuTableBody').addEventListener('change', function (e) {
    const toggle = e.target.closest('[data-action="toggle-vtu-enabled"]');
    if (!toggle) return;
    toggleVtuEnabled(toggle.dataset.provider, toggle.checked);
  });
}


/* ================================================================
   11. PANEL: MINI MARKETPLACE
================================================================ */

// Updates both places that show "how many listings are waiting" — the KPI
// card on this panel AND the badge on the sidebar link — at the same time,
// so the two numbers can never drift out of sync with each other.
function updateListingsCounters() {
  const count = MARKETPLACE_LISTINGS.length;
  document.getElementById('metricPendingListings').textContent = String(count);
  const navBadge = document.getElementById('navBadgeListings');
  navBadge.textContent = String(count);
  navBadge.classList.toggle('is-hidden', count === 0);
}

// Draws the table of listings awaiting moderation.
function renderListingsTable() {
  const tbody = document.getElementById('listingsTableBody');
  const emptyMsg = document.getElementById('listingsEmptyMsg');

  if (MARKETPLACE_LISTINGS.length === 0) {
    tbody.innerHTML = '';
    emptyMsg.classList.remove('is-hidden');
    return;
  }
  emptyMsg.classList.add('is-hidden');

  tbody.innerHTML = MARKETPLACE_LISTINGS.map(function (l) {
    return `
      <tr>
        <td><strong>${l.itemName}</strong></td>
        <td>${l.seller}</td>
        <td>${l.category}</td>
        <td>${formatNaira(l.price)}</td>
        <td>${formatDateOnly(l.submitted)}</td>
        <td>
          <div class="table-action-group">
            <button type="button" class="btn btn-success-outline btn-sm" data-action="approve-listing" data-listing-id="${l.id}">
              <i class="bi bi-check-lg" aria-hidden="true"></i> Approve
            </button>
            <button type="button" class="btn btn-danger-outline btn-sm" data-action="reject-listing" data-listing-id="${l.id}">
              <i class="bi bi-x-lg" aria-hidden="true"></i> Reject
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// Shared logic for both Approve and Reject — they only differ in wording
// and in which toast/colour they show, so one function handles both.
function moderateListing(listingId, isApproving) {
  const listing = MARKETPLACE_LISTINGS.find(function (l) { return l.id === listingId; });
  if (!listing) return;

  const title = isApproving ? 'Approve Listing' : 'Reject Listing';
  const description = isApproving
    ? `"${listing.itemName}" will go live in the marketplace immediately. Continue?`
    : `"${listing.itemName}" will be rejected and the seller notified. Continue?`;

  openConfirmModal(title, description, isApproving ? 'Approve Listing' : 'Reject Listing', !isApproving, function () {
    // ============================================================
    // BACKEND INTEGRATION POINT
    // Replace with: fetch('/api/admin/moderate-listing.php', { method:'POST', body: JSON.stringify({ listingId, isApproving }) })
    // ============================================================
    const index = MARKETPLACE_LISTINGS.findIndex(function (l) { return l.id === listingId; });
    if (index !== -1) MARKETPLACE_LISTINGS.splice(index, 1); // remove it from the "pending" list either way

    renderListingsTable();
    updateListingsCounters();
    showToast(
      isApproving ? `"${listing.itemName}" approved and is now live.` : `"${listing.itemName}" was rejected.`,
      isApproving ? 'success' : 'warning'
    );
  });
}

function initMarketplacePanel() {
  updateListingsCounters();
  renderListingsTable();
}


/* ================================================================
   12. PANEL: SYSTEM SETTINGS
================================================================ */

// Draws the table of staff accounts with access to this Command Center.
function renderAdminAccountsTable() {
  const tbody = document.getElementById('adminAccountsTableBody');
  tbody.innerHTML = ADMIN_ACCOUNTS.map(function (a) {
    const isSelf = a.id === CURRENT_ADMIN_ID;
    // An admin should never be able to remove their own account from the
    // session they are currently using — the button is disabled, not hidden,
    // so it's still clear the option exists and WHY it can't be used right now.
    const removeButton = isSelf
      ? `<button type="button" class="btn btn-danger-outline btn-sm" disabled title="You can't remove your own account while logged in">
           <i class="bi bi-trash-fill" aria-hidden="true"></i> Remove
         </button>`
      : `<button type="button" class="btn btn-danger-outline btn-sm" data-action="remove-admin" data-admin-id="${a.id}">
           <i class="bi bi-trash-fill" aria-hidden="true"></i> Remove
         </button>`;

    return `
      <tr>
        <td>
          <span class="cell-user-name">${a.name}${isSelf ? ' (You)' : ''}</span>
          <span class="cell-user-sub">${a.email}</span>
        </td>
        <td>${a.role}</td>
        <td>${statusBadgeHtml(a.status)}</td>
        <td>${removeButton}</td>
      </tr>`;
  }).join('');
}

// Removes a staff account after confirmation.
function removeAdmin(adminId) {
  const admin = ADMIN_ACCOUNTS.find(function (a) { return a.id === adminId; });
  if (!admin) return;

  openConfirmModal(
    'Remove Admin Access',
    `${admin.name} will immediately lose access to the Command Center. Continue?`,
    'Remove Access',
    true,
    function () {
      // ============================================================
      // BACKEND INTEGRATION POINT
      // Replace with: fetch('/api/admin/remove-admin.php', { method:'POST', body: JSON.stringify({ adminId }) })
      // ============================================================
      const index = ADMIN_ACCOUNTS.findIndex(function (a) { return a.id === adminId; });
      if (index !== -1) ADMIN_ACCOUNTS.splice(index, 1);
      renderAdminAccountsTable();
      showToast(`${admin.name} no longer has admin access.`, 'warning');
    }
  );
}

// Wires the "Add New Admin" button + modal form.
function initAddAdminFlow() {
  document.getElementById('openAddAdminModalBtn').addEventListener('click', function () {
    openModal('addAdminModal');
  });

  document.getElementById('addAdminForm').addEventListener('submit', function (e) {
    e.preventDefault(); // stop the browser's default full-page form submission

    const name = document.getElementById('newAdminName').value.trim();
    const email = document.getElementById('newAdminEmail').value.trim();
    const role = document.getElementById('newAdminRole').value;

    // ============================================================
    // BACKEND INTEGRATION POINT
    // Replace this push() with: fetch('/api/admin/invite-admin.php', { method:'POST', body: JSON.stringify({ name, email, role }) })
    // then re-render using the real new record the server returns (so the
    // id is generated by your database, not guessed on the client like below).
    // ============================================================
    const newId = 'ADM-' + (ADMIN_ACCOUNTS.length + 1);
    ADMIN_ACCOUNTS.push({ id: newId, name: name, email: email, role: role, status: 'Pending Invite' });

    renderAdminAccountsTable();
    closeModal('addAdminModal');
    e.target.reset();
    showToast(`Invite sent to ${email}.`, 'success');
  });
}

function initSettingsPanel() {
  renderAdminAccountsTable();
  initAddAdminFlow();

  // The maintenance-mode switch gets its own small toast immediately on
  // toggle (separate from the "Save Contact Info" button, which only saves
  // the text fields around it) — this mirrors how 2FA/biometric toggles
  // behave on the customer-facing dashboard for a consistent feel.
  document.getElementById('maintenanceModeToggle').addEventListener('change', function (e) {
    showToast(
      e.target.checked ? 'Maintenance mode ENABLED — new transactions are now blocked platform-wide.' : 'Maintenance mode disabled. Transactions are flowing normally.',
      e.target.checked ? 'warning' : 'success'
    );
  });
}


/* ================================================================
   13. SHARED [data-action] CLICK HANDLER
   All the row-level buttons created dynamically above (View, Freeze,
   Approve KYC, View Detail, Approve/Reject listing, Save margin, Remove
   admin) are wired through ONE delegated listener here instead of
   attaching a fresh listener every time a table re-renders. This is
   both more efficient and impossible to forget to re-attach after a
   re-render, since the listener lives on `document`, not on the rows.
================================================================ */
function initTableActions() {
  document.addEventListener('click', function (e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    if (action === 'view-profile') {
      openUserProfileModal(target.dataset.userId);
    } else if (action === 'toggle-freeze') {
      toggleUserFreeze(target.dataset.userId);
    } else if (action === 'approve-kyc') {
      approveUserKyc(target.dataset.userId);
    } else if (action === 'view-transaction') {
      openTransactionDetailModal(target.dataset.txnId);
    } else if (action === 'approve-listing') {
      moderateListing(target.dataset.listingId, true);
    } else if (action === 'reject-listing') {
      moderateListing(target.dataset.listingId, false);
    } else if (action === 'save-margin') {
      saveVtuMargin(target.dataset.provider);
    } else if (action === 'remove-admin') {
      removeAdmin(target.dataset.adminId);
    }
    // 'toggle-vtu-enabled' is intentionally NOT handled here — it's a
    // checkbox "change" event, not a click, and is wired separately
    // inside initBillersPanel() above.
  });
}


/* ================================================================
   14. GENERIC MOCK-SUBMIT FORMS
   Any <form data-mock-submit="..."> anywhere on the page (currently the
   Fee Settings and Contact Info forms) automatically gets: prevent the
   real page-reloading submit, briefly disable + relabel its button,
   then show the message in data-mock-submit as a success toast. Replace
   the inside of the setTimeout with a real fetch() POST per form later.
================================================================ */
function initGenericMockSubmitForms() {
  document.querySelectorAll('form[data-mock-submit]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalLabel = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Saving…';
      }

      // ============================================================
      // BACKEND INTEGRATION POINT
      // Replace this setTimeout with a real fetch() POST of the form's
      // fields to your PHP endpoint, then show the toast only on success.
      // ============================================================
      setTimeout(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalLabel;
        }
        showToast(form.dataset.mockSubmit, 'success');
      }, 900);
    });
  });
}


/* ================================================================
   15. LOGOUT
================================================================ */
function initLogout() {
  document.getElementById('logoutBtn').addEventListener('click', function () {
    openModal('logoutConfirmModal');
  });

  document.getElementById('confirmLogoutBtn').addEventListener('click', function () {
    showToast('Logged out successfully. Redirecting…', 'success');
    // Point this at your real admin login route once the PHP backend exists.
    setTimeout(function () { window.location.href = 'admin-login.html'; }, 1200);
  });
}