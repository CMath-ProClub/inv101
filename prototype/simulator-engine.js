/**
 * Investing101 Stock Market Simulator Engine
 * Professional-grade virtual trading platform
 * Mimics Investopedia simulator with enhanced UX
 */

// Configuration
const CONFIG = {
  STARTING_BALANCE: 10000,
  TRANSACTION_FEE: 4.95,
  SHORT_INTEREST_RATE: 0.05, // 5% annual
  API_ENDPOINT: typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'https://inv101.onrender.com',
  REFRESH_INTERVAL: 120000, // 2 minutes
  MARKET_OPEN_HOUR: 9.5, // 9:30 AM EST
  MARKET_CLOSE_HOUR: 16, // 4:00 PM EST
};

// Portfolio State
class Portfolio {
  constructor() {
    this.cash = CONFIG.STARTING_BALANCE;
    this.holdings = {}; // { symbol: { shares, avgCost, type: 'long'|'short' } }
    this.transactions = [];
    this.watchlist = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'];
    this.achievements = ['beginner'];
    this.load();
  }

  save() {
    try {
      localStorage.setItem('inv101_portfolio', JSON.stringify({
        cash: this.cash,
        holdings: this.holdings,
        transactions: this.transactions,
        watchlist: this.watchlist,
        achievements: this.achievements,
        lastSaved: Date.now()
      }));
    } catch (e) {
      console.error('Failed to save portfolio:', e);
    }
  }

  load() {
    try {
      const saved = localStorage.getItem('inv101_portfolio');
      if (saved) {
        const data = JSON.parse(saved);
        this.cash = data.cash || CONFIG.STARTING_BALANCE;
        this.holdings = data.holdings || {};
        this.transactions = data.transactions || [];
        this.watchlist = data.watchlist || ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'];
        this.achievements = data.achievements || ['beginner'];
      }
    } catch (e) {
      console.error('Failed to load portfolio:', e);
    }
  }

  reset() {
    if (confirm('Are you sure you want to reset your portfolio? This cannot be undone.')) {
      localStorage.removeItem('inv101_portfolio');
      this.cash = CONFIG.STARTING_BALANCE;
      this.holdings = {};
      this.transactions = [];
      this.watchlist = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'];
      this.achievements = ['beginner'];
      this.save();
      window.location.reload();
    }
  }

  getTotalValue(prices) {
    let total = this.cash;
    for (const [symbol, holding] of Object.entries(this.holdings)) {
      const price = prices[symbol] || holding.avgCost;
      if (holding.type === 'long') {
        total += holding.shares * price;
      } else {
        // Short position value
        total += holding.shares * (2 * holding.avgCost - price);
      }
    }
    return total;
  }

  getGainLoss(prices) {
    const totalValue = this.getTotalValue(prices);
    const gain = totalValue - CONFIG.STARTING_BALANCE;
    const percent = (gain / CONFIG.STARTING_BALANCE) * 100;
    return { gain, percent };
  }

  checkAchievements() {
    const newAchievements = [];
    
    if (this.transactions.length >= 1 && !this.achievements.includes('first_trade')) {
      newAchievements.push({
        id: 'first_trade',
        name: 'First Trade',
        desc: 'Placed your first order',
        icon: '🎯'
      });
      this.achievements.push('first_trade');
    }

    if (this.transactions.length >= 10 && !this.achievements.includes('active_trader')) {
      newAchievements.push({
        id: 'active_trader',
        name: 'Active Trader',
        desc: 'Completed 10 trades',
        icon: '📈'
      });
      this.achievements.push('active_trader');
    }

    if (Object.keys(this.holdings).length >= 5 && !this.achievements.includes('diversified')) {
      newAchievements.push({
        id: 'diversified',
        name: 'Diversified Portfolio',
        desc: 'Own 5+ different stocks',
        icon: '🌟'
      });
      this.achievements.push('diversified');
    }

    return newAchievements;
  }
}

// Market Data Manager
class MarketData {
  constructor() {
    this.prices = {};
    this.lastUpdate = null;
    this.isMarketOpen = false;
  }

