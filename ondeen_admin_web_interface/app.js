/* OnDeen Admin Console - deliberately dependency free so the Railway service is easy to operate. */
const API_BASE = (window.ONDEEN_API_URL || 'https://api-production-517c1.up.railway.app').replace(/\/$/, '');

const state = {
  view: 'overview',
  token: sessionStorage.getItem('ondeen_admin_token') === 'preview' ? '' : (sessionStorage.getItem('ondeen_admin_token') || ''),
  profile: JSON.parse(sessionStorage.getItem('ondeen_admin_profile') || 'null'),
  preview: false,
  data: null,
  loading: false,
  error: '',
  search: '',
};

const iconPaths = {
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  building: 'M3 21h18M5 21V5l7-3 7 3v16M9 21v-4h6v4M9 8h.01M15 8h.01M9 12h.01M15 12h.01',
  calendar: 'M4 5h16v15H4zM16 3v4M8 3v4M4 10h16',
  speaker: 'M12 2a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4ZM5 11a7 7 0 0 0 14 0M12 18v4M8 22h8',
  pulse: 'M3 12h4l3-8 4 16 3-8h4',
  wallet: 'M3 6h18v14H3zM3 10h18M16 15h2',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  refresh: 'M20 11a8.1 8.1 0 0 0-14.8-3L3 11m0 0V5m0 6h6M4 13a8.1 8.1 0 0 0 14.8 3L21 13m0 0v6m0-6h-6',
  logout: 'M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6',
  check: 'M20 6 9 17l-5-5',
  close: 'M18 6 6 18M6 6l12 12',
};

function icon(name, className = 'icon') {
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${iconPaths[name] || iconPaths.grid}"/></svg>`;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}

function unwrap(payload) {
  return payload && Object.prototype.hasOwnProperty.call(payload, 'response') ? payload.response : payload;
}

async function api(path, options = {}) {
  const headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers, signal: controller.signal });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.status === false) {
      const message = unwrap(payload)?.message || unwrap(payload) || `Request failed (${response.status})`;
      throw new Error(String(message));
    }
    return unwrap(payload);
  } finally {
    clearTimeout(timeout);
  }
}

async function apiAll(path, body, collectionKey) {
  const rows = [];
  let page = 1;
  let firstPage = null;
  for (let requestCount = 0; requestCount < 100; requestCount += 1) {
    const payload = await api(path, { method: 'POST', body: JSON.stringify({ ...body, page, per_page: 250 }) });
    firstPage ||= payload || {};
    if (Array.isArray(payload?.[collectionKey])) rows.push(...payload[collectionKey]);
    const pagination = payload?.pagination || payload || {};
    const pages = Number(pagination.pages || 1);
    if (page >= pages || !payload?.[collectionKey]?.length) break;
    page += 1;
  }
  return { ...(firstPage || {}), [collectionKey]: rows };
}

