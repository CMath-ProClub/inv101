// Adapter for the permanent simulator page.
// If `stock-simulator.js` loads and provides `allStocks`, this script will use that data to populate
// holdings (best-effort). Otherwise it falls back to small mock data so the UI is functional.

const fallbackPrices = [162727.5, 162000, 162500, 163000, 162200, 162900, 169705.1];
const fallbackLabels = ['Oct 21', 'Oct 22', 'Oct 23', 'Oct 24', 'Oct 25', 'Oct 26', 'Oct 27'];

function buildChart(labels = fallbackLabels, prices = fallbackPrices) {
  const canvas = document.getElementById('performanceChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  // Destroy existing chart instance if present (safe-guard when hot-reloading)
  if (canvas._chartInstance) {
    try { canvas._chartInstance.destroy(); } catch (e) {}
  }
  canvas._chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'account_value',
        data: prices,
        borderColor: 'rgba(59,130,246,0.9)',
        backgroundColor: 'rgba(59,130,246,0.06)',
        tension: 0.25,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              if (typeof Intl !== 'undefined') return '$' + Number(value).toLocaleString();
              return '$' + value;
            }
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const v = context.parsed.y;
              if (typeof Intl !== 'undefined') return 'Value: $' + Number(v).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
              return 'Value: $' + v;
            }
          }
        }
      }
    }
  });
}

function buildHoldingsFromAllStocks(allStocks) {
  // Best-effort: pick top 6 by market cap/price and assign a sample qty
  const slice = allStocks.slice(0, 6);
  return slice.map((s, i) => ({
    symbol: s.symbol || s.ticker || 'N/A',
    name: s.name || s.longName || s.description || (s.symbol || 'Stock'),
    price: Number(s.price || s.regularMarketPrice || s.lastPrice || 0),
    change: Number(s.change || s.regularMarketChange || 0),
    purchase: Number((s.price || s.regularMarketPrice || 0) * 0.9).toFixed(2),
    qty: (i + 1) * 10
  }));
}

function renderHoldingsRows(rows) {
  const root = document.getElementById('holdingsTable');
  if (!root) return;
  root.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'holding-row';
  header.innerHTML = `
    <div class="symbol">Symbol</div>
    <div class="col-name">Description</div>
    <div class="col-price">Current Price</div>
    <div class="col-change">Today's Change</div>
    <div class="col-purchase">Purchase Price / QTY</div>
    <div class="col-total">Total Value</div>
  `;
  root.appendChild(header);

  rows.forEach(h => {
    const row = document.createElement('div');
    row.className = 'holding-row';
    const totalValue = (Number(h.price) * Number(h.qty)).toFixed(2);
    row.innerHTML = `
      <div class="symbol">${h.symbol}</div>
      <div class="col-name">${h.name}</div>
      <div class="col-price">$${Number(h.price).toFixed(2)}</div>
      <div class="col-change">$${Number(h.change).toFixed(2)} <span class="muted">(0.00%)</span></div>
      <div class="col-purchase">$${Number(h.purchase).toFixed(2)} / ${h.qty}</div>
      <div class="col-total">$${Number(totalValue).toLocaleString()}</div>
      <div class="holding-actions">
        <button class="btn btn-ghost small" onclick="openTradeModal('buy','${h.symbol}')">Buy</button>
        <button class="btn btn-ghost small" onclick="openTradeModal('sell','${h.symbol}')">Sell</button>
        <button class="btn btn-ghost small" onclick="openTradeModal('short','${h.symbol}')">Short</button>
      </div>
    `;
    root.appendChild(row);
  });
}

// Authentication helpers (UI + fetch)
function showAuthModal() {
  document.getElementById('authModal').style.display = 'block';
}

function hideAuthModal() { document.getElementById('authModal').style.display = 'none'; }

async function doAuth(action) {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const url = action === 'signup' ? '/api/auth/signup' : '/api/auth/login';
  // Send credentials and allow server to set HttpOnly cookie
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }), credentials: 'include' });
  const body = await res.json();
  const msgEl = document.getElementById('authMsg');
  if (body.success) {
    msgEl.textContent = 'Signed in';
    hideAuthModal();
    tryUseLiveDataOrFallback();
  } else {
    msgEl.textContent = body.error || 'Authentication failed';
  }
}