  async fetchStockPrice(symbol) {
    try {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/api/stock/${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch stock data');
      const data = await response.json();
      
      return {
        price: data.price || 0,
        change: data.changePercent || 0,
        name: data.companyName || symbol,
        open: data.open || data.price,
        high: data.high || data.price,
        low: data.low || data.price,
        volume: data.volume || 0,
        marketCap: data.marketCap || 0,
      };
    } catch (error) {
      console.error(`Failed to fetch ${symbol}:`, error);
      return null;
    }
  }

  async fetchMultipleStocks(symbols) {
    const promises = symbols.map(symbol => this.fetchStockPrice(symbol));
    const results = await Promise.all(promises);
    
    results.forEach((data, index) => {
      if (data) {
        this.prices[symbols[index]] = data;
      }
    });
    
    this.lastUpdate = Date.now();
    return this.prices;
  }

  checkMarketStatus() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours() + now.getMinutes() / 60;
    
    // Weekend
    if (day === 0 || day === 6) {
      this.isMarketOpen = false;
      return { open: false, reason: 'Weekend' };
    }
    
    // Market hours: 9:30 AM - 4:00 PM EST
    if (hour >= CONFIG.MARKET_OPEN_HOUR && hour < CONFIG.MARKET_CLOSE_HOUR) {
      this.isMarketOpen = true;
      return { open: true, reason: 'Market Open' };
    }
    
    if (hour < CONFIG.MARKET_OPEN_HOUR) {
      this.isMarketOpen = false;
      return { open: false, reason: 'Pre-Market' };
    }
    
    this.isMarketOpen = false;
    return { open: false, reason: 'After Hours' };
  }
}

// Trading Engine
class TradingEngine {
  constructor(portfolio, marketData) {
    this.portfolio = portfolio;
    this.marketData = marketData;
  }

  async executeBuy(symbol, quantity, orderType = 'market', limitPrice = null) {
    const stockData = await this.marketData.fetchStockPrice(symbol);
    if (!stockData) {
      return { success: false, error: 'Failed to fetch stock price' };
    }

    const price = orderType === 'limit' ? limitPrice : stockData.price;
    const cost = price * quantity + CONFIG.TRANSACTION_FEE;

    if (cost > this.portfolio.cash) {
      return { success: false, error: 'Insufficient funds' };
    }

    // Execute trade
    this.portfolio.cash -= cost;
    
    if (this.portfolio.holdings[symbol]) {
      // Update average cost
      const current = this.portfolio.holdings[symbol];
      const totalShares = current.shares + quantity;
      const totalCost = (current.shares * current.avgCost) + (quantity * price);
      current.avgCost = totalCost / totalShares;
      current.shares = totalShares;
    } else {
      this.portfolio.holdings[symbol] = {
        shares: quantity,
        avgCost: price,
        type: 'long'
      };
    }

    // Record transaction
    this.portfolio.transactions.unshift({
      symbol,
      type: 'BUY',
      quantity,
      price,
      fee: CONFIG.TRANSACTION_FEE,
      total: cost,
      timestamp: Date.now()
    });

    this.portfolio.save();

    // Check for achievements
    const achievements = this.portfolio.checkAchievements();
    this.portfolio.save();

    return {
      success: true,
      transaction: this.portfolio.transactions[0],
      achievements
    };
  }

  async executeSell(symbol, quantity) {
    if (!this.portfolio.holdings[symbol]) {
      return { success: false, error: 'You do not own this stock' };
    }

    const holding = this.portfolio.holdings[symbol];
    if (holding.shares < quantity) {
      return { success: false, error: 'Insufficient shares' };
    }

    const stockData = await this.marketData.fetchStockPrice(symbol);
    if (!stockData) {
      return { success: false, error: 'Failed to fetch stock price' };
    }

    const price = stockData.price;
    const proceeds = (price * quantity) - CONFIG.TRANSACTION_FEE;

    // Execute trade
    this.portfolio.cash += proceeds;
    holding.shares -= quantity;

    if (holding.shares === 0) {
      delete this.portfolio.holdings[symbol];
    }

    // Record transaction
    this.portfolio.transactions.unshift({
      symbol,
      type: 'SELL',
      quantity,
      price,
      fee: CONFIG.TRANSACTION_FEE,
      total: proceeds,
      gainLoss: (price - holding.avgCost) * quantity,
      timestamp: Date.now()
    });

    this.portfolio.save();

    const achievements = this.portfolio.checkAchievements();
    this.portfolio.save();

    return {
      success: true,
      transaction: this.portfolio.transactions[0],
      achievements
    };
  }

