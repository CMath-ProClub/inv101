const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const connectDB = require('./config/database');
const articleCache = require('./articleCache');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Helper: Scrape Google Finance for top 50 by market cap
async function scrapeTopMarketCap() {
  const url = 'https://www.google.com/finance/markets/us';
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const stocks = [];
    // Google Finance page structure may change; this selector is for demonstration
    $('div[data-entity-type="company"]').slice(0, 50).each((i, el) => {
      const ticker = $(el).find('div[data-entity-id]').attr('data-entity-id');
      const name = $(el).find('div[data-entity-name]').text();
      stocks.push({ ticker, name });
    });
    return stocks;
  } catch (err) {
    return [];
  }
}

// Helper: Add 50 recognizable companies
function getRecognizableCompanies() {
  return [
    'AAPL','MSFT','GOOGL','AMZN','META','TSLA','NVDA','JPM','V','UNH','HD','MA','PG','DIS','BAC','KO','PEP','MRK','ABBV','T','NFLX','ADBE','CRM','AVGO','COST','WMT','MCD','INTC','CSCO','CMCSA','TXN','HON','QCOM','ACN','LIN','DHR','NEE','MDT','BMY','SBUX','AMGN','LOW','CVX','TMO','ISRG','GILD','VRTX','REGN','BKNG','LRCX','DE'
  ].map(ticker => ({ ticker, name: ticker }));
}

// GET /api/stocks/top100
app.get('/api/stocks/top100', async (req, res) => {
  const top50 = await scrapeTopMarketCap();
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
  // Scrape Google Finance for this ticker
  const url = `https://www.google.com/finance/quote/${ticker}:NASDAQ`;
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // Example selectors (may need adjustment)
    const name = $('div[data-entity-name]').first().text();
    const price = $('div[data-last-price]').first().text();
    const marketCap = $('div[data-market-cap]').first().text();
    res.json({ ticker, name, price, marketCap });
  } catch (err) {
    res.status(404).json({ error: 'Ticker not found or Google Finance structure changed.' });
  }
});

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
      articles,
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
      articles,
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
      articles,
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
 * Manually trigger cache refresh
 */
app.post('/api/articles/refresh', async (req, res) => {
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

app.listen(PORT, async () => {
  console.log(`🚀 Google Finance backend running on port ${PORT}`);
  console.log(`📊 Article cache system initialized`);
  
  // Wait a bit for DB connection to stabilize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Initial cache warm-up
  console.log('🔥 Warming up article cache...');
  try {
    await articleCache.refreshCache('manual');
    console.log('✅ Cache warm-up complete');
  } catch (error) {
    console.error('❌ Cache warm-up failed:', error.message);
  }
});
