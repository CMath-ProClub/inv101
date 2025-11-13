# External API Integration & Market Simulator Implementation Plan

## Overview
This document outlines the complete implementation strategy for integrating external market data APIs and building an Investopedia-style market simulator with Investing101's unique themes and formatting.

---

## Phase 1: External API Integration Strategy

### 1.1 Real-Time Market Data Pipeline

**Primary Data Sources:**
- **Polygon.io** (Priority 1) - Real-time & historical stock data
- **Yahoo Finance** (Priority 1) - Already integrated, enhance usage
- **Marketstack** (Priority 2) - Backup for EOD data
- **Stockdata.org** (Priority 3) - Sentiment & news integration

**Implementation Plan:**

```javascript
// backend/services/marketDataAggregator.js
class MarketDataAggregator {
  constructor() {
    this.providers = {
      primary: polygon,
      fallback: yahooFinance,
      historical: marketstack
    };
  }

  async getQuote(symbol) {
    // Try primary, fallback to secondary if failed
    try {
      return await this.providers.primary.fetchQuote(symbol);
    } catch (error) {
      console.warn('Primary provider failed, using fallback');
      return await this.providers.fallback.fetchQuote(symbol);
    }
  }

  async getHistoricalData(symbol, range) {
    // Aggregate from multiple sources for reliability
  }

  async getIntradayData(symbol, interval = '5min') {
    // Real-time intraday updates
  }
}
```

### 1.2 Economic Data Integration

**Data Sources:**
- **EconDB** - Macroeconomic indicators (GDP, inflation, unemployment)
- **US Treasury Fiscal Data** - Government financial data
- **Nasdaq Data Link (Quandl)** - Alternative datasets

**Use Cases:**
- Market context cards showing economic indicators
- Correlation analysis between stocks and macro trends
- Educational content linking fundamentals to market moves

### 1.3 News & Sentiment Analysis

**Data Sources:**
- **SEC EDGAR** - Official company filings (10-K, 10-Q, 8-K)
- **Stockdata.org** - Real-time news with sentiment scores
- **Existing News APIs** - Already integrated

**Implementation:**
```javascript
// backend/services/sentimentAnalyzer.js
class SentimentAnalyzer {
  async analyzeSentiment(symbol) {
    const news = await stockdataOrg.fetchNews(symbol);
    const filings = await sec.fetchRecentFilings(symbol);
    
    return {
      newsScore: this.calculateNewsScore(news),
      filingAlerts: this.parseFilingAlerts(filings),
      overallSentiment: 'bullish' | 'bearish' | 'neutral'
    };
  }
}
```

### 1.4 Automation & Notifications

**Data Sources:**
- **Gmail API** - Send personalized email alerts
- **Google Sheets API** - Export portfolio data, watchlists

**Use Cases:**
- Daily market pulse emails (already implemented)
- Price alerts when stocks hit targets
- Portfolio performance summaries
- Export trades to Google Sheets for tax prep

---

## Phase 2: Investopedia-Style Market Simulator

### 2.1 Core Features (Investopedia Parity)

**Portfolio Management:**
- Starting virtual cash: $100,000
- Buy/sell stocks with real-time quotes
- Long positions (shorting in Phase 3)
- Commission-free trades (configurable)
- Multiple portfolios per user

**Order Types:**
- Market orders (immediate execution)
- Limit orders (execute at specific price)
- Stop-loss orders (risk management)
- Stop-limit orders (advanced)

**Position Tracking:**
- Real-time P&L calculations
- Cost basis tracking
- Unrealized vs realized gains
- Dividend tracking
- Performance analytics

### 2.2 Unique Investing101 Enhancements

**Educational Integration:**
- Before first trade: Complete "Trading Basics" lesson
- Pop-up tips during order placement
- Risk calculator shows position size vs portfolio
- AI Coach reviews trades and suggests improvements

**Gamification:**
- Achievement badges (First Trade, $10K Profit, etc.)
- Weekly/monthly challenges
- Community leaderboards
- Streak tracking for consistent practice