  async executeShort(symbol, quantity) {
    const stockData = await this.marketData.fetchStockPrice(symbol);
    if (!stockData) {
      return { success: false, error: 'Failed to fetch stock price' };
    }

    const price = stockData.price;
    const collateral = price * quantity * 1.5; // 150% collateral requirement

    if (collateral + CONFIG.TRANSACTION_FEE > this.portfolio.cash) {
      return { success: false, error: 'Insufficient funds for collateral' };
    }

    // Execute short
    this.portfolio.cash -= CONFIG.TRANSACTION_FEE;
    
    if (this.portfolio.holdings[symbol] && this.portfolio.holdings[symbol].type === 'short') {
      const current = this.portfolio.holdings[symbol];
      const totalShares = current.shares + quantity;
      const totalCost = (current.shares * current.avgCost) + (quantity * price);
      current.avgCost = totalCost / totalShares;
      current.shares = totalShares;
    } else {
      this.portfolio.holdings[symbol] = {
        shares: quantity,
        avgCost: price,
        type: 'short'
      };
    }

    // Record transaction
    this.portfolio.transactions.unshift({
      symbol,
      type: 'SHORT',
      quantity,
      price,
      fee: CONFIG.TRANSACTION_FEE,
      timestamp: Date.now()
    });

    this.portfolio.save();

    return {
      success: true,
      transaction: this.portfolio.transactions[0]
    };
  }
}

// UI Controller
class SimulatorUI {
  constructor(portfolio, marketData, tradingEngine) {
    this.portfolio = portfolio;
    this.marketData = marketData;
    this.tradingEngine = tradingEngine;
    this.selectedSymbol = null;
    this.chart = null;
  }

  async init() {
    await this.updateMarketStatus();
    await this.refreshData();
    this.updateUI();
    this.setupEventListeners();
    
    // Auto-refresh every 2 minutes
    setInterval(() => this.refreshData(), CONFIG.REFRESH_INTERVAL);
    
    // Update market status every minute
    setInterval(() => this.updateMarketStatus(), 60000);
  }

  async updateMarketStatus() {
    const status = this.marketData.checkMarketStatus();
    const statusElement = document.getElementById('marketStatus');
    const statusText = document.getElementById('statusText');
    const statusDot = statusElement.querySelector('.status-dot');

    if (statusElement) {
      statusElement.className = `market-status ${status.open ? 'open' : 'closed'}`;
      statusDot.className = `status-dot ${status.open ? 'open' : 'closed'}`;
      statusText.textContent = status.reason;
    }
  }

  async refreshData() {
    const symbols = [...new Set([...this.portfolio.watchlist, ...Object.keys(this.portfolio.holdings)])];
    await this.marketData.fetchMultipleStocks(symbols);
    this.updateUI();
  }

  updateUI() {
    this.updatePortfolioSummary();
    this.updateWatchlist();
    this.updateHoldings();
    this.updateOrderHistory();
    this.updateQuickStats();
  }

  updatePortfolioSummary() {
    const { gain, percent } = this.portfolio.getGainLoss(this.marketData.prices);
    const totalValue = this.portfolio.getTotalValue(this.marketData.prices);

    document.getElementById('portfolioValue').textContent = `$${totalValue.toFixed(2)}`;
    document.getElementById('cashBalance').textContent = `$${this.portfolio.cash.toFixed(2)}`;
    document.getElementById('totalGainLoss').textContent = `$${gain.toFixed(2)}`;
    document.getElementById('totalReturn').textContent = `${percent.toFixed(2)}%`;
    document.getElementById('positionsCount').textContent = Object.keys(this.portfolio.holdings).length;

    const changeElement = document.getElementById('portfolioChange');
    changeElement.className = `portfolio-change ${gain >= 0 ? 'gain' : 'loss'}`;
    changeElement.innerHTML = `
      <span>${gain >= 0 ? '↗' : '↘'}</span>
      <span>${gain >= 0 ? '+' : ''}$${gain.toFixed(2)} (${percent.toFixed(2)}%)</span>
    `;
  }

