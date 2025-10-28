const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const articleCache = require('./articleCache');
const yahooFinance = require('yahoo-finance2').default;
const fs = require('fs');
const Portfolio = require('./models/Portfolio');
const User = require('./models/User');
const Stock = require('./models/Stock');
const { authMiddleware, assertJwtSecretValid, JWT_SECRET } = require('./middleware/auth');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const scheduler = require('./scheduler');
const stockCache = require('./stockCache');
const stockMarketData = require('./stockMarketData');

const app = express();
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Prevent process from exiting on validation errors
const originalExit = process.exit;
process.exit = function(code) {
  if (code !== 0) {
    console.error('Process tried to exit with code:', code);
    console.error('Exit prevented to keep server running');
    return;
  }
  originalExit.call(process, code);
};

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  if (error.stack) console.error(error.stack);
  // Don't exit the process, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Environment
const isProduction = process.env.NODE_ENV === 'production';

// Validate JWT secret for production; throw to stop startup if invalid.
try {
  assertJwtSecretValid(isProduction);
} catch (err) {
  console.error('FATAL:', err.message);
  if (typeof originalExit === 'function') originalExit(1);
}

// Enhanced logging with timestamps
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

console.log = function(...args) {
  originalLog(`[${new Date().toISOString()}]`, ...args);
};

console.warn = function(...args) {
  originalWarn(`[${new Date().toISOString()}] ⚠️ `, ...args);
};

console.error = function(...args) {
  originalError(`[${new Date().toISOString()}] ❌`, ...args);
};

