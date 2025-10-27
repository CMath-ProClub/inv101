// Stock Market Simulator JavaScript
// Connects to backend API for real-time stock data from Yahoo Finance

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'
  : 'https://your-backend-url.com'; // Update with your deployed backend URL

let allStocks = [];
let displayedStocks = [];
let currentFilter = 'all';
let currentSector = 'all';
let currentPage = 1;
const STOCKS_PER_PAGE = 50;

// Initialize the application
async function init() {
  showLoading('Loading 1,600+ stocks with live prices...');
  
  try {
    await loadStockData();
    setupEventListeners();
    hideLoading();
  } catch (error) {
    hideLoading();
    showError('Failed to load stock data. Please try again.');
    console.error('Init error:', error);
  }
}

// Load stock data from backend API
async function loadStockData(forceRefresh = false) {
  try {
    const url = `${API_BASE_URL}/api/stocks/all${forceRefresh ? '?refresh=true' : ''}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success) {
      allStocks = data.stocks;
      updateMarketOverview();
      applyFilters();
      console.log(`✅ Loaded ${allStocks.length} stocks`);
    } else {
      throw new Error(data.error || 'Failed to load stocks');
    }
  } catch (error) {
    console.error('Error loading stock data:', error);
    
    // Fallback to loading message if backend is not available
    if (allStocks.length === 0) {
      showError(`
        <strong>Backend Connection Required</strong><br>
        Please start the backend server to load live stock data:<br>
        <code>cd backend && node index.js</code><br><br>
        The backend will fetch real-time prices for 1,600+ stocks using Yahoo Finance.
      `);
    }
  }
}

// Update market overview statistics
function updateMarketOverview() {
  const gainers = allStocks.filter(s => s.changePercent > 0).length;
  const losers = allStocks.filter(s => s.changePercent < 0).length;
  const now = new Date();
  
  document.getElementById('totalStocks').textContent = allStocks.length.toLocaleString();
  document.getElementById('gainersCount').textContent = gainers.toLocaleString();
  document.getElementById('losersCount').textContent = losers.toLocaleString();
  document.getElementById('lastUpdated').textContent = now.toLocaleTimeString();
}

// Apply active filters and display stocks
function applyFilters() {
  let filtered = [...allStocks];
  
  // Apply market view filter
  if (currentFilter === 'gainers') {
    filtered = filtered.filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent);
    document.getElementById('listTitle').textContent = 'Top Gainers';
  } else if (currentFilter === 'losers') {
    filtered = filtered.filter(s => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent);
    document.getElementById('listTitle').textContent = 'Top Losers';
  } else {
    document.getElementById('listTitle').textContent = `All Stocks (${allStocks.length.toLocaleString()})`;
  }
  
  // Apply sector filter
  if (currentSector !== 'all') {
    filtered = filtered.filter(s => s.sector === currentSector);
    document.getElementById('listTitle').textContent = `${currentSector} Stocks`;
  }
  
  displayedStocks = filtered;
  currentPage = 1;
  renderStocks();
  renderPagination();
}

// Render stocks for current page
function renderStocks() {
  const stockList = document.getElementById('stockList');
  const start = (currentPage - 1) * STOCKS_PER_PAGE;
  const end = start + STOCKS_PER_PAGE;
  const pageStocks = displayedStocks.slice(start, end);
  
  if (pageStocks.length === 0) {
    stockList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <h3>No stocks found</h3>
        <p>Try adjusting your filters or search criteria</p>
      </div>
    `;
    return;
  }
  
  stockList.innerHTML = pageStocks.map(stock => `
    <div class="stock-row" data-symbol="${stock.symbol}">
      <div class="stock-symbol">
        <div class="symbol-code">${stock.symbol}</div>
        <div class="symbol-name">${stock.name}</div>
      </div>
      <div class="stock-price">
        $${formatPrice(stock.price)}
      </div>
      <div class="stock-change ${stock.changePercent >= 0 ? 'positive' : 'negative'}">
        <div class="change-value">
          ${stock.changePercent >= 0 ? '▲' : '▼'}
          <span>$${Math.abs(stock.change).toFixed(2)}</span>
        </div>
        <div class="change-percent">
          (${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)
        </div>
      </div>
      <div class="stock-volume">
        ${formatVolume(stock.volume)}
      </div>
      <div class="stock-action">
        <button class="action-btn buy-btn" onclick="buyStock('${stock.symbol}', ${stock.price})">
          Buy
        </button>
      </div>
    </div>
  `).join('');
}