  updateWatchlist() {
    const container = document.getElementById('watchlistContainer');
    if (!container) return;

    container.innerHTML = this.portfolio.watchlist.map(symbol => {
      const data = this.marketData.prices[symbol];
      const price = data ? data.price : 0;
      const change = data ? data.change : 0;

      return `
        <div class="watchlist-item" onclick="simulator.selectStock('${symbol}')">
          <div>
            <div class="stock-symbol">${symbol}</div>
            <div class="stock-name">${data ? data.name : 'Loading...'}</div>
          </div>
          <div>
            <div class="stock-price">$${price.toFixed(2)}</div>
            <div class="stock-change ${change >= 0 ? 'gain' : 'loss'}">
              ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  updateHoldings() {
    const tbody = document.getElementById('holdingsBody');
    if (!tbody) return;

    const holdings = Object.entries(this.portfolio.holdings);
    
    if (holdings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px; color: #6b7280;">
            No holdings yet. Start trading to build your portfolio! 🚀
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = holdings.map(([symbol, holding]) => {
      const currentPrice = this.marketData.prices[symbol]?.price || holding.avgCost;
      const totalValue = currentPrice * holding.shares;
      const gainLoss = (currentPrice - holding.avgCost) * holding.shares;
      const returnPercent = ((currentPrice - holding.avgCost) / holding.avgCost) * 100;

      return `
        <tr>
          <td><strong>${symbol}</strong></td>
          <td>${holding.shares}</td>
          <td>$${holding.avgCost.toFixed(2)}</td>
          <td>$${currentPrice.toFixed(2)}</td>
          <td><strong>$${totalValue.toFixed(2)}</strong></td>
          <td class="${gainLoss >= 0 ? 'gain' : 'loss'}">
            ${gainLoss >= 0 ? '+' : ''}$${gainLoss.toFixed(2)}
          </td>
          <td class="${returnPercent >= 0 ? 'gain' : 'loss'}">
            ${returnPercent >= 0 ? '+' : ''}${returnPercent.toFixed(2)}%
          </td>
          <td>
            <button class="chip" onclick="simulator.quickSell('${symbol}')" style="font-size: 0.75rem;">
              Sell
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  updateOrderHistory() {
    const container = document.getElementById('orderHistory');
    if (!container) return;

    const recentTx = this.portfolio.transactions.slice(0, 10);
    
    if (recentTx.length === 0) {
      container.innerHTML = '<p style="text-align: center; padding: 20px; color: #6b7280; font-size: 0.9rem;">No transactions yet</p>';
      return;
    }

    container.innerHTML = recentTx.map(tx => {
      const date = new Date(tx.timestamp);
      const typeColor = tx.type === 'BUY' ? '#10b981' : tx.type === 'SELL' ? '#3b82f6' : '#f59e0b';
      
      return `
        <div style="padding: 12px; border-left: 3px solid ${typeColor}; background: #f9fafb; border-radius: 4px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 600;">${tx.type} ${tx.quantity} ${tx.symbol}</span>
            <span style="font-weight: 700;">$${tx.price.toFixed(2)}</span>
          </div>
          <div style="font-size: 0.75rem; color: #6b7280;">
            ${date.toLocaleString()} • Fee: $${tx.fee.toFixed(2)}
          </div>
        </div>
      `;
    }).join('');
  }

  updateQuickStats() {
    const holdings = Object.entries(this.portfolio.holdings);
    if (holdings.length === 0) {
      document.getElementById('bestPerformer').textContent = '--';
      document.getElementById('worstPerformer').textContent = '--';
      document.getElementById('totalTrades').textContent = this.portfolio.transactions.length;
      return;
    }

    let best = { symbol: '', return: -Infinity };
    let worst = { symbol: '', return: Infinity };

    holdings.forEach(([symbol, holding]) => {
      const currentPrice = this.marketData.prices[symbol]?.price || holding.avgCost;
      const returnPercent = ((currentPrice - holding.avgCost) / holding.avgCost) * 100;

      if (returnPercent > best.return) {
        best = { symbol, return: returnPercent };
      }
      if (returnPercent < worst.return) {
        worst = { symbol, return: returnPercent };
      }
    });

    document.getElementById('bestPerformer').textContent = `${best.symbol} +${best.return.toFixed(2)}%`;
    document.getElementById('worstPerformer').textContent = `${worst.symbol} ${worst.return.toFixed(2)}%`;
    document.getElementById('totalTrades').textContent = this.portfolio.transactions.length;
  }

  selectStock(symbol) {
    this.selectedSymbol = symbol;
    document.getElementById('tradeSymbol').value = symbol;
    document.getElementById('selectedSymbol').textContent = symbol;
    document.getElementById('selectedName').textContent = this.marketData.prices[symbol]?.name || '';
    
    // Update order preview
    this.updateOrderPreview();
  }

  quickSell(symbol) {
    const holding = this.portfolio.holdings[symbol];
    if (!holding) return;

    if (confirm(`Sell all ${holding.shares} shares of ${symbol}?`)) {
      this.setTradeType('sell');
      this.selectStock(symbol);
      document.getElementById('tradeQuantity').value = holding.shares;
      
      // Auto-submit after a brief moment
      setTimeout(() => {
        document.getElementById('tradeForm').dispatchEvent(new Event('submit'));
      }, 100);
    }
  }

  updateOrderPreview() {
    const symbol = document.getElementById('tradeSymbol').value.toUpperCase();
    const quantity = parseInt(document.getElementById('tradeQuantity').value) || 0;
    const tradeType = document.querySelector('.trade-tab.active').textContent.toLowerCase();

    if (!symbol || quantity <= 0) {
      document.getElementById('orderPreview').style.display = 'none';
      return;
    }

    const price = this.marketData.prices[symbol]?.price || 0;
    const cost = price * quantity;
    const total = cost + CONFIG.TRANSACTION_FEE;

    document.getElementById('estimatedCost').textContent = `$${cost.toFixed(2)}`;
    document.getElementById('transactionFee').textContent = `$${CONFIG.TRANSACTION_FEE.toFixed(2)}`;
    document.getElementById('totalCost').textContent = `$${total.toFixed(2)}`;
    document.getElementById('orderPreview').style.display = 'block';
  }

  async executeTrade(event) {
    event.preventDefault();
    
    const symbol = document.getElementById('tradeSymbol').value.toUpperCase();
    const quantity = parseInt(document.getElementById('tradeQuantity').value);
    const tradeType = document.querySelector('.trade-tab.active').textContent.toLowerCase();
    const orderType = document.getElementById('orderType').value;
    const limitPrice = parseFloat(document.getElementById('limitPrice').value);

    let result;
    if (tradeType === 'buy') {
      result = await this.tradingEngine.executeBuy(symbol, quantity, orderType, limitPrice);
    } else if (tradeType === 'sell') {
      result = await this.tradingEngine.executeSell(symbol, quantity);
    } else if (tradeType === 'short') {
      result = await this.tradingEngine.executeShort(symbol, quantity);
    }

    if (result.success) {
      alert(`✅ ${tradeType.toUpperCase()} order executed successfully!\n${quantity} shares of ${symbol}`);
      
      if (result.achievements && result.achievements.length > 0) {
        result.achievements.forEach(ach => {
          this.showAchievement(ach);
        });
      }

      document.getElementById('tradeForm').reset();
      await this.refreshData();
    } else {
      alert(`❌ Trade failed: ${result.error}`);
    }
  }

  showAchievement(achievement) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    toast.innerHTML = `
      <div style="font-size: 1.5rem; margin-bottom: 4px;">${achievement.icon}</div>
      <div style="font-weight: 700; font-size: 0.95rem;">${achievement.name}</div>
      <div style="font-size: 0.85rem; opacity: 0.9;">${achievement.desc}</div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  setTradeType(type) {
    document.querySelectorAll('.trade-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.textContent.toLowerCase() === type) {
        tab.classList.add('active');
      }
    });

    const button = document.getElementById('tradeButton');
    button.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Stock`;
    
    this.updateOrderPreview();
  }

  setupEventListeners() {
    document.getElementById('tradeSymbol').addEventListener('input', () => this.updateOrderPreview());
    document.getElementById('tradeQuantity').addEventListener('input', () => this.updateOrderPreview());
    
    document.getElementById('orderType').addEventListener('change', (e) => {
      const limitField = document.getElementById('limitPriceField');
      limitField.style.display = e.target.value === 'limit' ? 'block' : 'none';
    });
  }
}

// Initialize
let simulator;

document.addEventListener('DOMContentLoaded', async () => {
  const portfolio = new Portfolio();
  const marketData = new MarketData();
  const tradingEngine = new TradingEngine(portfolio, marketData);
  simulator = new SimulatorUI(portfolio, marketData, tradingEngine);
  
  await simulator.init();
});

// Global functions
function selectStock(symbol) {
  if (simulator) simulator.selectStock(symbol);
}

function setTradeType(type) {
  if (simulator) simulator.setTradeType(type);
}

function executeTrade(event) {
  if (simulator) simulator.executeTrade(event);
}

function changeTimeframe(period) {
  console.log('Changing timeframe to:', period);
  // Chart implementation would go here
}

function showAddWatchlist() {
  const symbol = prompt('Enter stock symbol to add to watchlist:');
  if (symbol && simulator) {
    simulator.portfolio.watchlist.push(symbol.toUpperCase());
    simulator.portfolio.save();
    simulator.refreshData();
  }
}
