const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const Article = require('./models/Article');
const CacheRefreshLog = require('./models/CacheRefreshLog');

/**
 * Article Cache System with MongoDB Persistence
 * Maintains a database of scraped financial news articles with intelligent refresh
 * Requirements:
 * - Minimum 750 reputable sources
 * - 40%+ articles from last 3 days
 * - 75%+ articles from last week
 * - Filters outdated info while keeping historical context
 * - Automatic cleanup of articles older than 90 days
 */

class ArticleCache {
  constructor() {
    this.lastRefresh = null;
    this.sources = this.getReputableSources();
    this.minArticles = 750;
    this.refreshInterval = 3600000; // 1 hour in milliseconds
    this.cleanupInterval = 86400000; // 24 hours in milliseconds
    this.lastCleanup = null;
  }

  /**
   * List of reputable financial news sources
   */
  getReputableSources() {
    return [
      { name: 'Bloomberg', url: 'https://www.bloomberg.com/markets', apiKey: null },
      { name: 'Reuters', url: 'https://www.reuters.com/markets/', apiKey: null },
      { name: 'Wall Street Journal', url: 'https://www.wsj.com/news/markets', apiKey: null },
      { name: 'Financial Times', url: 'https://www.ft.com/markets', apiKey: null },
      { name: 'MarketWatch', url: 'https://www.marketwatch.com/', apiKey: null },
      { name: 'CNBC', url: 'https://www.cnbc.com/markets/', apiKey: null },
      { name: 'Seeking Alpha', url: 'https://seekingalpha.com/', apiKey: null },
      { name: 'Barron\'s', url: 'https://www.barrons.com/', apiKey: null },
      { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/', apiKey: null },
      { name: 'Benzinga', url: 'https://www.benzinga.com/', apiKey: null },
      { name: 'The Motley Fool', url: 'https://www.fool.com/', apiKey: null },
      { name: 'Investor\'s Business Daily', url: 'https://www.investors.com/', apiKey: null },
      { name: 'Forbes', url: 'https://www.forbes.com/markets/', apiKey: null },
      { name: 'Business Insider', url: 'https://www.businessinsider.com/finance', apiKey: null },
      { name: 'TheStreet', url: 'https://www.thestreet.com/', apiKey: null }
    ];
  }

  /**
   * Calculate article age in days
   */
  getArticleAgeInDays(publishDate) {
    const now = new Date();
    const published = new Date(publishDate);
    const diffTime = Math.abs(now - published);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Generate content hash for deduplication
   */
  generateContentHash(title, source) {
    return crypto.createHash('md5').update(`${title}-${source}`).digest('hex');
  }

  /**
   * Check if cache needs refresh based on recency requirements
   */
  async needsRefresh() {
    if (!this.lastRefresh) return true;
    
    const timeSinceRefresh = Date.now() - this.lastRefresh;
    if (timeSinceRefresh > this.refreshInterval) return true;

    // Check article distribution from database
    const stats = await Article.getDistributionStats();
    
    // Need refresh if below thresholds
    if (stats.total < this.minArticles) return true;
    if (parseFloat(stats.last3DaysPercent) < 40) return true;
    if (parseFloat(stats.lastWeekPercent) < 75) return true;

    return false;
  }

  /**
   * Get cache statistics from database
   */
  async getCacheStats() {
    return await Article.getDistributionStats();
  }

  /**
   * Scrape articles from a news source (example implementation)
   * In production, use official APIs when available
   */
  async scrapeSource(source, ticker = null, politician = null) {
    try {
      let searchUrl = source.url;
      
      // Add search parameters if specific ticker or politician
      if (ticker) {
        searchUrl += `?q=${ticker}`;
      } else if (politician) {
        searchUrl += `?q=${encodeURIComponent(politician)}`;
      }

      // Simulated scraping (replace with actual implementation)
      // In production, use APIs like NewsAPI, Alpha Vantage, or Finnhub
      const articles = await this.mockScrapeArticles(source, ticker, politician);
      
      return articles;
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error.message);
      return [];
    }
  }

  /**
   * Mock article scraping (replace with real API calls in production)
   */
  async mockScrapeArticles(source, ticker = null, politician = null) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const now = new Date();
    const articles = [];
    const count = Math.floor(Math.random() * 10) + 5; // 5-15 articles per source

    for (let i = 0; i < count; i++) {
      // Generate dates with proper distribution
      let publishDate;
      const rand = Math.random();
      
      if (rand < 0.45) {
        // 45% from last 3 days
        publishDate = new Date(now - Math.random() * 3 * 24 * 60 * 60 * 1000);
      } else if (rand < 0.80) {
        // 35% from 3-7 days ago
        publishDate = new Date(now - (3 + Math.random() * 4) * 24 * 60 * 60 * 1000);
      } else {
        // 20% older historical data
        publishDate = new Date(now - (7 + Math.random() * 60) * 24 * 60 * 60 * 1000);
      }

      articles.push({
        id: `${source.name}-${Date.now()}-${i}`,
        title: this.generateMockTitle(ticker, politician),
        source: source.name,
        url: `${source.url}/article-${i}`,
        publishDate: publishDate.toISOString(),
        summary: this.generateMockSummary(ticker, politician),
        ticker: ticker || 'MARKET',
        politician: politician || null,
        sentiment: this.calculateSentiment(),
        relevanceScore: Math.random() * 0.4 + 0.6 // 0.6-1.0
      });
    }

    return articles;
  }