**Social Features:**
- Share trades with followers
- Copy trading (watch others' portfolios)
- Discussion threads on stocks
- Mentor system for beginners

### 2.3 Database Schema

```javascript
// backend/models/Portfolio.js
const PortfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: 'My Portfolio' },
  cash: { type: Number, default: 100000 },
  positions: [{
    symbol: String,
    shares: Number,
    costBasis: Number, // Average purchase price
    currentPrice: Number,
    unrealizedPL: Number,
    realizedPL: Number,
    dividends: Number,
    firstPurchased: Date,
    lastUpdated: Date
  }],
  totalValue: Number, // cash + positions value
  totalPL: Number, // unrealized + realized
  totalReturn: Number, // percentage
  createdAt: { type: Date, default: Date.now }
});

// backend/models/Trade.js
const TradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  portfolioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true },
  symbol: { type: String, required: true },
  type: { type: String, enum: ['buy', 'sell'], required: true },
  orderType: { type: String, enum: ['market', 'limit', 'stop', 'stop-limit'], default: 'market' },
  shares: { type: Number, required: true },
  price: { type: Number, required: true },
  commission: { type: Number, default: 0 },
  total: Number, // shares * price + commission
  status: { type: String, enum: ['pending', 'executed', 'cancelled'], default: 'executed' },
  executedAt: { type: Date, default: Date.now },
  notes: String
});

// backend/models/Watchlist.js
const WatchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: 'My Watchlist' },
  symbols: [String],
  createdAt: { type: Date, default: Date.now }
});
```

### 2.4 API Endpoints

```javascript
// Portfolio Management
POST   /api/simulator/portfolio/create
GET    /api/simulator/portfolio/:id
PUT    /api/simulator/portfolio/:id
DELETE /api/simulator/portfolio/:id
GET    /api/simulator/portfolios (list user's portfolios)

// Trading
POST   /api/simulator/trade/buy
POST   /api/simulator/trade/sell
GET    /api/simulator/trades (trade history)
GET    /api/simulator/trades/:id

// Quotes & Market Data
GET    /api/simulator/quote/:symbol
GET    /api/simulator/chart/:symbol?range=1d|1w|1m|3m|1y|5y
GET    /api/simulator/search?q=AAPL (symbol search)

// Watchlist
POST   /api/simulator/watchlist/create
GET    /api/simulator/watchlist/:id
PUT    /api/simulator/watchlist/:id
DELETE /api/simulator/watchlist/:id
POST   /api/simulator/watchlist/:id/add/:symbol
DELETE /api/simulator/watchlist/:id/remove/:symbol

// Leaderboard & Social
GET    /api/simulator/leaderboard?period=week|month|alltime
GET    /api/simulator/feed (activity feed from followed users)
POST   /api/simulator/trade/:id/share (share a trade)
```

### 2.5 Frontend Components

**Main Simulator Page (`prototype/simulator.html`):**
```
┌─────────────────────────────────────────────────────┐
│ Portfolio Overview                                   │
│ Total Value: $105,234.56 (+5.23%)                  │
│ Cash: $15,234.56 | Positions: $90,000.00           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Positions (Holdings)                                 │
│ AAPL  100 shares  $18,500  +12.5%  [Sell]          │
│ TSLA   50 shares  $12,000  -3.2%   [Sell]          │
│ MSFT   75 shares  $28,125  +8.7%   [Sell]          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Trade Stock                                          │
│ Symbol: [AAPL    ]  [Search]                        │
│ Type: (•) Buy  ( ) Sell                             │
│ Shares: [  10   ]                                    │
│ Order: [Market ▼]                                    │
│ Est. Total: $1,850.00                               │
│ [Preview Order] [Execute Trade]                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Recent Trades                                        │
│ BUY  AAPL  10 @ $185.00  -$1,850.00  2 hrs ago    │
│ SELL NVDA  25 @ $487.50  +$12,187.50  1 day ago   │
└─────────────────────────────────────────────────────┘
```

**Stock Detail Page (`prototype/stock-detail.html`):**
```
┌─────────────────────────────────────────────────────┐
│ AAPL - Apple Inc.                    $185.34 +2.4% │
│                                                      │
│ [Chart showing price history]                       │
│                                                      │
│ Key Stats:                                          │
│ • Market Cap: $2.89T                                │
│ • P/E Ratio: 29.5                                   │
│ • Dividend Yield: 0.52%                             │
│ • 52W High/Low: $199.62 / $164.08                   │
│                                                      │
│ [Add to Watchlist] [Trade]                          │
└─────────────────────────────────────────────────────┘
```

### 2.6 Real-Time Updates

**Implementation Strategy:**
- Poll quotes every 5 seconds during market hours
- WebSocket connection for live updates (Phase 3)
- Server-sent events for trade executions
- Local caching to reduce API calls

```javascript
// frontend: prototype/simulator-realtime.js
class RealtimeUpdater {
  constructor() {
    this.symbols = [];
    this.interval = null;
  }

  startPolling(symbols) {
    this.symbols = symbols;
    this.interval = setInterval(() => {
      this.updateQuotes();
    }, 5000); // 5 seconds
  }

  async updateQuotes() {
    const quotes = await fetch(`/api/simulator/quotes/batch`, {
      method: 'POST',
      body: JSON.stringify({ symbols: this.symbols })
    }).then(r => r.json());

    this.updateUI(quotes);
  }

  stopPolling() {
    clearInterval(this.interval);
  }
}
```

---

## Phase 3: Advanced Features (Post-MVP)

### 3.1 Options Trading
- Call and put options
- Options chains
- Greeks calculations
- Strategy builder

### 3.2 Short Selling
- Borrow shares mechanism
- Margin requirements
- Forced liquidation rules

### 3.3 Cryptocurrency Support
- Bitcoin, Ethereum, etc.
- 24/7 trading simulation
- Crypto-specific risk warnings

### 3.4 Backtesting
- Test strategies on historical data
- Performance attribution
- Risk-adjusted returns

### 3.5 Portfolio Analytics
- Sharpe ratio, alpha, beta
- Sector allocation charts
- Risk exposure analysis
- Tax-loss harvesting suggestions

---

## Phase 4: Production Considerations

### 4.1 Rate Limiting & Caching
- Redis cache for quotes (1-minute TTL)
- Rate limit: 100 requests/minute per user
- Batch quote requests
- CDN for static assets

### 4.2 Performance Optimization
- Database indexes on userId, symbol, timestamp
- Pagination for trade history
- Lazy loading for chart data
- Background jobs for portfolio recalculations

### 4.3 Error Handling
- Graceful API failures with fallbacks
- Transaction rollbacks for failed trades
- User-friendly error messages
- Sentry or similar for error tracking

### 4.4 Testing
- Unit tests for trade logic
- Integration tests for API endpoints
- End-to-end tests for trading flow
- Load testing for concurrent users

---

## Implementation Timeline

**Week 1-2: Authentication & Profiles** ✅ (Done)
- Sign up/sign in with email
- Clerk-managed social sign-in (Google, Apple, etc.)
- User profiles with avatars, bios
- Follow/unfollow system

**Week 3-4: Market Data Integration**
- Set up Polygon, Marketstack APIs
- Build data aggregator service
- Implement quote endpoints
- Create symbol search

**Week 5-6: Core Simulator**
- Portfolio model & database
- Buy/sell market orders
- Position tracking
- Trade history

**Week 7-8: Advanced Trading**
- Limit/stop orders
- Watchlists
- Stock detail pages
- Real-time quote updates

**Week 9-10: Social & Gamification**
- Leaderboards
- Activity feed
- Share trades
- Achievement badges

**Week 11-12: Polish & Launch**
- UI/UX refinements
- Performance optimization
- Documentation
- Deployment

---

## Getting Started

### 1. Set Up API Keys

Add these to your `.env` file:

```bash
# Already configured
POLYGON_API_KEY=your_polygon_key
MARKETSTACK_API_KEY=your_marketstack_key
STOCKDATA_API_KEY=your_stockdata_key
NASDAQ_DATA_LINK_KEY=your_quandl_key

# Gmail API (optional)
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=

# Google Sheets (optional)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
```

### 2. Test External APIs

```bash
# Run the API test script
node backend/test-apis.js
```

### 3. Create First Portfolio Route

Start with the simplest endpoint to test the flow:

```bash
# Create: backend/routes/simulator.js
# Test: POST /api/simulator/portfolio/create
```

### 4. Build Frontend Incrementally

- Start with portfolio overview
- Add buy/sell form
- Implement position list
- Add real-time updates
- Polish UI with themes

---

## Questions & Next Steps

**Immediate Actions:**
1. ✅ Fix sign-in/sign-up (DONE)
2. ✅ Implement OAuth (DONE)
3. ✅ Create profile system (DONE)
4. ⏳ Build market data aggregator (NEXT)
5. ⏳ Create simulator database models (NEXT)

**Decisions Needed:**
- Commission fees: $0 or small amount for realism?
- Starting cash: $100k standard or user-configurable?
- Reset portfolios: Allow or permanent?
- Private portfolios: Default or opt-in?

Let me know if you want to proceed with building the simulator routes next, or if you'd like to focus on another area first!