async function doSignOut() {
  try {
    const resp = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    const body = await resp.json().catch(() => ({}));
    // Refresh UI after logout
    tryUseLiveDataOrFallback();
    return body;
  } catch (e) {
    console.warn('Sign out failed', e);
    return { success: false, error: e.message };
  }
}

function getAuthToken() { return null; /* tokens are stored in HttpOnly cookie set by server */ }

async function fetchAuthState() {
  try {
    const resp = await fetch('/api/auth/me', { credentials: 'include' });
    if (!resp.ok) {
      // not signed in
      const signinBtn = document.getElementById('signinBtn');
      const signoutBtn = document.getElementById('signoutBtn');
      const userEmail = document.getElementById('userEmail');
      if (signinBtn) signinBtn.style.display = '';
      if (signoutBtn) signoutBtn.style.display = 'none';
      if (userEmail) { userEmail.style.display = 'none'; userEmail.textContent = ''; }
      return null;
    }
    const body = await resp.json();
    if (body && body.success && body.user) {
      const signinBtn = document.getElementById('signinBtn');
      const signoutBtn = document.getElementById('signoutBtn');
      const userEmail = document.getElementById('userEmail');
      if (signinBtn) signinBtn.style.display = 'none';
      if (signoutBtn) signoutBtn.style.display = '';
      if (userEmail) { userEmail.style.display = ''; userEmail.textContent = body.user.email; }
      return body.user;
    }
  } catch (e) {
    console.warn('Failed to fetch auth state', e);
  }
  return null;
}

// fetchWithAuth: wrapper that retries once after refreshing access token
async function fetchWithAuth(url, opts = {}) {
  opts = Object.assign({ credentials: 'include', headers: {} }, opts || {});
  // ensure Content-Type not overwritten if body is FormData
  if (opts.body && !(opts.body instanceof FormData)) {
    opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  }

  let resp = await fetch(url, opts);
  if (resp.status !== 401) return resp;

  // Try refresh once
  try {
    const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    if (r.ok) {
      // Retry original request once
      resp = await fetch(url, opts);
      return resp;
    }
  } catch (e) {
    console.warn('Refresh attempt failed', e);
  }
  // If refresh failed, prompt for login
  showAuthModal();
  return resp; // likely 401
}

// showConfirm returns a Promise that resolves to true/false based on user action
function showConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const msg = document.getElementById('confirmMsg');
    const ok = document.getElementById('confirmOk');
    const cancel = document.getElementById('confirmCancel');
    if (!modal || !msg || !ok || !cancel) return resolve(confirm(message));
    msg.textContent = message;
    const previousFocus = document.activeElement;
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');

    function cleanup(result) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      ok.removeEventListener('click', onOk);
      cancel.removeEventListener('click', onCancel);
      document.removeEventListener('keydown', onKeydown);
      try { if (previousFocus && previousFocus.focus) previousFocus.focus(); } catch (e) {}
      resolve(result);
    }

    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }

    function onKeydown(e) {
      if (e.key === 'Escape') { e.preventDefault(); cleanup(false); }
      if (e.key === 'Tab') {
        // simple focus trap between cancel and ok
        const focusable = [cancel, ok];
        const idx = focusable.indexOf(document.activeElement);
        if (e.shiftKey) {
          // move backward
          const next = idx <= 0 ? focusable.length - 1 : idx - 1;
          focusable[next].focus();
          e.preventDefault();
        } else {
          // move forward
          const next = idx === -1 || idx === focusable.length - 1 ? 0 : idx + 1;
          focusable[next].focus();
          e.preventDefault();
        }
      }
    }

    ok.addEventListener('click', onOk);
    cancel.addEventListener('click', onCancel);
    document.addEventListener('keydown', onKeydown);

    // focus first interactive element
    setTimeout(() => { cancel.focus(); }, 0);
  });
}