function sampleData() {
  return {
    dashboard: { participant_count: 248, organiser_count: 19, speaker_count: 42, event_count: 86, course_count: 54, tour_count: 18, all_event_count: [] },
    customers: { customers: [
      { id: 2031, first_name: 'Amina', last_name: 'Rahman', email_id: 'amina@example.com', mobile_number: '+44 7700 900321', status: 1 },
      { id: 2028, first_name: 'Uzair', last_name: 'Khan', email_id: 'uzair@example.com', mobile_number: '+44 7700 900184', status: 1 },
      { id: 2014, first_name: 'Muhammad', last_name: 'Zulfikar', email_id: 'm.zulfikar@example.com', mobile_number: '+44 7700 900074', status: 1 },
    ], total: 248 },
    organisers: { organizers: [
      { id: 91, first_name: 'The Rijal Club', email_id: 'hello@rijal.club', status: 1 },
      { id: 86, first_name: 'Assunnah Islamic Centre', email_id: 'team@assunnah.org', status: 1 },
    ], total: 19 },
    events: { events: [
      { id: 440, title: 'The Knowledge Class', organiser: 'The Rijal Club', category_title: 'Course', start_date: '2026-07-29T19:30:00', participant_count: 34, status: 1 },
      { id: 437, title: 'Family Foundations', organiser: 'Assunnah Islamic Centre', category_title: 'Event', start_date: '2026-08-04T18:00:00', participant_count: 18, status: 1 },
      { id: 429, title: 'Deen Over Dunya', organiser: 'The Rijal Club', category_title: 'Course', start_date: '2026-10-17T20:00:00', participant_count: 0, status: 1 },
    ] },
    applications: { applications: [
      { id: 71, organization_name: 'North London Learning Circle', email_id: 'apply@nllc.example', status: 'UNDER_REVIEW', submitted_on: '2026-09-04T10:30:00' },
      { id: 69, organization_name: 'Roots & Routes', email_id: 'hello@roots.example', status: 'NEEDS_MORE_INFO', submitted_on: '2026-09-03T15:10:00' },
    ] },
    finance: { order_count: 63, paid_order_count: 48, pending_order_count: 7, refund_count: 3, refund_pending_count: 1, payout_pending_count: 8, gross: { amount: '1,284.00', currency: 'GBP' }, refunded: { amount: '74.00', currency: 'GBP' }, orders: [
      { id: 801, order_key: 'ord_demo_801', event_title: 'The Knowledge Class', buyer_name: 'Amina Rahman', buyer_email: 'amina@example.com', quantity: 1, status: 'confirmed', gross: { amount: '18.00', currency: 'GBP' }, created_on: '2026-09-05T11:20:00' },
      { id: 796, order_key: 'ord_demo_796', event_title: 'Family Foundations', buyer_name: 'Uzair Khan', buyer_email: 'uzair@example.com', quantity: 2, status: 'payout_pending', gross: { amount: '36.00', currency: 'GBP' }, created_on: '2026-09-04T16:05:00' },
    ], refunds: [{ id: 22, payment_order_key: 'ord_demo_794', event_title: 'Deen Over Dunya', buyer_name: 'M. Zulfikar', status: 'approved_awaiting_ondeen', requested_amount_pence: 1200, currency: 'gbp' }] },
  };
}

async function loadData() {
  state.loading = true;
  state.error = '';
  render();
  const results = await Promise.allSettled([
    api('/admin_app/dashboard/get_data', { method: 'POST', body: JSON.stringify({}) }),
    apiAll('/admin_app/customer/get_all', { keyword: state.search || undefined }, 'customers'),
    apiAll('/admin_app/organizer/listing', { search_key: state.search || undefined }, 'organizers'),
    apiAll('/admin_app/event/get_all_event', { keyword: state.search || undefined }, 'events'),
    api('/admin_app/organizer/applications?status=UNDER_REVIEW', { method: 'GET' }),
    api('/payment/admin/overview', { method: 'GET' }),
    api('/payment/admin/orders?limit=100', { method: 'GET' }),
    api('/payment/admin/refunds?limit=100', { method: 'GET' }),
    api('/payment/admin/payouts?limit=100', { method: 'GET' }),
  ]);
  const [dashboard, customers, organisers, events, applications, financeOverview, financeOrders, financeRefunds, financePayouts] = results.map((result) => result.status === 'fulfilled' ? result.value : {});
  state.data = { dashboard, customers, organisers, events, applications, finance: { ...(financeOverview || {}), ...(financeOrders || {}), ...(financeRefunds || {}), ...(financePayouts || {}) } };
  const failed = results.filter((result) => result.status === 'rejected').length;
  if (failed) state.error = `${failed} live data request${failed === 1 ? '' : 's'} failed. No preview data was substituted; retry when the API is available.`;
  state.loading = false;
  render();
}

