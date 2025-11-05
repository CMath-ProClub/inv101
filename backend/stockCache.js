/**
 * Stock Data Cache Service  
 * Caches top 1500 stocks by market cap + major index funds
 * Provides S&P 500 comparison functionality
 */

const yahooFinance = require('yahoo-finance2').default;
const { recordQuoteBatch, recordHistoricalQuotes } = require('./stockQuoteStore');
const {
  ALL_TICKERS,
  INDEX_FUNDS,
  SP500_TICKERS,
  RUSSELL_1000_TICKERS,
  RUSSELL_2000_TICKERS,
  TICKER_GROUPS
} = require('./data/tickerUniverse');

// Suppress Yahoo Finance validation errors and notices
const queryOptions = { validateResult: false };
yahooFinance.setGlobalConfig({
  validation: {
    logErrors: false,
    logOptionsErrors: false
  },
  queue: {
    timeout: 20000
  }
});

if (typeof yahooFinance.suppressNotices === 'function') {
  yahooFinance.suppressNotices(['ripHistorical', 'yahooSurvey']);
}

function parseTickerList(value, fallback) {
  const input = typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  return input
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}

const MARKET_TIMEZONE = 'America/New_York';
const MARKET_OPEN_MINUTES = 9 * 60 + 30; // 9:30 AM ET
const MARKET_CLOSE_MINUTES = 16 * 60; // 4:00 PM ET
const MARKET_WEEKEND = new Set(['Sat', 'Sun']);

const DEFAULT_INTRADAY_TICKERS = parseTickerList(
  process.env.STOCK_INTRADAY_TICKERS,
  'SPY,QQQ,DIA,IWM,AAPL,MSFT,GOOGL,AMZN,NVDA,TSLA,META,AMD'
);

const DEFAULT_HISTORICAL_TICKERS = parseTickerList(
  process.env.STOCK_HISTORICAL_TICKERS,
  process.env.STOCK_INTRADAY_TICKERS || 'SPY,QQQ,DIA,IWM,AAPL,MSFT,GOOGL,AMZN,NVDA,TSLA,META,AMD'
);

const HISTORICAL_LOOKBACK_DAYS = parseInt(process.env.STOCK_HISTORICAL_LOOKBACK_DAYS || '365', 10);
const HISTORICAL_INTERVAL = process.env.STOCK_HISTORICAL_INTERVAL || '1d';
const HISTORICAL_BUCKET_MINUTES = parseInt(process.env.STOCK_HISTORICAL_BUCKET_MINUTES || '1440', 10);
const HISTORICAL_BATCH_DELAY_MS = parseInt(process.env.STOCK_HISTORICAL_BATCH_DELAY_MS || '1000', 10);

const TOP_1500_TICKERS = [...SP500_TICKERS, ...RUSSELL_1000_TICKERS, ...RUSSELL_2000_TICKERS];

class StockDataCache {
  constructor() {
  this.cache = new Map();
  this.lastRefresh = null;
  this.refreshInterval = 6 * 60 * 60 * 1000; // 6 hours
  this.sp500Data = null;
  this.intradayTickers = Array.from(DEFAULT_INTRADAY_TICKERS);
  this.intradayBatchSize = parseInt(process.env.STOCK_INTRADAY_BATCH_SIZE || '12', 10);
  this.persistQuotes = String(process.env.STOCK_QUOTE_PERSIST || 'true').toLowerCase() !== 'false';
  this.historicalTickers = Array.from(DEFAULT_HISTORICAL_TICKERS);
  this.historicalLookbackDays = HISTORICAL_LOOKBACK_DAYS;
  this.historicalInterval = HISTORICAL_INTERVAL;
  this.historicalBucketMinutes = HISTORICAL_BUCKET_MINUTES;
  this.historicalBatchDelayMs = HISTORICAL_BATCH_DELAY_MS;
  this.historicalBackfillRunning = false;
  this.historicalBackfillStatus = { lastRun: null, lastSummary: null };
    this.lastIntradayRun = null;
    this.lastIntradayStatus = null;
  }