let _tradeConfirmHandler = null;
function openTradeModal(type, symbol) {
  const modal = document.getElementById('tradeModal');
  if (!modal) return alert('Trade UI not available');
  document.getElementById('tradeType').value = type;
  document.getElementById('tradeSymbol').value = symbol || '';
  document.getElementById('tradeQty').value = '';
  document.getElementById('tradePrice').value = '';
  document.getElementById('tradeMsg').textContent = '';
  modal.style.display = 'block';
  modal.setAttribute('aria-hidden', 'false');
  const previousFocus = document.activeElement;

  // Focus trap & ESC handler for trade modal
  function onKeydown(e) {
    if (e.key === 'Escape') {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', onKeydown);
      try { if (previousFocus && previousFocus.focus) previousFocus.focus(); } catch (err) {}
    }
    if (e.key === 'Tab') {
      const focusable = Array.from(modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => !el.disabled && el.offsetParent !== null);
      if (focusable.length === 0) return;
      const idx = focusable.indexOf(document.activeElement);
      if (e.shiftKey) {
        const next = idx <= 0 ? focusable.length - 1 : idx - 1;
        focusable[next].focus();
        e.preventDefault();
      } else {
        const next = idx === -1 || idx === focusable.length - 1 ? 0 : idx + 1;
        focusable[next].focus();
        e.preventDefault();
      }
    }
  }
  document.addEventListener('keydown', onKeydown);

  const confirmBtn = document.getElementById('tradeConfirm');
  const cancelBtn = document.getElementById('tradeCancel');
  if (_tradeConfirmHandler) confirmBtn.removeEventListener('click', _tradeConfirmHandler);
  _tradeConfirmHandler = async function() {
    const t = document.getElementById('tradeType').value;
    const sym = document.getElementById('tradeSymbol').value.trim();
    const qty = Number(document.getElementById('tradeQty').value);
    const priceVal = document.getElementById('tradePrice').value;
    let price = priceVal ? Number(priceVal) : null;
    const msg = document.getElementById('tradeMsg');
    if (!sym || !qty || qty <= 0) { msg.textContent = 'Enter a valid symbol and positive quantity'; return; }
    const endpoint = t === 'buy' ? '/api/portfolio/buy' : (t === 'sell' ? '/api/portfolio/sell' : '/api/portfolio/short');
    try {
      // If price not provided, try to fetch current cached price
      if (!price) {
        try {
          const cp = await fetchWithAuth(`/api/stocks/cached/${encodeURIComponent(sym)}`);
          if (cp.ok) {
            const cpb = await cp.json();
            const p = cpb.stock && (cpb.stock.price || cpb.stock.regularMarketPrice || cpb.stock.lastPrice);
            if (p) price = Number(p);
          }
        } catch (e) { /* ignore */ }
      }

  // Confirm trade details with the user using the in-UI modal
  const confirmText = `${t.toUpperCase()} ${qty} × ${sym}` + (price ? ` @ $${Number(price).toFixed(2)} each` : ' (market price)') + '\n\nProceed?';
  const ok = await showConfirm(confirmText);
  if (!ok) { msg.textContent = 'Trade cancelled'; return; }
  const resp = await fetchWithAuth(endpoint, { method: 'POST', body: JSON.stringify({ symbol: sym, qty, price }) });
  const body = await resp.json();
      if (body.success) {
        msg.textContent = `${t} executed`;
        setTimeout(() => { modal.style.display = 'none'; }, 600);
        tryUseLiveDataOrFallback();
      } else {
        msg.textContent = body.error || 'Trade failed';
        if (body.error && body.error.toLowerCase().includes('token')) showAuthModal();
      }
    } catch (e) { console.error('Trade error', e); msg.textContent = 'Trade failed'; }
  };
  confirmBtn.addEventListener('click', _tradeConfirmHandler);
  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKeydown);
    try { if (previousFocus && previousFocus.focus) previousFocus.focus(); } catch (err) {}
  });
  // ensure cancel button focused for keyboard users
  setTimeout(() => { try { cancelBtn.focus(); } catch (e) {} }, 0);
}

