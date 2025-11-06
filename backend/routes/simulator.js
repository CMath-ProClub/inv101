const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const Trade = require('../models/Trade');
const User = require('../models/User');
const marketData = require('../services/marketDataAggregator');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/simulator/portfolio
 * Get user's portfolio with current prices
 */
router.get('/portfolio', async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user._id, isActive: true });
    
    // Create portfolio if it doesn't exist
    if (!portfolio) {
      portfolio = await Portfolio.createForUser(req.user._id);
    }
    
    // Update position prices if we have any
    if (portfolio.positions.length > 0) {
      const symbols = portfolio.positions.map(p => p.symbol);
      const quotes = await marketData.getQuotes(symbols);
      
      const priceMap = {};
      quotes.forEach(quote => {
        if (quote.price) {
          priceMap[quote.symbol] = quote.price;
        }
      });
      
      portfolio.updatePositionPrices(priceMap);
      portfolio.calculateTotalValue();
      await portfolio.save();
    }
    
    res.json({
      success: true,
      portfolio: {
        id: portfolio._id,
        cash: portfolio.cash,
        positions: portfolio.positions,
        totalValue: portfolio.totalValue,
        totalPL: portfolio.totalPL,
        totalPLPercent: portfolio.totalPLPercent,
        totalTrades: portfolio.totalTrades,
        winningTrades: portfolio.winningTrades,
        losingTrades: portfolio.losingTrades,
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt
      }
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch portfolio', error: error.message });
  }
});

/**
 * POST /api/simulator/quote
 * Get real-time quote for a symbol
 */
router.post('/quote', async (req, res) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ success: false, message: 'Symbol is required' });
    }
    
    const quote = await marketData.getQuote(symbol.toUpperCase());
    
    res.json({
      success: true,
      quote
    });
  } catch (error) {
    console.error('Get quote error:', error);
    res.status(404).json({ success: false, message: `Could not fetch quote for ${req.body.symbol}`, error: error.message });
  }
});

/**
 * POST /api/simulator/quotes
 * Get quotes for multiple symbols
 */
router.post('/quotes', async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ success: false, message: 'Symbols array is required' });
    }
    
    const quotes = await marketData.getQuotes(symbols);
    
    res.json({
      success: true,
      quotes
    });
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quotes', error: error.message });
  }
});

/**
 * POST /api/simulator/trade/buy
 * Execute a buy order
 */