  /**
   * Fetch and cache stock data for all tickers
   */
  async refreshTickers(tickers = ALL_TICKERS, batchSize = 10, options = {}) {
    const { persist = this.persistQuotes } = options;
    const totalTickers = tickers.length;
    console.log(`\n🔄 Starting stock data refresh for ${totalTickers} tickers...`);
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    const refreshed = [];

    for (let i = 0; i < totalTickers; i += batchSize) {
      const batch = tickers.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(totalTickers / batchSize)}: ${batch.length} tickers`);

      const promises = batch.map((ticker) => this.fetchStockData(ticker));
      const results = await Promise.allSettled(promises);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
          refreshed.push(result.value);
        } else {
          errorCount++;
          if (errorCount <= 10) {
            console.warn(`   ⚠️  Failed: ${batch[index]} - ${result.reason?.message || 'Unknown error'}`);
          }
        }
      });

      if (i + batchSize < totalTickers) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    await this.refreshSP500Data();

    this.lastRefresh = new Date();
    const durationSeconds = (Date.now() - startTime) / 1000;

    if (persist && refreshed.length > 0) {
      const persistResult = await recordQuoteBatch(refreshed);
      console.log(`💾 Persisted quotes: inserted ${persistResult.inserted}, matched ${persistResult.matched}`);
    }

    const duration = durationSeconds.toFixed(1);

    console.log(`\n✅ Stock data refresh complete!`);
    console.log(`   ✅ Success: ${successCount} stocks`);
    console.log(`   ❌ Failed: ${errorCount} stocks`);
    console.log(`   ⏱️  Duration: ${duration}s`);
    console.log(`   📊 Cache size: ${this.cache.size} stocks\n`);

    return {
      success: true,
      successCount,
      errorCount,
      duration,
      cacheSize: this.cache.size,
      lastRefresh: this.lastRefresh
    };
  }

  async refreshAll(batchSize = 10) {
    return this.refreshTickers(ALL_TICKERS, batchSize);
  }

  async refreshIntraday(batchSize = this.intradayBatchSize) {
    if (!this.isMarketOpen()) {
      const status = {
        success: false,
        successCount: 0,
        errorCount: 0,
        duration: '0.0',
        cacheSize: this.cache.size,
        lastRefresh: this.lastRefresh,
        skipped: true,
        reason: 'market-closed'
      };
      this.lastIntradayStatus = status;
      return status;
    }
    const tickers = this.intradayTickers.length > 0 ? this.intradayTickers : DEFAULT_INTRADAY_TICKERS;
    const result = await this.refreshTickers(tickers, batchSize, { persist: this.persistQuotes });
    this.lastIntradayRun = new Date();
    this.lastIntradayStatus = { ...result, skipped: false };
    return result;
  }

  async backfillHistoricalQuotes(options = {}) {
    if (this.historicalBackfillRunning) {
      console.log('⏭️  Historical backfill already in progress');
      return { running: true, lastSummary: this.historicalBackfillStatus.lastSummary };
    }

    const {
      tickers = this.historicalTickers,
      lookbackDays = this.historicalLookbackDays,
      interval = this.historicalInterval,
      bucketMinutes = this.historicalBucketMinutes,
      delayMs = this.historicalBatchDelayMs
    } = options;

    const targetTickers = Array.isArray(tickers)
      ? tickers
      : parseTickerList(String(tickers || ''), this.historicalTickers.join(','));

    const uniqueTickers = [...new Set(targetTickers.map((symbol) => symbol.toUpperCase()).filter(Boolean))];

    if (uniqueTickers.length === 0) {
      return { success: false, error: 'No tickers configured for historical backfill' };
    }

    this.historicalBackfillRunning = true;
    this.historicalBackfillStatus.lastRun = new Date();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - lookbackDays * 24 * 60 * 60 * 1000);
    let inserted = 0;
    let matched = 0;
    const failures = [];

  console.log(`📚 Starting historical backfill for ${uniqueTickers.length} tickers (${lookbackDays} days @ ${interval})`);

  for (const symbol of uniqueTickers) {
      try {
        console.log(`   🔄 Fetching historical candles for ${symbol}`);
        const candles = await yahooFinance.historical(symbol, {
          period1: startDate,
          period2: endDate,
          interval,
          events: 'history'
        }, queryOptions);

        if (!Array.isArray(candles) || candles.length === 0) {
          console.warn(`   ⚠️  No historical data returned for ${symbol}`);
          continue;
        }

        const normalized = candles
          .filter((candle) => candle && typeof candle.close === 'number')
          .map((candle) => {
            const bucket = new Date(candle.date);
            const open = typeof candle.open === 'number' ? candle.open : undefined;
            const close = candle.close;
            const change = typeof open === 'number' ? close - open : undefined;
            const changePercent = typeof open === 'number' && open !== 0 ? ((close - open) / open) * 100 : undefined;

            return {
              symbol,
              price: close,
              change,
              changePercent,
              volume: candle.volume,
              previousClose: candle.adjClose ?? close,
              open,
              dayHigh: candle.high,
              dayLow: candle.low,
              currency: candle.currency || 'USD',
              exchange: candle.exchange,
              bucket,
              fetchedAt: new Date(bucket)
            };
          });

        if (normalized.length === 0) {
          console.warn(`   ⚠️  Unable to normalize historical data for ${symbol}`);
          continue;
        }

        const result = await recordHistoricalQuotes(symbol, normalized, {
          source: 'yahoo-finance-historical',
          intervalMinutes: bucketMinutes
        });

        inserted += result.inserted || 0;
        matched += (result.matched || 0) + (result.modified || 0);
      } catch (error) {
        console.error(`   ❌ Historical backfill failed for ${symbol}:`, error.message);
        failures.push({ symbol, error: error.message });
      }

      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    const summary = {
      success: failures.length === 0,
  tickersProcessed: uniqueTickers.length,
      lookbackDays,
      interval,
      bucketMinutes,
      inserted,
      matched,
      failures
    };

    this.historicalBackfillRunning = false;
    this.historicalBackfillStatus.lastSummary = summary;
    this.historicalBackfillStatus.lastRun = new Date();

    console.log('📚 Historical backfill summary:', summary);

    return summary;
  }

  /**
   * Fetch data for a single stock
   */
  async fetchStockData(ticker) {
    try {
      // Fetch quote data
      const quote = await yahooFinance.quote(ticker, { 
        validateResult: false
      }).catch(err => {
        // Silently skip validation errors
        if (err.message && err.message.includes('validation')) {
          return null;
        }
        throw err;
      });
      
      if (!quote || typeof quote.regularMarketPrice === 'undefined') {
        throw new Error('No price data available');
      }

      const stockData = {
        ticker: ticker,
        name: quote.longName || quote.shortName || ticker,
        price: quote.regularMarketPrice,
        previousClose: quote.regularMarketPreviousClose,
        open: quote.regularMarketOpen,
        dayHigh: quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        peRatio: quote.trailingPE,
        dividendYield: quote.dividendYield,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
        averageVolume: quote.averageVolume,
        beta: quote.beta,
        sector: quote.sector,
        industry: quote.industry,
        currency: quote.currency || 'USD',
        exchange: quote.fullExchangeName,
        lastUpdated: new Date(),
        raw: quote
      };

      this.cache.set(ticker, stockData);
      return stockData;
    } catch (error) {
      throw new Error(`Failed to fetch ${ticker}: ${error.message}`);
    }
  }

  /**
   * Fetch S&P 500 benchmark data
   */
  async refreshSP500Data() {
    try {
      console.log('📊 Fetching S&P 500 benchmark data...');
      const sp500 = await yahooFinance.quote('SPY', { validateResult: false });
      
      this.sp500Data = {
        ticker: 'SPY',
        price: sp500.regularMarketPrice,
        change: sp500.regularMarketChange,
        changePercent: sp500.regularMarketChangePercent,
        lastUpdated: new Date()
      };

      console.log(`   ✅ S&P 500: $${sp500.regularMarketPrice.toFixed(2)} (${sp500.regularMarketChangePercent > 0 ? '+' : ''}${sp500.regularMarketChangePercent?.toFixed(2)}%)`);
    } catch (error) {
      console.warn('   ⚠️  Failed to fetch S&P 500 data:', error.message);
    }
  }

  /**
   * Get stock data from cache
   */
  getStock(ticker) {
    return this.cache.get(ticker.toUpperCase());
  }

  /**
   * Get multiple stocks from cache
   */
  getStocks(tickers) {
    return tickers.map(t => this.getStock(t)).filter(Boolean);
  }

  /**
   * Compare stock to S&P 500
   */
  compareToSP500(ticker) {
    const stock = this.getStock(ticker);
    if (!stock || !this.sp500Data) {
      return null;
    }

    const outperformance = stock.changePercent - this.sp500Data.changePercent;
    
    return {
      stock: {
        ticker: stock.ticker,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent
      },
      sp500: {
        ticker: this.sp500Data.ticker,
        price: this.sp500Data.price,
        changePercent: this.sp500Data.changePercent
      },
      comparison: {
        outperformance,
        outperforming: outperformance > 0,
        relativeStrength: ((stock.changePercent / this.sp500Data.changePercent) * 100).toFixed(2)
      }
    };
  }

  /**
   * Get top performers
   */
  getTopPerformers(limit = 50) {
    const stocks = Array.from(this.cache.values());
    return stocks
      .filter(s => s.changePercent !== undefined)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, limit);
  }

  /**
   * Get worst performers
   */
  getWorstPerformers(limit = 50) {
    const stocks = Array.from(this.cache.values());
    return stocks
      .filter(s => s.changePercent !== undefined)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, limit);
  }

  /**
   * Search stocks by name or ticker
   */
  searchStocks(query, limit = 20) {
    const lowerQuery = query.toLowerCase();
    const stocks = Array.from(this.cache.values());
    
    return stocks
      .filter(s => 
        s.ticker.toLowerCase().includes(lowerQuery) ||
        s.name.toLowerCase().includes(lowerQuery)
      )
      .slice(0, limit);
  }

  /**
   * Get stocks by sector
   */
  getStocksBySector(sector) {
    const stocks = Array.from(this.cache.values());
    return stocks.filter(s => s.sector === sector);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const stocks = Array.from(this.cache.values());
    const gainers = stocks.filter(s => s.changePercent > 0).length;
    const losers = stocks.filter(s => s.changePercent < 0).length;
    const unchanged = stocks.filter(s => s.changePercent === 0).length;

    return {
      totalStocks: this.cache.size,
      gainers,
      losers,
      unchanged,
      lastRefresh: this.lastRefresh,
      sp500: this.sp500Data,
      cacheAge: this.lastRefresh ? Date.now() - this.lastRefresh.getTime() : null
    };
  }

  /**
   * Check if cache needs refresh
   */
  needsRefresh() {
    if (!this.lastRefresh) return true;
    return (Date.now() - this.lastRefresh.getTime()) > this.refreshInterval;
  }

  getMarketClock(date = new Date()) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: MARKET_TIMEZONE,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short'
    });

    const parts = formatter.formatToParts(date);
    const map = {};
    for (const part of parts) {
      if (part.type !== 'literal') {
        map[part.type] = part.value;
      }
    }

    const hour = parseInt(map.hour || '0', 10);
    const minute = parseInt(map.minute || '0', 10);
    const totalMinutes = hour * 60 + minute;

    return {
      year: parseInt(map.year || '0', 10),
      month: parseInt(map.month || '0', 10),
      day: parseInt(map.day || '0', 10),
      weekday: map.weekday,
      hour,
      minute,
      second: parseInt(map.second || '0', 10),
      totalMinutes
    };
  }

  isMarketOpen(date = new Date()) {
    const clock = this.getMarketClock(date);
    if (!clock.weekday || MARKET_WEEKEND.has(clock.weekday)) {
      return false;
    }

    const isAfterOpen = clock.totalMinutes >= MARKET_OPEN_MINUTES;
    const isBeforeClose = clock.totalMinutes < MARKET_CLOSE_MINUTES;
    return isAfterOpen && isBeforeClose;
  }
}

// Export singleton instance
const stockCache = new StockDataCache();
stockCache.ALL_TICKERS = ALL_TICKERS;
stockCache.DEFAULT_INTRADAY_TICKERS = DEFAULT_INTRADAY_TICKERS;
stockCache.DEFAULT_HISTORICAL_TICKERS = DEFAULT_HISTORICAL_TICKERS;
stockCache.MARKET_TIMEZONE = MARKET_TIMEZONE;
stockCache.MARKET_OPEN_MINUTES = MARKET_OPEN_MINUTES;
stockCache.MARKET_CLOSE_MINUTES = MARKET_CLOSE_MINUTES;
stockCache.TICKER_GROUPS = TICKER_GROUPS;
stockCache.TOP_1500_TICKERS = TOP_1500_TICKERS;
stockCache.INDEX_FUNDS = INDEX_FUNDS;
stockCache.SP500_TICKERS = SP500_TICKERS;
stockCache.RUSSELL_1000_TICKERS = RUSSELL_1000_TICKERS;
stockCache.RUSSELL_2000_TICKERS = RUSSELL_2000_TICKERS;

module.exports = stockCache;
module.exports.ALL_TICKERS = ALL_TICKERS;
module.exports.DEFAULT_INTRADAY_TICKERS = DEFAULT_INTRADAY_TICKERS;
module.exports.DEFAULT_HISTORICAL_TICKERS = DEFAULT_HISTORICAL_TICKERS;
module.exports.MARKET_TIMEZONE = MARKET_TIMEZONE;
module.exports.MARKET_OPEN_MINUTES = MARKET_OPEN_MINUTES;
module.exports.MARKET_CLOSE_MINUTES = MARKET_CLOSE_MINUTES;
module.exports.TICKER_GROUPS = TICKER_GROUPS;
module.exports.TOP_1500_TICKERS = TOP_1500_TICKERS;
module.exports.INDEX_FUNDS = INDEX_FUNDS;
module.exports.SP500_TICKERS = SP500_TICKERS;
module.exports.RUSSELL_1000_TICKERS = RUSSELL_1000_TICKERS;
module.exports.RUSSELL_2000_TICKERS = RUSSELL_2000_TICKERS;