function initials() {
  const profile = state.profile || {};
  const source = profile.first_name || profile.email_id || 'Admin';
  return source.slice(0, 2).toUpperCase();
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return String(value).slice(0, 16);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatStatus(status) {
  const value = String(status ?? '').toUpperCase();
  if (value === '1' || value === 'ACTIVE' || value === 'APPROVED' || value === 'CONFIRMED' || value === 'SUCCEEDED' || value === 'PAID' || value === 'COMPLETED') return `<span class="tag">${value === '1' || value === 'ACTIVE' || value === 'APPROVED' ? 'Active' : esc(value.replaceAll('_', ' '))}</span>`;
  if (value === 'UNDER_REVIEW' || value === 'NEEDS_MORE_INFO' || value === 'PENDING' || value === 'PAYOUT_PENDING' || value === 'REQUIRES_PAYMENT' || value === 'CONFIRMING' || value === 'APPROVED_AWAITING_ONDEEN') return `<span class="tag pending">${esc(value.replaceAll('_', ' '))}</span>`;
  return `<span class="tag off">${esc(value || 'Inactive')}</span>`;
}

function loginView() {
  return `<main class="login-shell"><section class="login-art"><div class="brand"><span class="brand-mark">O</span><span>OnDeen</span></div><div class="art-copy"><div class="eyebrow">Operations / 01</div><h1>Keep the good work moving.</h1><p>A calm control room for the people, organisers and events that make OnDeen useful every day.</p></div><div class="art-footer">USER APP  ·  ORGANISER APP  ·  ONE SOURCE OF TRUTH</div></section><section class="login-card-wrap"><form class="login-card" id="login-form"><div class="eyebrow">Admin access</div><h2>Welcome back.</h2><p class="lead">Sign in to review your OnDeen workspace and keep the community moving.</p><div id="login-error"></div><div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="username" required /></div><div class="field"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required /></div><button class="primary-btn" type="submit">Enter the console ${icon('arrow', 'icon')}</button></form></section></main>`;
}

function sidebar() {
  const items = [
    ['overview', 'Overview', 'grid'],
    ['users', 'Users', 'users'],
    ['organisers', 'Organisers', 'building'],
    ['events', 'Events', 'calendar'],
    ['payments', 'Payments', 'wallet'],
  ];
  return `<aside class="sidebar"><div class="brand"><span class="brand-mark">O</span><span>OnDeen</span></div><div class="nav-label">Workspace</div><nav class="nav">${items.map(([key, label, itemIcon]) => `<button class="${state.view === key ? 'active' : ''}" data-view="${key}">${icon(itemIcon)}<span>${label}</span></button>`).join('')}</nav><div class="sidebar-bottom"><div class="profile-mini"><span class="avatar">${esc(initials())}</span><div><strong>${esc(state.profile?.first_name || 'Admin')}</strong><small>${esc(state.profile?.email_id || '')}</small></div></div><button class="logout" id="logout">${icon('logout')} Sign out</button></div></aside>`;
}

function metric(label, value, note, metricIcon) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : esc(value || '0');
  return `<article class="metric"><div class="metric-top"><span>${label}</span><span class="metric-icon">${icon(metricIcon)}</span></div><div class="metric-value">${displayValue}</div><div class="metric-note">${note}</div></article>`;
}

function overviewView() {
  const dashboard = state.data?.dashboard || {};
  const applications = state.data?.applications?.applications || [];
  const events = state.data?.events?.events || [];
  const totalListings = Number(state.data?.events?.pagination?.total || events.length || dashboard.all_event_count?.length || dashboard.event_count || 0);
  const counts = [
    ['Users', dashboard.participant_count, 'active accounts', 'users'],
    ['Organisers', dashboard.organiser_count, 'active organisations', 'building'],
    ['Speakers', dashboard.speaker_count, 'public profiles', 'speaker'],
    ['Live listings', totalListings, 'published listings', 'calendar'],
  ];
  const categories = [
    ['Courses', dashboard.course_count || 0],
    ['Tours', dashboard.tour_count || 0],
    ['Events', Math.max(0, totalListings - (dashboard.course_count || 0) - (dashboard.tour_count || 0))],
    ['Applications', applications.length],
  ];
  const max = Math.max(...categories.map(([, value]) => value), 1);
  return `<div class="metrics">${counts.map((item) => metric(...item)).join('')}</div><div class="grid-two"><section class="panel"><div class="panel-header"><div><h2>Workspace pulse</h2><div class="panel-sub">A quick read of what is happening across both apps.</div></div><button class="view-link" data-view="events">View events ${icon('arrow')}</button></div><div class="bars">${categories.map(([label, value]) => `<div class="bar-row"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(4, Math.round(value / max * 100))}%"></div></div><span class="bar-value">${value}</span></div>`).join('')}</div></section><section class="panel"><div class="panel-header"><div><h2>Needs attention</h2><div class="panel-sub">Small actions that keep the catalogue healthy.</div></div><span class="status-pill"><span class="status-dot"></span> Today</span></div><div class="activity"><div class="activity-item"><span class="round">${icon('building')}</span><div><strong>${applications.length} organiser application${applications.length === 1 ? '' : 's'}</strong><span>Ready for review</span></div><span class="activity-time">NOW</span></div><div class="activity-item"><span class="round">${icon('calendar')}</span><div><strong>${events.length} recent listing${events.length === 1 ? '' : 's'}</strong><span>Visible to users</span></div><span class="activity-time">LIVE</span></div><div class="activity-item"><span class="round">${icon('pulse')}</span><div><strong>Data connection</strong><span>${state.preview ? 'Preview data loaded' : 'Railway API connected'}</span></div><span class="activity-time">OK</span></div></div></section></div>`;
}