// CORS configuration
const corsOptions = {
  origin: isProduction 
    ? function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        // List of allowed origins in production
        const allowedOrigins = [
          process.env.FRONTEND_URL,
          'https://inv101.vercel.app',
          'https://investing101.vercel.app',
          /\.vercel\.app$/,  // Allow any vercel.app subdomain
        ].filter(Boolean);
        
        const isAllowed = allowedOrigins.some(allowed => {
          if (typeof allowed === 'string') return origin === allowed;
          if (allowed instanceof RegExp) return allowed.test(origin);
          return false;
        });
        
        if (isAllowed) {
          callback(null, true);
        } else {
          console.warn(`⚠️  Blocked CORS request from: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      }
    : true, // allow any origin in development but not using '*' so credentials can work
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Rate limiters
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: { error: 'Too many refresh requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: 'Too many requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use('/api/', apiLimiter); // Apply rate limiting to all API routes
const staticDir = path.join(__dirname, '..', 'prototype');
app.use(express.static(staticDir));
const PORT = process.env.PORT || 4000;
// Token lifetimes
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_MAX_AGE_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS || '30', 10);
const cookieSameSite = isProduction ? 'strict' : 'lax';

// Connect to MongoDB

process.on('exit', (code) => {
  console.log('Process exiting with code', code);
});

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

/**
 * GET /health
 * Comprehensive health check for monitoring services
 */
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    caches: {
      stocks: {
        size: stockCache.cache.size,
        lastRefresh: stockCache.lastRefresh,
        needsRefresh: stockCache.needsRefresh()
      },
      articles: {
        size: articleCache.cache.size,
        lastUpdate: articleCache.lastUpdate
      }
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  };
  
  res.json(health);
});

/**
 * GET /api/health
 * API-specific health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      stocks: [
        'GET /api/stocks/cached/:ticker',
        'GET /api/stocks/compare/:ticker',
        'GET /api/stocks/top-performers',
        'GET /api/stocks/worst-performers',
        'GET /api/stocks/search',
        'GET /api/stocks/sector/:sector',
        'GET /api/stocks/cache-stats',
        'POST /api/stocks/refresh-cache'
      ],
      articles: [
        'GET /api/articles/market',
        'GET /api/articles/ticker/:ticker',
        'GET /api/articles/stats',
        'POST /api/articles/refresh'
      ],
      simulator: [
        'POST /api/simulate'
      ],
      health: [
        'GET /health',
        'GET /api/health'
      ]
    }
  });
});

/**
 * POST /api/simulate
 * Body: { opponent, durationDays, difficultyPct }
 * Note: Simulation feature temporarily disabled
 */
app.post('/api/simulate', async (req, res) => {
  res.status(503).json({ 
    success: false, 
    error: 'Simulation feature is currently disabled. Focus on real market data analysis!' 
  });
});

// Helper: Fetch top large-cap stocks via Yahoo Finance screener
async function fetchTopMarketCap() {
  try {
    const result = await yahooFinance.screener({
      scrIds: 'market_cap_large_cap',
      count: 100,
      offset: 0
    });
    const quotes = result?.finance?.result?.[0]?.quotes || [];
    return quotes.map((quote) => ({
      ticker: quote.symbol,
      name: quote.shortName || quote.longName || quote.symbol
    }));
  } catch (err) {
    console.warn('⚠️ Yahoo Finance screener failed, falling back to curated list:', err.message);
    return [];
  }
}

// Helper: Add 50 recognizable companies
function getRecognizableCompanies() {
  return [
    'AAPL','MSFT','GOOGL','AMZN','META','TSLA','NVDA','JPM','V','UNH','HD','MA','PG','DIS','BAC','KO','PEP','MRK','ABBV','T','NFLX','ADBE','CRM','AVGO','COST','WMT','MCD','INTC','CSCO','CMCSA','TXN','HON','QCOM','ACN','LIN','DHR','NEE','MDT','BMY','SBUX','AMGN','LOW','CVX','TMO','ISRG','GILD','VRTX','REGN','BKNG','LRCX','DE'
  ].map(ticker => ({ ticker, name: ticker }));
}

// ============================================
// STOCK DATA CACHE ENDPOINTS
// ============================================

/**
 * GET /api/stocks/cached/:ticker
 * Get cached stock data
 */
app.get('/api/stocks/cached/:ticker', (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const stock = stockCache.getStock(ticker);
  
  if (!stock) {
    return res.status(404).json({ 
      success: false,
      error: 'Stock not found in cache. Try /api/stocks/:ticker for live data.' 
    });
  }
  
  res.json({
    success: true,
    stock,
    cached: true,
    cacheAge: Date.now() - stock.lastUpdated.getTime()
  });
});

/**
 * GET /api/stocks/compare/:ticker
 * Compare stock to S&P 500
 */
app.get('/api/stocks/compare/:ticker', (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const comparison = stockCache.compareToSP500(ticker);
  
  if (!comparison) {
    return res.status(404).json({ 
      success: false,
      error: 'Stock not found or S&P 500 data unavailable' 
    });
  }
  
  res.json({
    success: true,
    comparison,
    cached: true
  });
});

/**
 * GET /api/stocks/top-performers
 * Get top performing stocks
 */
app.get('/api/stocks/top-performers', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const performers = stockCache.getTopPerformers(limit);
  
  res.json({
    success: true,
    count: performers.length,
    performers,
    sp500: stockCache.sp500Data
  });
});

/**
 * GET /api/stocks/worst-performers
 * Get worst performing stocks
 */
app.get('/api/stocks/worst-performers', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const performers = stockCache.getWorstPerformers(limit);
  
  res.json({
    success: true,
    count: performers.length,
    performers,
    sp500: stockCache.sp500Data
  });
});

/**
 * GET /api/stocks/search
 * Search stocks by name or ticker
 */
app.get('/api/stocks/search', (req, res) => {
  const query = req.query.q || req.query.query || '';
  const limit = parseInt(req.query.limit) || 20;
  
  if (!query || query.length < 1) {
    return res.status(400).json({ 
      success: false,
      error: 'Query parameter required' 
    });
  }
  
  const results = stockCache.searchStocks(query, limit);
  
  res.json({
    success: true,
    query,
    count: results.length,
    results
  });
});

/**
 * GET /api/stocks/sector/:sector
 * Get stocks by sector
 */
app.get('/api/stocks/sector/:sector', (req, res) => {
  const sector = req.params.sector;
  const stocks = stockCache.getStocksBySector(sector);
  
  res.json({
    success: true,
    sector,
    count: stocks.length,
    stocks
  });
});

/**
 * GET /api/stocks/cache-stats
 * Get cache statistics
 */
app.get('/api/stocks/cache-stats', (req, res) => {
  const stats = stockCache.getStats();
  
  res.json({
    success: true,
    stats,
    needsRefresh: stockCache.needsRefresh()
  });
});

/**
 * POST /api/stocks/refresh-cache
 * Manually refresh stock cache (rate limited)
 */
app.post('/api/stocks/refresh-cache', refreshLimiter, async (req, res) => {
  try {
    const result = await stockCache.refreshAll();
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/stocks/top100
app.get('/api/stocks/top100', async (req, res) => {
  const top50 = await fetchTopMarketCap();
  const extra50 = getRecognizableCompanies();
  // Merge and deduplicate
  const all = [...top50, ...extra50].reduce((acc, stock) => {
    if (!acc.find(s => s.ticker === stock.ticker)) acc.push(stock);
    return acc;
  }, []);
  res.json(all);
});

// GET /api/stocks/:ticker
app.get('/api/stocks/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  
  // Try cache first
  const cached = stockCache.getStock(ticker);
  if (cached) {
    return res.json({
      ticker,
      name: cached.name,
      price: cached.price,
      currency: cached.currency,
      marketCap: cached.marketCap,
      exchange: cached.exchange,
      previousClose: cached.previousClose,
      change: cached.change,
      changePercent: cached.changePercent,
      cached: true,
      lastUpdated: cached.lastUpdated
    });
  }
  
  // Fallback to live data
  try {
    const quote = await yahooFinance.quote(ticker);
    if (!quote || typeof quote.regularMarketPrice === 'undefined') {
      return res.status(404).json({ error: 'Ticker not found on Yahoo Finance.' });
    }
    res.json({
      ticker,
      name: quote.longName || quote.shortName || ticker,
      price: quote.regularMarketPrice,
      currency: quote.currency,
      marketCap: quote.marketCap,
      exchange: quote.fullExchangeName,
      previousClose: quote.regularMarketPreviousClose,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      cached: false
    });
  } catch (err) {
    res.status(404).json({ error: 'Ticker not found on Yahoo Finance.' });
  }
});

// ============================================
// ARTICLE CACHE ENDPOINTS
// ============================================
// ARTICLE CACHE ENDPOINTS
// ============================================

/**
 * GET /api/articles/market
 * Get general market articles with caching
 */
app.get('/api/articles/market', async (req, res) => {
  try {
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      daysOld: parseInt(req.query.daysOld) || null,
      minRelevance: parseFloat(req.query.minRelevance) || 0.6
    };

    const articles = await articleCache.getArticlesWithRefresh(filters);
    const stats = articleCache.getCacheStats();

    res.json({
      success: true,
      groups: articles,
      stats,
      cached: true
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/articles/stock/:ticker
 * Get articles for specific stock ticker with caching
 */
app.get('/api/articles/stock/:ticker', async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const filters = {
      ticker,
      limit: parseInt(req.query.limit) || 50,
      daysOld: parseInt(req.query.daysOld) || null,
      minRelevance: parseFloat(req.query.minRelevance) || 0.7
    };

    const articles = await articleCache.getArticlesWithRefresh(filters);
    const stats = articleCache.getCacheStats();

    res.json({
      success: true,
      ticker,
      groups: articles,
      stats,
      cached: true
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/articles/politician/:name
 * Get articles for specific politician's portfolio with caching
 */
app.get('/api/articles/politician/:name', async (req, res) => {
  try {
    const politician = decodeURIComponent(req.params.name);
    const filters = {
      politician,
      limit: parseInt(req.query.limit) || 50,
      daysOld: parseInt(req.query.daysOld) || 30,
      minRelevance: parseFloat(req.query.minRelevance) || 0.7
    };

    const articles = await articleCache.getArticlesWithRefresh(filters);
    const stats = articleCache.getCacheStats();

    res.json({
      success: true,
      politician,
      groups: articles,
      stats,
      cached: true
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/articles/refresh
 * Manually trigger cache refresh (rate limited)
 */
app.post('/api/articles/refresh', refreshLimiter, async (req, res) => {
  try {
    const { ticker, politician } = req.body;
    const stats = await articleCache.refreshCache(ticker, politician);

    res.json({
      success: true,
      message: 'Cache refreshed successfully',
      stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/articles/stats
 * Get current cache statistics
 */
app.get('/api/articles/stats', async (req, res) => {
  try {
    const stats = await articleCache.getCacheStats();
    const refreshStats = await articleCache.getRefreshStats();
    
    res.json({
      success: true,
      stats,
      refreshStats,
      lastRefresh: articleCache.lastRefresh,
      needsRefresh: await articleCache.needsRefresh()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/articles/refresh-history
 * Get refresh history logs
 */
app.get('/api/articles/refresh-history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await articleCache.getRefreshHistory(limit);
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Stock Market Simulator Endpoints
 */

// Get all stock market data
app.get('/api/stocks/all', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const stockData = await stockMarketData.getStockData(forceRefresh);
    
    res.json({
      success: true,
      count: Object.keys(stockData).length,
      stocks: Object.values(stockData),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching all stocks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search stocks
app.get('/api/stocks/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const stockData = await stockMarketData.getStockData();
    const results = stockMarketData.searchStocks(query, stockData);
    
    res.json({
      success: true,
      query,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get top movers (gainers/losers)
app.get('/api/stocks/movers', async (req, res) => {
  try {
    const type = req.query.type || 'gainers'; // 'gainers' or 'losers'
    const limit = parseInt(req.query.limit) || 20;
    const stockData = await stockMarketData.getStockData();
    const movers = stockMarketData.getTopMovers(stockData, type, limit);
    
    res.json({
      success: true,
      type,
      count: movers.length,
      movers
    });
  } catch (error) {
    console.error('Error fetching top movers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get stocks by sector
app.get('/api/stocks/sector/:sector', async (req, res) => {
  try {
    const sector = req.params.sector;
    const stockData = await stockMarketData.getStockData();
    const stocks = stockMarketData.getStocksBySector(stockData, sector);
    
    res.json({
      success: true,
      sector,
      count: stocks.length,
      stocks
    });
  } catch (error) {
    console.error('Error fetching stocks by sector:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific stock quote
app.get('/api/stocks/quote/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const quotes = await stockMarketData.fetchStockQuotes([symbol]);
    
    if (quotes[symbol]) {
      res.json({
        success: true,
        stock: quotes[symbol]
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/portfolio
 * Serves a demo portfolio JSON from the repo and optionally enriches it with live quotes
 * Query: ?live=true to fetch current prices for each holding
 */
app.get('/api/portfolio', async (req, res) => {
  try {
    // Prefer DB-backed portfolio if available
    let portfolioDoc = null;
    try {
      portfolioDoc = await Portfolio.findOne().lean();
    } catch (e) {
      console.warn('DB lookup for portfolio failed (continuing to file fallback):', e.message);
    }

    // If DB document exists, use it
    if (portfolioDoc) {
      const portfolio = { account: portfolioDoc.account || {}, holdings: portfolioDoc.holdings || [] };
      // If live enrichment requested, fetch current prices for holdings
      if (req.query.live === 'true' && portfolio.holdings.length > 0) {
        const symbols = portfolio.holdings.map(h => h.symbol.toUpperCase());
        try {
          const quotes = await stockMarketData.fetchStockQuotes(symbols);
          portfolio.holdings = portfolio.holdings.map(h => {
            const q = quotes[h.symbol] || quotes[h.symbol.toUpperCase()] || {};
            return {
              ...h,
              currentPrice: q.price || q.regularMarketPrice || null,
              change: q.change || q.regularMarketChange || 0,
              changePercent: q.changePercent || q.regularMarketChangePercent || 0
            };
          });
          // Recalculate accountValue
          let totalValue = 0;
          portfolio.holdings.forEach(h => {
            const p = Number(h.currentPrice || h.purchasePrice || 0);
            totalValue += p * Number(h.qty || 0);
          });
          portfolio.account.accountValue = Number(totalValue.toFixed(2));
        } catch (e) {
          console.warn('Failed to enrich DB portfolio with live quotes:', e.message);
        }
      }
      return res.json({ success: true, portfolio });
    }

    // Fallback to file-based demo portfolio
    const filePath = path.join(__dirname, '..', 'data', 'portfolio.json');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Portfolio file not found' });
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const portfolio = JSON.parse(raw);

    if (req.query.live === 'true') {
      const symbols = portfolio.holdings.map(h => h.symbol.toUpperCase());
      try {
        const quotes = await stockMarketData.fetchStockQuotes(symbols);
        portfolio.holdings = portfolio.holdings.map(h => {
          const q = quotes[h.symbol] || quotes[h.symbol.toUpperCase()] || {};
          return {
            ...h,
            currentPrice: q.price || q.regularMarketPrice || null,
            change: q.change || q.regularMarketChange || 0,
            changePercent: q.changePercent || q.regularMarketChangePercent || 0
          };
        });

        let totalValue = 0;
        portfolio.holdings.forEach(h => {
          const p = Number(h.currentPrice || h.purchasePrice || 0);
          totalValue += p * Number(h.qty || 0);
        });
        portfolio.account.accountValue = Number(totalValue.toFixed(2));
      } catch (e) {
        console.warn('Failed to enrich portfolio with live quotes:', e.message);
      }
    }

    res.json({ success: true, portfolio });
  } catch (error) {
    console.error('Error reading portfolio:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AUTH routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'email and password required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, error: 'User already exists' });
  const user = await User.createWithPassword(email, password);
  // create empty portfolio for user
  const p = new Portfolio({ userId: user._id.toString(), account: {}, holdings: [] });
  await p.save();
    // Issue access + refresh tokens (access short-lived, refresh long-lived)
    const accessToken = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshTokenPlain = crypto.randomBytes(48).toString('hex');
    // persist refresh token hash and get its id
    let tokenId = null;
    try { tokenId = await user.addRefreshToken(refreshTokenPlain); } catch (err) { console.warn('Failed to persist refresh token:', err.message); }
    // Set HttpOnly cookies so client JS cannot read tokens directly
  res.cookie('inv101_token', accessToken, { httpOnly: true, secure: isProduction, sameSite: cookieSameSite, maxAge: 15 * 60 * 1000 });
  // Cookie contains id.plain so server can lookup by id and compare hash
  if (tokenId) {
    res.cookie('inv101_refresh', `${tokenId}.${refreshTokenPlain}`, { httpOnly: true, secure: isProduction, sameSite: cookieSameSite, maxAge: REFRESH_TOKEN_MAX_AGE_DAYS * 24 * 60 * 60 * 1000 });
  }
    res.json({ success: true });
  } catch (e) {
    console.error('Signup error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const valid = await user.verifyPassword(password);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    // Issue access + refresh tokens
    const accessToken = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshTokenPlain = crypto.randomBytes(48).toString('hex');
    let tokenId = null;
    try { tokenId = await user.addRefreshToken(refreshTokenPlain); } catch (err) { console.warn('Failed to persist refresh token:', err.message); }
  res.cookie('inv101_token', accessToken, { httpOnly: true, secure: isProduction, sameSite: cookieSameSite, maxAge: 15 * 60 * 1000 });
  if (tokenId) {
    res.cookie('inv101_refresh', `${tokenId}.${refreshTokenPlain}`, { httpOnly: true, secure: isProduction, sameSite: cookieSameSite, maxAge: REFRESH_TOKEN_MAX_AGE_DAYS * 24 * 60 * 60 * 1000 });
  }
    res.json({ success: true });
  } catch (e) {
    console.error('Login error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/auth/me - return basic user info when authenticated
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies && req.cookies.inv101_refresh;
    if (refreshToken) {
      try {
        const found = await User.findByRefreshTokenCookie(refreshToken);
        if (found && found.user && found.tokenId) {
          await found.user.removeRefreshTokenById(found.tokenId);
        }
      } catch (err) { console.warn('Logout: failed to remove refresh token', err.message); }
    }
    // Clear cookies
    res.clearCookie('inv101_token');
    res.clearCookie('inv101_refresh');
    res.json({ success: true });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/refresh - rotates refresh token and returns a new access token
app.post('/api/auth/refresh', refreshLimiter, async (req, res) => {
  try {
  const incoming = req.cookies && req.cookies.inv101_refresh;
  if (!incoming) return res.status(401).json({ success: false, error: 'Refresh token missing' });
  const found = await User.findByRefreshTokenCookie(incoming);
  if (!found || !found.user) return res.status(401).json({ success: false, error: 'Invalid refresh token' });
  const user = found.user;
  const tokenId = found.tokenId;
  // Rotate token: remove old, issue new (stored hashed by model helper)
  await user.removeRefreshTokenById(tokenId);
  const newRefreshPlain = crypto.randomBytes(48).toString('hex');
  const newId = await user.addRefreshToken(newRefreshPlain);
    const accessToken = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  res.cookie('inv101_token', accessToken, { httpOnly: true, secure: isProduction, sameSite: cookieSameSite, maxAge: 15 * 60 * 1000 });
  if (newId) {
    res.cookie('inv101_refresh', `${newId}.${newRefreshPlain}`, { httpOnly: true, secure: isProduction, sameSite: cookieSameSite, maxAge: REFRESH_TOKEN_MAX_AGE_DAYS * 24 * 60 * 60 * 1000 });
  }
    res.json({ success: true });
  } catch (err) {
    console.error('Refresh error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Portfolio buy/sell endpoints
app.post('/api/portfolio/buy', authMiddleware, async (req, res) => {
  try {
    const { symbol, qty, price } = req.body;
    if (!symbol || !qty || qty <= 0) return res.status(400).json({ success: false, error: 'symbol and positive qty required' });

    // find or create portfolio for the authenticated user
    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    if (!portfolio) {
      portfolio = new Portfolio({ userId: req.user.id, account: {}, holdings: [] });
    }
    if (!portfolio) {
      portfolio = new Portfolio({ account: {}, holdings: [] });
    }

    const s = symbol.toUpperCase();
    const existing = portfolio.holdings.find(h => h.symbol === s);
    if (existing) {
      // Weighted average purchase price
      const oldQty = Number(existing.qty || 0);
      const newQty = oldQty + Number(qty);
      const oldVal = oldQty * Number(existing.purchasePrice || 0);
      const addVal = Number(qty) * Number(price || existing.purchasePrice || 0);
      existing.purchasePrice = newQty > 0 ? Number((oldVal + addVal) / newQty) : existing.purchasePrice;
      existing.qty = newQty;
    } else {
      portfolio.holdings.push({ symbol: s, purchasePrice: Number(price || 0), qty: Number(qty) });
    }

    // Recalculate accountValue (best-effort: use provided price or fetch live)
    try {
      const symbols = portfolio.holdings.map(h => h.symbol);
      const quotes = await stockMarketData.fetchStockQuotes(symbols);
      const currentPrices = Object.fromEntries(Object.entries(quotes).map(([k,v]) => [k, v.price || v.regularMarketPrice || 0]));
      portfolio.recalculateAccountValue(currentPrices);
    } catch (e) {
      portfolio.recalculateAccountValue();
    }

  await portfolio.save();
    res.json({ success: true, portfolio });
  } catch (error) {
    console.error('Error buying asset:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/portfolio/sell', authMiddleware, async (req, res) => {
  try {
    const { symbol, qty, price } = req.body;
    if (!symbol || !qty || qty <= 0) return res.status(400).json({ success: false, error: 'symbol and positive qty required' });

  let portfolio = await Portfolio.findOne({ userId: req.user.id });
    if (!portfolio) return res.status(404).json({ success: false, error: 'Portfolio not found' });

    const s = symbol.toUpperCase();
    const existing = portfolio.holdings.find(h => h.symbol === s);
    if (!existing) return res.status(404).json({ success: false, error: 'Holding not found' });

    const sellQty = Math.min(Number(qty), Number(existing.qty || 0));
    existing.qty = Number(existing.qty) - sellQty;
    if (existing.qty <= 0) {
      portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== s);
    }

    // Credit cash by proceeds (best-effort)
    const proceeds = sellQty * Number(price || existing.purchasePrice || 0);
    portfolio.account.cash = Number((portfolio.account.cash || 0) + proceeds);

    try {
      const symbols = portfolio.holdings.map(h => h.symbol);
      const quotes = await stockMarketData.fetchStockQuotes(symbols);
      const currentPrices = Object.fromEntries(Object.entries(quotes).map(([k,v]) => [k, v.price || v.regularMarketPrice || 0]));
      portfolio.recalculateAccountValue(currentPrices);
    } catch (e) {
      portfolio.recalculateAccountValue();
    }

    await portfolio.save();
    res.json({ success: true, portfolio });
  } catch (error) {
    console.error('Error selling asset:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Short a position: create/increase a short and credit cash by proceeds
app.post('/api/portfolio/short', authMiddleware, async (req, res) => {
  try {
    const { symbol, qty, price } = req.body;
    if (!symbol || !qty || qty <= 0) return res.status(400).json({ success: false, error: 'symbol and positive qty required' });

    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    if (!portfolio) return res.status(404).json({ success: false, error: 'Portfolio not found' });

    const s = symbol.toUpperCase();
    const existing = portfolio.shorts.find(h => h.symbol === s);
    if (existing) {
      existing.qty = Number(existing.qty || 0) + Number(qty);
      // keep purchasePrice as average of short entry prices
      const oldQty = Number(existing.qty || 0);
      const addVal = Number(qty) * Number(price || existing.purchasePrice || 0);
      const oldVal = (oldQty - Number(qty)) * Number(existing.purchasePrice || 0);
      const newQty = oldQty;
      existing.purchasePrice = newQty > 0 ? Number((oldVal + addVal) / newQty) : existing.purchasePrice;
    } else {
      portfolio.shorts.push({ symbol: s, purchasePrice: Number(price || 0), qty: Number(qty) });
    }

    // Credit cash by proceeds of short sale
    const proceeds = Number(qty) * Number(price || 0);
    portfolio.account.cash = Number((portfolio.account.cash || 0) + proceeds);

    try {
      const symbols = [...portfolio.holdings.map(h => h.symbol), ...portfolio.shorts.map(h => h.symbol)];
      const quotes = await stockMarketData.fetchStockQuotes(symbols);
      const currentPrices = Object.fromEntries(Object.entries(quotes).map(([k,v]) => [k, v.price || v.regularMarketPrice || 0]));
      portfolio.recalculateAccountValue(currentPrices);
    } catch (e) {
      portfolio.recalculateAccountValue();
    }

    await portfolio.save();
    res.json({ success: true, portfolio });
  } catch (error) {
    console.error('Error shorting asset:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/demo/spy
 * Serves a small SPY demo time series from data/demo_spy.json
 */
app.get('/api/demo/spy', (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'data', 'demo_spy.json');
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, error: 'Demo SPY not found' });
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);
    res.json({ success: true, data: json });
  } catch (e) {
    console.error('Error reading demo spy:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    await connectDB();
    console.log('✅ Database connected successfully');

    // Seed portfolio from demo file if DB is empty
    try {
      const count = await Portfolio.countDocuments();
      if (count === 0) {
        const demoPath = path.join(__dirname, '..', 'data', 'portfolio.json');
        if (fs.existsSync(demoPath)) {
          const raw = fs.readFileSync(demoPath, 'utf8');
          const demo = JSON.parse(raw);
          const p = new Portfolio(demo);
          await p.save();
          console.log('🪴 Seeded portfolio collection from demo file');
        }
      } else {
        console.log(`📦 Portfolio collection already has ${count} document(s)`);
      }
    } catch (seedErr) {
      console.warn('⚠️ Portfolio seeding skipped:', seedErr.message);
    }
    // Seed stock symbols into Stocks collection for simulator search/autocomplete
    try {
      const stockCount = await Stock.countDocuments();
      if (stockCount === 0) {
        console.log('🪴 Seeding Stocks collection from symbol list...');
        const symbols = stockMarketData.STOCK_SYMBOLS || [];
        const docs = symbols.map(s => ({ symbol: s.toUpperCase(), name: s }));
        if (docs.length) await Stock.insertMany(docs);
        console.log(`🪴 Seeded ${docs.length} stocks`);
      } else {
        console.log(`📦 Stocks collection already has ${stockCount} document(s)`);
      }
    } catch (seedErr) {
      console.warn('⚠️ Stocks seeding skipped:', seedErr.message);
    }
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Yahoo Finance backend running on port ${PORT}`);
      console.log(`📁 Static files served from: ${staticDir}`);
      console.log(`💾 Article cache system initialized`);
      
      // Start scheduled tasks
      scheduler.startScheduledRefresh('0 */6 * * *');    // Every 6 hours
      scheduler.startMidnightScraper('0 0 * * *');       // Daily at midnight
      scheduler.startStockCacheRefresh('0 3,9,15,21 * * *'); // Every 6 hours (offset)
      scheduler.startDailyCleanup('0 2 * * *');         // Daily at 2 AM
      
      // Start self-ping to keep Render instance awake (only in production)
      const appUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;
      if (appUrl) {
        scheduler.startSelfPing(appUrl);
      }
      
      // Initialize stock cache in background with smaller batches
      console.log('📊 Initializing stock cache in background...');
      stockCache.refreshAll().then(result => {
        console.log(`✅ Stock cache initialized: ${result.successCount}/${result.successCount + result.errorCount} stocks cached`);
      }).catch(err => {
        console.warn('⚠️  Stock cache initialization failed:', err.message);
      });
      
      console.log('\n✅ Server ready for requests\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Only start server when this file is run directly. Export app/startServer for tests.
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
