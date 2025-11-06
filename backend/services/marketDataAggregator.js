const polygonService = require('./external/polygon');
const yahooFinanceService = require('./external/yahooFinance');
const marketstackService = require('./external/marketstack');

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute for real-time quotes

class MarketDataAggregator {
  /**
   * Get real-time quote for a symbol
   * Tries multiple sources with fallback logic
   */
  async getQuote(symbol) {
    const cacheKey = `quote_${symbol}`;
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Try Yahoo Finance first (most reliable for quotes)
      try {
        const quote = await yahooFinanceService.fetchQuote(symbol);
        if (quote && quote.regularMarketPrice) {
          const result = {
            symbol: symbol.toUpperCase(),
            name: quote.shortName || quote.longName,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            open: quote.regularMarketOpen,
            high: quote.regularMarketDayHigh,
            low: quote.regularMarketDayLow,
            close: quote.regularMarketPreviousClose,
            volume: quote.regularMarketVolume,
            timestamp: quote.regularMarketTime ? quote.regularMarketTime * 1000 : Date.now(),
            source: 'yahoo'
          };
          this._setCache(cacheKey, result);
          return result;
        }
      } catch (yahooError) {
        console.log(`Yahoo Finance failed for ${symbol}:`, yahooError.message);
      }

      // Try Polygon as fallback
      try {
        const data = await polygonService.fetchPreviousClose(symbol);
        if (data && data.results && data.results.length > 0) {
          const quote = data.results[0];
          const result = {
            symbol: symbol.toUpperCase(),
            price: quote.c,
            change: quote.c - quote.o,
            changePercent: ((quote.c - quote.o) / quote.o) * 100,
            open: quote.o,
            high: quote.h,
            low: quote.l,
            close: quote.c,
            volume: quote.v,
            timestamp: quote.t || Date.now(),
            source: 'polygon'
          };
          this._setCache(cacheKey, result);
          return result;
        }
      } catch (polygonError) {
        console.log(`Polygon failed for ${symbol}:`, polygonError.message);
      }

      throw new Error(`Unable to fetch quote for ${symbol} from any source`);
    } catch (error) {
      console.error(`Failed to get quote for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get quotes for multiple symbols
   */
  async getQuotes(symbols) {
    const promises = symbols.map(symbol => 
      this.getQuote(symbol).catch(err => ({
        symbol: symbol.toUpperCase(),
        error: err.message,
        price: 0
      }))
    );
    return await Promise.all(promises);
  }

  /**
   * Get historical data for a symbol
   */
  async getHistoricalData(symbol, options = {}) {
    const { from, to, timeframe = 'day' } = options;
    
    try {
      // Try Yahoo Finance first (most reliable)
      try {
        const period1 = from ? new Date(from) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const period2 = to ? new Date(to) : new Date();
        
        const data = await yahooFinanceService.fetchHistorical(symbol, {
          period1,
          period2,
          interval: '1d'
        });
        
        if (data && data.length > 0) {
          return {
            symbol: symbol.toUpperCase(),
            timeframe,
            data: data.map(bar => ({
              timestamp: bar.date.getTime(),
              open: bar.open,
              high: bar.high,
              low: bar.low,
              close: bar.close,
              volume: bar.volume
            })),
            source: 'yahoo'
          };
        }
      } catch (yahooError) {
        console.log(`Yahoo historical failed for ${symbol}:`, yahooError.message);
      }

      // Try Polygon as fallback
      try {
        const fromDate = from || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const toDate = to || new Date().toISOString().split('T')[0];
        
        const result = await polygonService.fetchAggregates(symbol, 1, timeframe, fromDate, toDate);
        
        if (result && result.results && result.results.length > 0) {
          return {
            symbol: symbol.toUpperCase(),
            timeframe,
            data: result.results.map(bar => ({
              timestamp: bar.t,
              open: bar.o,
              high: bar.h,
              low: bar.l,
              close: bar.c,
              volume: bar.v
            })),
            source: 'polygon'
          };
        }
      } catch (polygonError) {
        console.log(`Polygon historical failed for ${symbol}:`, polygonError.message);
      }

      throw new Error(`No historical data available for ${symbol}`);
    } catch (error) {
      console.error(`Failed to get historical data for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Search for stocks by query
   */
  async searchStocks(query) {
    try {
      // For now, return a simple list of popular stocks
      // In production, you'd use Polygon's ticker search API
      const popularStocks = [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'CS', active: true },
        { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'CS', active: true },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'CS', active: true },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'CS', active: true },
        { symbol: 'TSLA', name: 'Tesla Inc.', type: 'CS', active: true },
        { symbol: 'META', name: 'Meta Platforms Inc.', type: 'CS', active: true },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'CS', active: true },
        { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'CS', active: true },
        { symbol: 'V', name: 'Visa Inc.', type: 'CS', active: true },
        { symbol: 'WMT', name: 'Walmart Inc.', type: 'CS', active: true },
        { symbol: 'DIS', name: 'The Walt Disney Company', type: 'CS', active: true },
        { symbol: 'NFLX', name: 'Netflix Inc.', type: 'CS', active: true },
        { symbol: 'BA', name: 'The Boeing Company', type: 'CS', active: true },
        { symbol: 'GE', name: 'General Electric Company', type: 'CS', active: true },
        { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', type: 'CS', active: true }
      ];
      
      const queryLower = query.toLowerCase();
      const results = popularStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(queryLower) ||
        stock.name.toLowerCase().includes(queryLower)
      );
      