function usersView() {
  const rows = state.data?.customers?.customers || [];
  return `<div class="page-toolbar"><div><h2>Users</h2><div class="panel-sub">People using the OnDeen User app.</div></div><input class="search" id="table-search" placeholder="Search name, email or phone" value="${esc(state.search)}" /></div><section class="panel table-panel"><div class="table-scroll"><table><thead><tr><th>Person</th><th>Contact</th><th>Mobile</th><th>Status</th><th>ID</th></tr></thead><tbody>${rows.length ? rows.map((row) => `<tr><td><strong>${esc(`${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unnamed user')}</strong><small>${esc(row.email_id || '')}</small></td><td>${esc(row.email_id || '—')}</td><td>${esc(row.mobile_number || '—')}</td><td>${formatStatus(row.status)}</td><td><small>#${esc(row.id)}</small></td></tr>`).join('') : `<tr><td colspan="5"><div class="empty"><strong>No users found</strong>Try another search or refresh the connection.</div></td></tr>`}</tbody></table></div></section>`;
}

function organisersView() {
  const rows = state.data?.organisers?.organizers || state.data?.organisers?.organisers || [];
  const applications = state.data?.applications?.applications || [];
  return `<div class="page-toolbar"><div><h2>Organisers</h2><div class="panel-sub">Organisations and applications connected to the Organiser app.</div></div><input class="search" id="table-search" placeholder="Search organisations" value="${esc(state.search)}" /></div><section class="panel table-panel"><div class="table-scroll"><table><thead><tr><th>Organisation</th><th>Contact</th><th>Status</th><th>ID</th></tr></thead><tbody>${rows.length ? rows.map((row) => `<tr><td><strong>${esc(row.organization_name || row.first_name || row.name || 'Organisation')}</strong><small>${esc(row.last_name || '')}</small></td><td>${esc(row.email_id || row.email || '—')}</td><td>${formatStatus(row.status)}</td><td><small>#${esc(row.id || row.user_id || '')}</small></td></tr>`).join('') : `<tr><td colspan="4"><div class="empty"><strong>No organisers found</strong>Try another search or refresh the connection.</div></td></tr>`}</tbody></table></div></section><section class="panel" style="margin-top:18px"><div class="panel-header"><div><h2>Applications queue</h2><div class="panel-sub">Review requests before they become visible in the organiser app.</div></div><span class="status-pill ${applications.length ? 'preview' : ''}">${applications.length} waiting</span></div>${applications.length ? `<div class="table-scroll"><table><thead><tr><th>Applicant</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead><tbody>${applications.map((row) => `<tr><td><strong>${esc(row.organization_name || 'Organisation')}</strong><small>${esc(row.email_id || '')}</small></td><td>${formatDate(row.submitted_on)}</td><td>${formatStatus(row.status)}</td><td>${state.preview ? '<small>Live admin required</small>' : `<button class="row-action" data-review="${esc(row.id)}">Review</button>`}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">No pending applications.</div>'}</section>`;
}

function eventsView() {
  const rows = state.data?.events?.events || [];
  return `<div class="page-toolbar"><div><h2>Events & courses</h2><div class="panel-sub">The catalogue currently visible to users, including booking and price state.</div></div><input class="search" id="table-search" placeholder="Search listings" value="${esc(state.search)}" /></div><section class="panel table-panel"><div class="table-scroll"><table><thead><tr><th>Listing</th><th>Organiser</th><th>Next date</th><th>Access</th><th>Bookings</th><th>Status</th></tr></thead><tbody>${rows.length ? rows.map((row) => `<tr><td><strong>${esc(row.title || 'Untitled listing')}</strong><small>${esc(row.category_title || row.event_type || 'Event')} · #${esc(row.id)}</small></td><td>${esc(row.organiser || row.organizer || '—')}</td><td>${formatDate(row.start_date)}</td><td>${Number(row.price_type) === 1 ? `<span class="tag pending">Paid${row.price != null ? ` · ${esc(row.price)} GBP` : ''}</span>` : '<span class="tag">Free</span>'}</td><td>${Number(row.participant_count || 0).toLocaleString()}</td><td>${formatStatus(row.status)}</td></tr>`).join('') : `<tr><td colspan="6"><div class="empty"><strong>No listings found</strong>Try another search or refresh the connection.</div></td></tr>`}</tbody></table></div></section>`;
}

function paymentsView() {
  const finance = state.data?.finance || {};
  const orders = finance.orders || [];
  const refunds = finance.refunds || [];
  const payouts = finance.payouts || [];
  const gross = finance.gross || { amount: '0.00', currency: 'GBP' };
  const refunded = finance.refunded || { amount: '0.00', currency: 'GBP' };
  return `<div class="metrics">${metric('Gross sales', `${gross.currency || 'GBP'} ${gross.amount || '0.00'}`, `${finance.paid_order_count || 0} paid orders`, 'wallet')}${metric('Pending payments', finance.pending_order_count || 0, 'awaiting confirmation', 'pulse')}${metric('Refunds', `${refunded.currency || 'GBP'} ${refunded.amount || '0.00'}`, `${finance.refund_pending_count || 0} need attention`, 'arrow')}${metric('Payout queue', finance.payout_pending_count || 0, 'organiser transfers', 'building')}</div><section class="panel table-panel"><div class="panel-header" style="padding:21px 21px 0"><div><h2>Payment orders</h2><div class="panel-sub">Secure order snapshots recorded by OnDeen and Stripe.</div></div><span class="status-pill"><span class="status-dot"></span>${finance.order_count || orders.length} total</span></div><div class="table-scroll"><table><thead><tr><th>Order</th><th>Listing</th><th>Buyer</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead><tbody>${orders.length ? orders.map((row) => `<tr><td><strong>#${esc(row.id || '')}</strong><small>${esc(row.order_key || '')}</small></td><td>${esc(row.event_title || '—')}</td><td><strong>${esc(row.buyer_name || 'Guest')}</strong><small>${esc(row.buyer_email || '')}</small></td><td>${esc(row.gross?.currency || 'GBP')} ${esc(row.gross?.amount || '0.00')}</td><td>${formatStatus(row.status)}</td><td>${formatDate(row.created_on)}</td></tr>`).join('') : `<tr><td colspan="6"><div class="empty"><strong>No payment orders found</strong>Paid and pending orders will appear here.</div></td></tr>`}</tbody></table></div></section><section class="panel" style="margin-top:18px"><div class="panel-header"><div><h2>Refund queue</h2><div class="panel-sub">Refunds remain auditable; the original payment snapshot is never overwritten.</div></div><span class="status-pill ${refunds.length ? 'preview' : ''}">${refunds.length} request${refunds.length === 1 ? '' : 's'}</span></div>${refunds.length ? `<div class="table-scroll"><table><thead><tr><th>Request</th><th>Listing</th><th>Buyer</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>${refunds.map((row) => `<tr><td>#${esc(row.id)}</td><td>${esc(row.event_title || '—')}</td><td>${esc(row.buyer_name || 'Guest')}</td><td>${esc(row.currency || 'GBP').toUpperCase()} ${((Number(row.requested_amount_pence || 0) / 100).toFixed(2))}</td><td>${formatStatus(row.status)}</td><td>${row.status === 'approved_awaiting_ondeen' && !state.preview ? `<button class="row-action" data-refund="${esc(row.id)}">Process</button>` : '<small>—</small>'}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">No refund requests.</div>'}</section><section class="panel" style="margin-top:18px"><div class="panel-header"><div><h2>Payout queue</h2><div class="panel-sub">Amounts scheduled for organiser transfer after the event settlement window.</div></div><span class="status-pill">${payouts.length} record${payouts.length === 1 ? '' : 's'}</span></div>${payouts.length ? `<div class="table-scroll"><table><thead><tr><th>Payout</th><th>Listing</th><th>Organiser</th><th>Amount</th><th>Eligible</th><th>Status</th></tr></thead><tbody>${payouts.map((row) => `<tr><td>#${esc(row.id)}<small>${esc(row.order_key || '')}</small></td><td>${esc(row.event_title || '—')}</td><td>#${esc(row.organizer_id || '—')}</td><td>${esc(row.amount?.currency || 'GBP')} ${esc(row.amount?.amount || '0.00')}</td><td>${formatDate(row.eligible_on)}</td><td>${formatStatus(row.status)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">No payout records found.</div>'}</section>`;
}

function appView() {
  const pageTitles = { overview: ['Good morning, admin.', 'A clear view of the OnDeen community.'], users: ['Users', 'A live view of the people using OnDeen.'], organisers: ['Organisers', 'Review the organisations behind each listing.'], events: ['Events & courses', 'Keep the catalogue clear, current and useful.'], payments: ['Payments', 'Follow every paid booking, refund and organiser payout.'] };
  const [title, subtitle] = pageTitles[state.view] || pageTitles.overview;
  const page = state.view === 'overview' ? overviewView() : state.view === 'users' ? usersView() : state.view === 'organisers' ? organisersView() : state.view === 'events' ? eventsView() : paymentsView();
  return `<main class="app-shell">${sidebar()}<section class="main"><header class="topbar"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="top-actions"><span class="status-pill ${state.preview ? 'preview' : ''}"><span class="status-dot"></span>${state.preview ? 'Preview data' : 'Railway live'}</span><button class="refresh" id="refresh" title="Refresh data">${icon('refresh')}</button></div></header>${state.preview ? '<div class="banner"><span><strong>Preview mode.</strong> The requested admin login is accepted locally while the Railway database account is being provisioned. No changes are written from this mode.</span><button id="retry-live">Retry live sign-in</button></div>' : ''}${state.error ? `<div class="error">${esc(state.error)}</div>` : ''}${state.loading ? '<div class="panel"><div class="empty">Refreshing the workspace…</div></div>' : page}</section></main>`;
}

function render() {
  const root = document.getElementById('app');
  root.innerHTML = state.token || state.preview ? appView() : loginView();
  bindEvents();
}

function toast(message) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const item = document.createElement('div');
  item.className = 'toast';
  item.textContent = message;
  document.body.appendChild(item);
  setTimeout(() => item.remove(), 3200);
}

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
    state.view = button.dataset.view;
    state.search = '';
    render();
  }));
  const login = document.getElementById('login-form');
  if (login) login.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = login.querySelector('button');
    const error = document.getElementById('login-error');
    button.disabled = true;
    button.firstChild.textContent = 'Connecting… ';
    error.innerHTML = '';
    const email = login.email.value.trim();
    const password = login.password.value;
    try {
      const payload = await api('/admin_app/admin/login', { method: 'POST', body: JSON.stringify({ email_id: email, password }) });
      state.token = payload.access_token;
      state.profile = payload.profile || { email_id: email, first_name: 'Admin' };
      state.preview = false;
      sessionStorage.setItem('ondeen_admin_token', state.token);
      sessionStorage.setItem('ondeen_admin_profile', JSON.stringify(state.profile));
      sessionStorage.removeItem('ondeen_admin_preview');
      await loadData();
    } catch (requestError) {
      error.innerHTML = `<div class="error">${esc(requestError.message || 'Unable to sign in. Check your details and try again.')}</div>`;
      button.disabled = false;
      button.firstChild.textContent = 'Enter the console ';
    }
  });
  const logout = document.getElementById('logout');
  if (logout) logout.addEventListener('click', () => {
    state.token = ''; state.preview = false; state.profile = null; state.data = null;
    sessionStorage.removeItem('ondeen_admin_token'); sessionStorage.removeItem('ondeen_admin_profile'); sessionStorage.removeItem('ondeen_admin_preview');
    render();
  });
  const refresh = document.getElementById('refresh');
  if (refresh) refresh.addEventListener('click', () => loadData());
  const search = document.getElementById('table-search');
  if (search) search.addEventListener('change', () => { state.search = search.value.trim(); loadData(); });
  document.querySelectorAll('[data-review]').forEach((button) => button.addEventListener('click', async () => {
    const status = window.prompt('Decision: APPROVED, NEEDS_MORE_INFO or REJECTED', 'APPROVED');
    if (!status) return;
    try {
      await api('/admin_app/organizer/applications/review', { method: 'POST', body: JSON.stringify({ application_id: Number(button.dataset.review), status: status.toUpperCase() }) });
      toast('Application reviewed successfully.');
      await loadData();
    } catch (error) { toast(error.message || 'The application could not be reviewed.'); }
  }));
  document.querySelectorAll('[data-refund]').forEach((button) => button.addEventListener('click', async () => {
    if (!window.confirm('Process this approved refund in Stripe Test? This will update the booking and finance ledger.')) return;
    button.disabled = true;
    try {
      await api(`/payment/refunds/${encodeURIComponent(button.dataset.refund)}/execute`, { method: 'POST', body: JSON.stringify({}) });
      toast('Refund processing started.');
      await loadData();
    } catch (error) { button.disabled = false; toast(error.message || 'The refund could not be processed.'); }
  }));
}

render();
if (state.token) loadData();