async function tryUseLiveDataOrFallback() {
  // 1) Prefer the dedicated backend portfolio endpoint (live enrichment)
  try {
  const portfolioResp = await fetchWithAuth('/api/portfolio?live=true');
    if (portfolioResp.ok) {
      const body = await portfolioResp.json();
      if (body.success && body.portfolio) {
        const p = body.portfolio;
        // Render holdings using enriched currentPrice if available
        const rows = p.holdings.map(h => ({
          symbol: h.symbol,
          name: h.name || h.symbol,
          price: Number(h.currentPrice || h.purchasePrice || 0),
          change: Number(h.change || 0),
          purchase: Number(h.purchasePrice || h.purchase || 0),
          qty: Number(h.qty || 0)
        }));
        renderHoldingsRows(rows);

        // Build chart from demo SPY series if available
        try {
          const spyResp = await fetch('/api/demo/spy');
          if (spyResp.ok) {
            const spyBody = await spyResp.json();
            if (spyBody.success && spyBody.data && spyBody.data.series) {
              const labels = spyBody.data.series.map(s => s.date);
              const prices = spyBody.data.series.map(s => s.close);
              buildChart(labels, prices);
            } else {
              buildChart();
            }
          } else {
            buildChart();
          }
        } catch (e) {
          console.warn('Failed to load demo SPY series, using fallback chart', e);
          buildChart();
        }

        // Populate account summary fields if present
        if (p.account) {
          const a = p.account;
          const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
          setText('accountValue', `$${Number(a.accountValue).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`);
          setText('buyingPower', `$${Number(a.buyingPower).toLocaleString()}`);
          setText('cash', `$${Number(a.cash).toLocaleString()}`);
          setText('annualReturn', `${Number(a.annualReturn).toFixed(2)}%`);
        }

        console.log('Simulator adapter: using backend /api/portfolio data');
        return;
      }
    }
  } catch (err) {
    console.warn('Portfolio fetch failed (continuing to other fallbacks):', err.message);
  }

  // 2) Try to use window.allStocks (existing client script) as a fallback
  if (window.allStocks && window.allStocks.length > 0) {
    try {
      const rows = buildHoldingsFromAllStocks(window.allStocks);
      renderHoldingsRows(rows);
      const labels = rows.map((r, i) => `P${i + 1}`);
      const prices = rows.map(r => Number(r.price));
      buildChart(labels, prices);
      console.log('Simulator adapter: using live allStocks data');
      return;
    } catch (e) {
      console.warn('Simulator adapter: error using live data, falling back', e);
    }
  }

  // 3) Final fallback: local hardcoded demo
  const fallbackHoldings = [
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 226.97, change: 0.00, purchase: 176.81, qty: 560 },
    { symbol: 'DBD', name: 'Diebold Nixdorf Inc', price: 58.70, change: 0.00, purchase: 8.74, qty: 500 },
    { symbol: 'FNF', name: 'Fidelity National Financial Inc', price: 56.99, change: 0.00, purchase: 51.36, qty: 60 }
  ];
  renderHoldingsRows(fallbackHoldings);
  // Attempt to load demo SPY series for chart, else default
  try {
    const spyResp = await fetch('/api/demo/spy');
    if (spyResp.ok) {
      const spyBody = await spyResp.json();
      if (spyBody.success && spyBody.data && spyBody.data.series) {
        const labels = spyBody.data.series.map(s => s.date);
        const prices = spyBody.data.series.map(s => s.close);
        buildChart(labels, prices);
        return;
      }
    }
  } catch (e) {
    // ignore
  }
  buildChart();
}

// Run on DOM ready. If stock-simulator.js loads later and populates allStocks asynchronously,
// it will call its own rendering; this adapter will pick up live data if already present.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Attach auth UI handlers
    const signinBtn = document.getElementById('signinBtn');
    if (signinBtn) signinBtn.addEventListener('click', showAuthModal);
    const signIn = document.getElementById('authSignin');
    const signUp = document.getElementById('authSignup');
    const authClose = document.getElementById('authClose');
    if (signIn) signIn.addEventListener('click', () => doAuth('login'));
    if (signUp) signUp.addEventListener('click', () => doAuth('signup'));
    if (authClose) authClose.addEventListener('click', hideAuthModal);
    const signoutBtn = document.getElementById('signoutBtn');
    if (signoutBtn) signoutBtn.addEventListener('click', () => doSignOut());
    fetchAuthState().then(() => tryUseLiveDataOrFallback());
  });
} else {
  // Attach auth UI handlers
  const signinBtn = document.getElementById('signinBtn');
  if (signinBtn) signinBtn.addEventListener('click', showAuthModal);
  const signIn = document.getElementById('authSignin');
  const signUp = document.getElementById('authSignup');
  const authClose = document.getElementById('authClose');
  if (signIn) signIn.addEventListener('click', () => doAuth('login'));
  if (signUp) signUp.addEventListener('click', () => doAuth('signup'));
  if (authClose) authClose.addEventListener('click', hideAuthModal);
  const signoutBtn = document.getElementById('signoutBtn');
  if (signoutBtn) signoutBtn.addEventListener('click', () => doSignOut());
  fetchAuthState().then(() => tryUseLiveDataOrFallback());
}