      return results;
    } catch (error) {
      console.error(`Failed to search stocks for "${query}":`, error);
      return [];
    }
  }

  /**
   * Get company information
   */
  async getCompanyInfo(symbol) {
    const cacheKey = `company_${symbol}`;
    const cached = this._getFromCache(cacheKey, 3600000); // Cache for 1 hour
    if (cached) return cached;

    try {
      // Use Yahoo Finance for company info
      const info = await yahooFinanceService.fetchQuote(symbol);
      if (info) {
        const result = {
          symbol: symbol.toUpperCase(),
          name: info.longName || info.shortName,
          description: info.longBusinessSummary,
          marketCap: info.marketCap,
          sector: info.sector,
          website: info.website,
          source: 'yahoo'
        };
        this._setCache(cacheKey, result, 3600000);
        return result;
      }

      throw new Error(`No company info available for ${symbol}`);
    } catch (error) {
      console.error(`Failed to get company info for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get market status
   */
  async getMarketStatus() {
    try {
      // Basic market hours check (9:30 AM - 4 PM ET, Mon-Fri)
      const now = new Date();
      const day = now.getUTCDay();
      const hour = now.getUTCHours();
      
      // Convert to ET (UTC - 5 or UTC - 4 depending on DST)
      const etHour = hour - 5; // Simplified, doesn't account for DST
      
      const isWeekday = day >= 1 && day <= 5;
      const isDuringMarketHours = etHour >= 9.5 && etHour < 16;
      
      return {
        market: isWeekday && isDuringMarketHours ? 'open' : 'closed',
        serverTime: now.toISOString(),
        note: 'Market hours: 9:30 AM - 4:00 PM ET, Monday-Friday'
      };
    } catch (error) {
      return {
        market: 'unknown',
        serverTime: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Validate if a symbol is tradeable
   */
  async validateSymbol(symbol) {
    try {
      const quote = await this.getQuote(symbol);
      return {
        valid: !!quote.price,
        symbol: quote.symbol,
        price: quote.price,
        source: quote.source
      };
    } catch (error) {
      return {
        valid: false,
        symbol: symbol.toUpperCase(),
        error: error.message
      };
    }
  }

  // Cache helpers
  _getFromCache(key, maxAge = CACHE_DURATION) {
    const item = cache.get(key);
    if (!item) return null;
    
    const age = Date.now() - item.timestamp;
    if (age > maxAge) {
      cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  _setCache(key, data, maxAge = CACHE_DURATION) {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Auto-cleanup after maxAge
    setTimeout(() => cache.delete(key), maxAge);
  }

  /**
   * Clear all cache
   */
  clearCache() {
    cache.clear();
  }
}

module.exports = new MarketDataAggregator();