router.post('/trade/buy', async (req, res) => {
  try {
    const { symbol, shares } = req.body;
    
    // Validation
    if (!symbol || !shares) {
      return res.status(400).json({ success: false, message: 'Symbol and shares are required' });
    }
    
    if (shares < 1 || !Number.isInteger(shares)) {
      return res.status(400).json({ success: false, message: 'Shares must be a positive integer' });
    }
    
    // Get portfolio
    let portfolio = await Portfolio.findOne({ userId: req.user._id, isActive: true });
    if (!portfolio) {
      portfolio = await Portfolio.createForUser(req.user._id);
    }
    
    // Get current price
    const quote = await marketData.getQuote(symbol.toUpperCase());
    if (!quote || !quote.price) {
      return res.status(404).json({ success: false, message: `Could not fetch price for ${symbol}` });
    }
    
    const totalCost = quote.price * shares;
    
    // Check if user has enough cash
    if (portfolio.cash < totalCost) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient funds. Required: $${totalCost.toFixed(2)}, Available: $${portfolio.cash.toFixed(2)}` 
      });
    }
    
    // Execute trade
    portfolio.cash -= totalCost;
    portfolio.updatePosition(quote.symbol, shares, quote.price, quote.name || quote.symbol);
    portfolio.totalTrades += 1;
    portfolio.calculateTotalValue();
    await portfolio.save();
    
    // Record trade
    await Trade.recordBuy(
      req.user._id,
      portfolio._id,
      quote.symbol,
      quote.name || quote.symbol,
      shares,
      quote.price
    );
    
    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      totalTrades: portfolio.totalTrades,
      portfolioValue: portfolio.totalValue,
      performancePercent: portfolio.totalPLPercent
    });
    
    res.json({
      success: true,
      message: `Bought ${shares} shares of ${quote.symbol} at $${quote.price.toFixed(2)}`,
      trade: {
        type: 'BUY',
        symbol: quote.symbol,
        shares,
        price: quote.price,
        totalCost
      },
      portfolio: {
        cash: portfolio.cash,
        totalValue: portfolio.totalValue,
        totalPL: portfolio.totalPL,
        totalPLPercent: portfolio.totalPLPercent
      }
    });
  } catch (error) {
    console.error('Buy trade error:', error);
    res.status(500).json({ success: false, message: 'Failed to execute buy order', error: error.message });
  }
});

/**
 * POST /api/simulator/trade/sell
 * Execute a sell order
 */
router.post('/trade/sell', async (req, res) => {
  try {
    const { symbol, shares } = req.body;
    
    // Validation
    if (!symbol || !shares) {
      return res.status(400).json({ success: false, message: 'Symbol and shares are required' });
    }
    
    if (shares < 1 || !Number.isInteger(shares)) {
      return res.status(400).json({ success: false, message: 'Shares must be a positive integer' });
    }
    
    // Get portfolio
    const portfolio = await Portfolio.findOne({ userId: req.user._id, isActive: true });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }
    
    // Check if position exists
    const position = portfolio.positions.find(p => p.symbol === symbol.toUpperCase());
    if (!position) {
      return res.status(400).json({ success: false, message: `You don't own any shares of ${symbol}` });
    }
    
    if (position.shares < shares) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient shares. You own ${position.shares} shares of ${symbol}` 
      });
    }
    
    // Get current price
    const quote = await marketData.getQuote(symbol.toUpperCase());
    if (!quote || !quote.price) {
      return res.status(404).json({ success: false, message: `Could not fetch price for ${symbol}` });
    }
    
    const totalProceeds = quote.price * shares;
    
    // Execute trade
    const realizedPL = portfolio.reducePosition(quote.symbol, shares, quote.price);
    portfolio.cash += totalProceeds;
    portfolio.totalTrades += 1;
    
    // Update win/loss stats
    if (realizedPL > 0) {
      portfolio.winningTrades += 1;
    } else if (realizedPL < 0) {
      portfolio.losingTrades += 1;
    }
    
    portfolio.calculateTotalValue();
    await portfolio.save();
    
    // Record trade
    await Trade.recordSell(
      req.user._id,
      portfolio._id,
      quote.symbol,
      quote.name || quote.symbol,
      shares,
      quote.price,
      realizedPL
    );
    
    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      totalTrades: portfolio.totalTrades,
      portfolioValue: portfolio.totalValue,
      performancePercent: portfolio.totalPLPercent
    });
    
    res.json({
      success: true,
      message: `Sold ${shares} shares of ${quote.symbol} at $${quote.price.toFixed(2)}`,
      trade: {
        type: 'SELL',
        symbol: quote.symbol,
        shares,
        price: quote.price,
        totalProceeds,
        realizedPL,
        realizedPLPercent: ((realizedPL / (position.averageCost * shares)) * 100).toFixed(2)
      },
      portfolio: {
        cash: portfolio.cash,
        totalValue: portfolio.totalValue,
        totalPL: portfolio.totalPL,
        totalPLPercent: portfolio.totalPLPercent
      }
    });
  } catch (error) {
    console.error('Sell trade error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to execute sell order', error: error.message });
  }
});

/**
 * GET /api/simulator/history
 * Get trade history
 */
router.get('/history', async (req, res) => {
  try {
    const { symbol, limit = 50, page = 1 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const result = await Trade.getHistory(req.user._id, {
      symbol,
      limit: parseInt(limit),
      skip
    });
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trade history', error: error.message });
  }
});

/**
 * GET /api/simulator/stats
 * Get trading statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user._id, isActive: true });
    
    if (!portfolio) {
      return res.json({
        success: true,
        stats: {
          totalTrades: 0,
          buyTrades: 0,
          sellTrades: 0,
          totalRealizedPL: 0,
          winningTrades: 0,
          losingTrades: 0,
          winRate: 0,
          totalVolume: 0,
          averageTradeSize: 0
        }
      });
    }
    
    const stats = await Trade.getStats(req.user._id, portfolio._id);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
  }
});

/**
 * GET /api/simulator/search
 * Search for stocks
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    
    const results = await marketData.searchStocks(q);
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Search failed', error: error.message });
  }
});

/**
 * GET /api/simulator/company/:symbol
 * Get company information
 */
router.get('/company/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const info = await marketData.getCompanyInfo(symbol.toUpperCase());
    
    res.json({
      success: true,
      company: info
    });
  } catch (error) {
    console.error('Get company info error:', error);
    res.status(404).json({ success: false, message: `Company information not found for ${req.params.symbol}`, error: error.message });
  }
});

/**
 * GET /api/simulator/market-status
 * Get market status
 */
router.get('/market-status', async (req, res) => {
  try {
    const status = await marketData.getMarketStatus();
    
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Get market status error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch market status', error: error.message });
  }
});

/**
 * POST /api/simulator/reset
 * Reset portfolio to starting state
 */
router.post('/reset', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user._id, isActive: true });
    
    if (portfolio) {
      portfolio.cash = 100000;
      portfolio.positions = [];
      portfolio.totalValue = 100000;
      portfolio.totalPL = 0;
      portfolio.totalPLPercent = 0;
      portfolio.totalTrades = 0;
      portfolio.winningTrades = 0;
      portfolio.losingTrades = 0;
      await portfolio.save();
    }
    
    res.json({
      success: true,
      message: 'Portfolio reset to starting state',
      portfolio: {
        cash: 100000,
        totalValue: 100000,
        positions: []
      }
    });
  } catch (error) {
    console.error('Reset portfolio error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset portfolio', error: error.message });
  }
});

module.exports = router;
