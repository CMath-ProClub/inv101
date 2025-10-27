const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const articleCache = require('./articleCache');
const yahooFinance = require('yahoo-finance2').default;
const scheduler = require('./scheduler');
const stockCache = require('./stockCache');
const stockMarketData = require('./stockMarketData');

const app = express();
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
    : '*', // Allow all origins in development
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
app.use(express.json());
app.use('/api/', apiLimiter); // Apply rate limiting to all API routes
const staticDir = path.join(__dirname, '..', 'prototype');
app.use(express.static(staticDir));
const PORT = process.env.PORT || 4000;

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

// Connect to MongoDB and start server
async function startServer() {
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Yahoo Finance backend running on port ${PORT}`);
      console.log(`📁 Static files served from: ${staticDir}`);
      console.log(`💾 Article cache system initialized`);
      
      // Start scheduled tasks
      scheduler.startScheduledRefresh('0 */6 * * *');    // Every 6 hours
      scheduler.startStockCacheRefresh('0 3,9,15,21 * * *'); // Every 6 hours (offset)
      scheduler.startDailyCleanup('0 2 * * *');         // Daily at 2 AM
      
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

startServer();