// Render pagination controls
function renderPagination() {
  const totalPages = Math.ceil(displayedStocks.length / STOCKS_PER_PAGE);
  const pagination = document.getElementById('pagination');
  
  if (totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }
  
  pagination.style.display = 'flex';
  
  let paginationHTML = `
    <button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
      ← Previous
    </button>
  `;
  
  // Show page numbers (with ellipsis for large ranges)
  const maxButtons = 7;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  
  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }
  
  if (startPage > 1) {
    paginationHTML += `<button class="page-btn" onclick="changePage(1)">1</button>`;
    if (startPage > 2) paginationHTML += `<span class="page-info">...</span>`;
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) paginationHTML += `<span class="page-info">...</span>`;
    paginationHTML += `<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
  }
  
  paginationHTML += `
    <button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
      Next →
    </button>
  `;
  
  pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
  const totalPages = Math.ceil(displayedStocks.length / STOCKS_PER_PAGE);
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  renderStocks();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Search stocks
function searchStocks(query) {
  if (!query) {
    applyFilters();
    return;
  }
  
  const searchTerm = query.toLowerCase();
  displayedStocks = allStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm) ||
    stock.name.toLowerCase().includes(searchTerm)
  );
  
  document.getElementById('listTitle').textContent = `Search Results for "${query}"`;
  currentPage = 1;
  renderStocks();
  renderPagination();
}

// Buy stock (placeholder - integrate with portfolio system)
function buyStock(symbol, price) {
  alert(`Buy ${symbol} at $${formatPrice(price)}\n\nPortfolio integration coming soon!`);
  // TODO: Integrate with portfolio management system
}

// Refresh stock data
async function refreshData() {
  showLoading('Refreshing stock prices...');
  try {
    await loadStockData(true);
    hideLoading();
    
    // Show success message
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.innerHTML = `
      <div style="background: #d1fae5; color: #065f46; padding: 16px 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #a7f3d0; font-weight: 500;">
        ✅ Stock prices updated successfully!
      </div>
    `;
    setTimeout(() => {
      errorContainer.innerHTML = '';
    }, 3000);
  } catch (error) {
    hideLoading();
    showError('Failed to refresh data. Please try again.');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('searchInput');
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchStocks(e.target.value);
    }, 300);
  });
  
  // Market view filters
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      applyFilters();
    });
  });
  
  // Sector filters
  document.querySelectorAll('[data-sector]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-sector]').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentSector = e.target.dataset.sector;
      applyFilters();
    });
  });
}

// Utility functions
function formatPrice(price) {
  if (!price) return '0.00';
  return price.toFixed(2);
}

function formatVolume(volume) {
  if (!volume) return '0';
  if (volume >= 1000000000) return (volume / 1000000000).toFixed(2) + 'B';
  if (volume >= 1000000) return (volume / 1000000).toFixed(2) + 'M';
  if (volume >= 1000) return (volume / 1000).toFixed(2) + 'K';
  return volume.toLocaleString();
}

function showLoading(message = 'Loading...') {
  const overlay = document.getElementById('loadingOverlay');
  const text = overlay.querySelector('.loading-text');
  if (text) text.textContent = message;
  overlay.style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

function showError(message) {
  const errorContainer = document.getElementById('errorContainer');
  errorContainer.innerHTML = `
    <div class="error-message">
      ${message}
    </div>
  `;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