  /**
   * Generate mock article title
   */
  generateMockTitle(ticker, politician) {
    if (ticker) {
      const templates = [
        `${ticker} Stock Analysis: Key Trends to Watch`,
        `Why ${ticker} Could Be Poised for Growth`,
        `${ticker} Earnings Report Exceeds Expectations`,
        `Analysts Upgrade ${ticker} Price Target`,
        `${ticker} Announces Strategic Partnership`
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    } else if (politician) {
      return `${politician}'s Latest Stock Trades Revealed`;
    }
    return 'Market Update: Key Economic Indicators';
  }

  /**
   * Generate mock article summary
   */
  generateMockSummary(ticker, politician) {
    if (ticker) {
      return `Comprehensive analysis of ${ticker}'s recent performance, market position, and future outlook based on current market conditions and analyst forecasts.`;
    } else if (politician) {
      return `Detailed breakdown of ${politician}'s recent stock portfolio transactions and potential market implications.`;
    }
    return 'Analysis of current market trends and economic indicators affecting investor sentiment.';
  }

  /**
   * Calculate sentiment score (-1 to 1)
   */
  calculateSentiment() {
    return (Math.random() * 2 - 1).toFixed(2);
  }

  /**
   * Refresh cache with new articles from all sources
   */
  async refreshCache(triggeredBy = 'auto') {
    console.log(`🔄 Starting cache refresh (triggered by: ${triggeredBy})...`);

    // Create refresh log
    const refreshLog = new CacheRefreshLog({
      startTime: new Date(),
      triggeredBy,
      distributionBefore: await this.getCacheStats()
    });

    try {
      const newArticles = [];
      
      // Scrape from each source
      for (const source of this.sources) {
        try {
          console.log(`  📰 Scraping ${source.name}...`);
          const articles = await this.scrapeSource(source);
          
          refreshLog.sourcesScraped.push({
            source: source.name,
            articlesFound: articles.length,
            articlesAdded: 0 // Will update after insertion
          });
          
          newArticles.push(...articles);
        } catch (error) {
          console.error(`  ❌ Failed to scrape ${source.name}:`, error.message);
          refreshLog.errors.push({
            message: error.message,
            source: source.name,
            timestamp: new Date()
          });
        }
      }

      refreshLog.totalArticlesFound = newArticles.length;

      // Insert new articles into database (with deduplication)
      const insertResult = await this.insertArticles(newArticles);
      refreshLog.totalArticlesAdded = insertResult.inserted;
      refreshLog.duplicatesSkipped = insertResult.duplicates;

      // Update source stats
      refreshLog.sourcesScraped.forEach(src => {
        const sourceArticles = newArticles.filter(a => a.source === src.source);
        src.articlesAdded = sourceArticles.length;
      });

      // Clean outdated articles (older than 90 days)
      await this.cleanupOutdatedArticles();

      // Prune to maintain distribution
      const pruneResult = await Article.pruneToDistribution(this.minArticles, 40, 75);
      refreshLog.articlesDeleted = pruneResult.pruned;

      // Finalize log
      refreshLog.endTime = new Date();
      refreshLog.duration = refreshLog.endTime - refreshLog.startTime;
      refreshLog.distributionAfter = await this.getCacheStats();
      refreshLog.status = refreshLog.errors.length === 0 ? 'completed' : 'partial';

      await refreshLog.save();

      this.lastRefresh = Date.now();

      const stats = refreshLog.distributionAfter;
      console.log('✅ Cache refresh complete:');
      console.log(`   Total: ${stats.total} articles`);
      console.log(`   Last 3 days: ${stats.last3Days} (${stats.last3DaysPercent}%)`);
      console.log(`   Last week: ${stats.lastWeek} (${stats.lastWeekPercent}%)`);
      console.log(`   Duration: ${(refreshLog.duration / 1000).toFixed(2)}s`);

      return {
        success: true,
        stats,
        refreshLog: refreshLog._id
      };

    } catch (error) {
      console.error('❌ Cache refresh failed:', error);
      refreshLog.endTime = new Date();
      refreshLog.duration = refreshLog.endTime - refreshLog.startTime;
      refreshLog.status = 'failed';
      refreshLog.errors.push({
        message: error.message,
        timestamp: new Date()
      });
      await refreshLog.save();

      throw error;
    }
  }

  /**
   * Insert articles into database with deduplication
   */
  async insertArticles(articles) {
    let inserted = 0;
    let duplicates = 0;

    for (const articleData of articles) {
      try {
        // Check if article already exists by URL
        const existing = await Article.findOne({ url: articleData.url, isActive: true });
        
        if (existing) {
          duplicates++;
          continue;
        }

        // Check for duplicate by content hash
        const contentHash = this.generateContentHash(articleData.title, articleData.source);
        const duplicateByHash = await Article.findOne({ contentHash, isActive: true });
        
        if (duplicateByHash) {
          duplicates++;
          continue;
        }

        // Insert new article
        const article = new Article({
          ...articleData,
          contentHash
        });
        
        await article.save();
        inserted++;

      } catch (error) {
        console.error(`Failed to insert article: ${articleData.title}`, error.message);
      }
    }

    return { inserted, duplicates };
  }

  /**
   * Cleanup outdated articles (older than 90 days)
   */
  async cleanupOutdatedArticles() {
    if (this.lastCleanup && (Date.now() - this.lastCleanup < this.cleanupInterval)) {
      return { skipped: true };
    }

    console.log('🧹 Cleaning outdated articles...');
    const result = await Article.cleanOutdatedArticles(this.minArticles);
    
    this.lastCleanup = Date.now();
    
    return result;
  }

  /**
   * Prune cache to maintain optimal distribution
   * Keeps minimum 750 articles with proper age distribution
   */
  pruneCache() {
    // Sort by date (newest first)
    this.articles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

    const now = new Date();
    const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const last3Days = this.articles.filter(a => new Date(a.publishDate) >= threeDaysAgo);
    const last3To7Days = this.articles.filter(a => {
      const date = new Date(a.publishDate);
      return date < threeDaysAgo && date >= weekAgo;
    });
    const older = this.articles.filter(a => new Date(a.publishDate) < weekAgo);

    // Calculate required counts
    const target3Days = Math.ceil(this.minArticles * 0.40); // 40%
    const targetWeek = Math.ceil(this.minArticles * 0.75); // 75%
    const target3To7Days = targetWeek - target3Days;
    const targetOlder = this.minArticles - targetWeek;

    // Build pruned cache
    this.articles = [
      ...last3Days.slice(0, Math.max(last3Days.length, target3Days)),
      ...last3To7Days.slice(0, Math.max(last3To7Days.length, target3To7Days)),
      ...older.slice(0, Math.max(older.length, targetOlder))
    ];
  }

  /**
   * Get filtered articles from database
   */
  async getArticles(filters = {}) {
    const query = { isActive: true };

    // Filter by ticker
    if (filters.ticker) {
      query.ticker = filters.ticker;
    }

    // Filter by politician
    if (filters.politician) {
      query.politician = filters.politician;
    }

    // Filter by category
    if (filters.category) {
      query.category = filters.category;
    }

    // Filter by date range
    if (filters.daysOld) {
      const cutoff = new Date(Date.now() - filters.daysOld * 24 * 60 * 60 * 1000);
      query.publishDate = { $gte: cutoff };
    }

    // Filter by minimum relevance score
    if (filters.minRelevance) {
      query.relevanceScore = { $gte: filters.minRelevance };
    }

    // Execute query with sort and limit
    let queryBuilder = Article.find(query)
      .sort({ relevanceScore: -1, publishDate: -1 });

    if (filters.limit) {
      queryBuilder = queryBuilder.limit(filters.limit);
    }

    const articles = await queryBuilder.lean();

    // Record access for each article (in background)
    if (articles.length > 0 && !filters.skipAccessTracking) {
      const articleIds = articles.map(a => a._id);
      Article.updateMany(
        { _id: { $in: articleIds } },
        { 
          $set: { lastAccessedAt: new Date() },
          $inc: { accessCount: 1 }
        }
      ).exec().catch(err => console.error('Failed to track article access:', err));
    }

    return articles;
  }

  /**
   * Get articles with automatic refresh if needed
   */
  async getArticlesWithRefresh(filters = {}) {
    if (await this.needsRefresh()) {
      await this.refreshCache('auto');
    }

    return await this.getArticles(filters);
  }

  /**
   * Get refresh history
   */
  async getRefreshHistory(limit = 10) {
    return await CacheRefreshLog.getRecentHistory(limit);
  }

  /**
   * Get refresh statistics
   */
  async getRefreshStats(days = 7) {
    return await CacheRefreshLog.getRefreshStats(days);
  }
}

// Singleton instance
const articleCache = new ArticleCache();

module.exports = articleCache;
