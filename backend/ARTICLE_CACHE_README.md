# Article Caching System Documentation

## Overview

The Article Caching System is a sophisticated backend service that maintains a database of financial news articles from reputable sources, ensuring users always have access to fresh, relevant information while maintaining historical context.

## Key Features

### 1. **Intelligent Article Distribution**
- Maintains minimum **750 articles** at all times
- **40%+ articles** from the last 3 days
- **75%+ articles** from the last week
- **25%** historical articles for context and trend analysis

### 2. **Automatic Refresh Logic**
- Refreshes every hour
- Smart refresh triggers based on article age distribution
- Prevents stale data while preserving historical insights

### 3. **Multi-Source Aggregation**
Scrapes from 15+ reputable financial news sources:
- Bloomberg
- Reuters
- Wall Street Journal
- Financial Times
- MarketWatch
- CNBC
- Seeking Alpha
- Barron's
- Yahoo Finance
- Benzinga
- The Motley Fool
- Investor's Business Daily
- Forbes
- Business Insider
- TheStreet

### 4. **Advanced Filtering**
- Filter by ticker symbol
- Filter by politician (for portfolio tracking)
- Filter by date range
- Filter by relevance score
- Sentiment analysis scoring

### 5. **Performance Optimization**
- In-memory caching for fast access
- Deduplication to prevent redundant articles
- Relevance scoring for quality control
- Automatic pruning to maintain optimal distribution

## API Endpoints

### GET `/api/articles/market`
Get general market articles with caching.

**Query Parameters:**
- `limit` (default: 50) - Maximum articles to return
- `daysOld` (optional) - Only articles newer than X days
- `minRelevance` (default: 0.6) - Minimum relevance score (0-1)

**Response:**
```json
{
  "success": true,
  "articles": [
    {
      "id": "unique-id",
      "title": "Article Title",
      "source": "Bloomberg",
      "url": "https://...",
      "publishDate": "2025-10-10T12:00:00Z",
      "summary": "Article summary...",
      "ticker": "MARKET",
      "politician": null,
      "sentiment": 0.45,
      "relevanceScore": 0.85
    }
  ],
  "stats": {
    "total": 820,
    "last3Days": 340,
    "lastWeek": 620,
    "last3DaysPercent": "41.5",
    "lastWeekPercent": "75.6",
    "oldestArticle": 67
  },
  "cached": true
}
```

### GET `/api/articles/stock/:ticker`
Get articles for specific stock ticker.

**Path Parameters:**
- `ticker` - Stock ticker symbol (e.g., AAPL, TSLA)

**Query Parameters:** Same as market endpoint

**Example:**
```
GET /api/articles/stock/AAPL?limit=30&minRelevance=0.7
```

### GET `/api/articles/politician/:name`
Get articles about a politician's stock portfolio.

**Path Parameters:**
- `name` - Politician's name (URL encoded)

**Query Parameters:** Same as market endpoint, plus:
- `daysOld` (default: 30) - Political trades are less frequent

**Example:**
```
GET /api/articles/politician/Nancy%20Pelosi?limit=25
```

### POST `/api/articles/refresh`
Manually trigger cache refresh.

**Request Body:**
```json
{
  "ticker": "AAPL",  // optional
  "politician": "Nancy Pelosi"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cache refreshed successfully",
  "stats": { /* cache stats */ }
}
```

### GET `/api/articles/stats`
Get current cache statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 820,
    "last3Days": 340,
    "lastWeek": 620,
    "last3DaysPercent": "41.5",
    "lastWeekPercent": "75.6",
    "oldestArticle": 67
  },
  "lastRefresh": 1696953600000,
  "needsRefresh": false
}
```

## Client-Side Usage

### Basic Implementation

```html
<!-- Include the API client -->
<script src="article-api.js"></script>

<script>
  // Fetch market articles
  async function loadMarketArticles() {
    const result = await ArticleAPI.getMarketArticles({
      limit: 50,
      daysOld: 7,
      minRelevance: 0.7
    });
    
    if (result.success) {
      console.log(`Loaded ${result.articles.length} articles`);
      ArticleAPI.renderArticles(result.articles, 'articles-container');
      ArticleAPI.renderCacheStats(result.stats, 'stats-container');
    }
  }
  
  // Fetch stock-specific articles
  async function loadStockArticles(ticker) {
    const result = await ArticleAPI.getStockArticles(ticker, {
      limit: 30,
      minRelevance: 0.75
    });
    
    if (result.success) {
      ArticleAPI.renderArticles(result.articles, 'stock-articles');
    }
  }
  
  // Fetch politician portfolio articles
  async function loadPoliticianArticles(name) {
    const result = await ArticleAPI.getPoliticianArticles(name, {
      limit: 25,
      daysOld: 30
    });
    
    if (result.success) {
      ArticleAPI.renderArticles(result.articles, 'politician-articles');
    }
  }
  
  // Get cache statistics
  async function checkCacheHealth() {
    const result = await ArticleAPI.getCacheStats();
    console.log('Cache stats:', result.stats);
  }
  
  // Manual refresh
  async function refreshArticles(ticker = null) {
    const result = await ArticleAPI.refreshCache(ticker);
    if (result.success) {
      console.log('Cache refreshed!', result.stats);
    }
  }
</script>
```

### HTML Structure

```html
<div id="stats-container"></div>
<div id="articles-container"></div>

<script>
  // Load on page load
  document.addEventListener('DOMContentLoaded', loadMarketArticles);
</script>
```

## Backend Architecture

### ArticleCache Class

The core `ArticleCache` class manages the entire caching system:

```javascript
const articleCache = require('./articleCache');

// Get articles with automatic refresh
const articles = await articleCache.getArticlesWithRefresh({
  ticker: 'AAPL',
  limit: 50,
  minRelevance: 0.7
});

// Manual refresh
await articleCache.refreshCache('TSLA');

// Get statistics
const stats = articleCache.getCacheStats();

// Check if refresh needed
if (articleCache.needsRefresh()) {
  await articleCache.refreshCache();
}
```

## Production Considerations

### 1. **Database Integration**
Replace in-memory storage with persistent database:

```javascript
// Example: PostgreSQL integration
class ArticleCache {
  constructor() {
    this.db = new PostgresClient(/* config */);
  }
  
  async getArticles(filters) {
    return await this.db.query(`
      SELECT * FROM articles 
      WHERE publish_date >= $1 
      ORDER BY relevance_score DESC, publish_date DESC
      LIMIT $2
    `, [cutoffDate, limit]);
  }
}
```

### 2. **Real API Integration**
Replace mock scraping with real APIs:

```javascript
// NewsAPI integration
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('your-api-key');

async scrapeSource(source, ticker) {
  const response = await newsapi.v2.everything({
    q: ticker,
    sources: source.id,
    language: 'en',
    sortBy: 'publishedAt'
  });
  
  return response.articles.map(article => ({
    title: article.title,
    source: article.source.name,
    url: article.url,
    publishDate: article.publishedAt,
    summary: article.description,
    // ... map other fields
  }));
}
```

### 3. **Rate Limiting**
Implement rate limiting to respect API quotas:

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/articles', apiLimiter);
```

### 4. **Caching Layer**
Add Redis for distributed caching:

```javascript
const redis = require('redis');
const client = redis.createClient();

async getArticlesWithCache(filters) {
  const cacheKey = JSON.stringify(filters);
  const cached = await client.get(cacheKey);
  
  if (cached) return JSON.parse(cached);
  
  const articles = await this.getArticles(filters);
  await client.setex(cacheKey, 300, JSON.stringify(articles)); // 5 min TTL
  
  return articles;
}
```

### 5. **Sentiment Analysis**
Integrate real sentiment analysis:

```javascript
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

calculateSentiment(text) {
  const result = sentiment.analyze(text);
  return result.comparative; // normalized score
}
```

## Maintenance

### Monitoring
```javascript
// Add monitoring endpoint
app.get('/api/articles/health', (req, res) => {
  const stats = articleCache.getCacheStats();
  const health = {
    status: stats.total >= 750 ? 'healthy' : 'degraded',
    stats,
    timestamp: Date.now()
  };
  res.json(health);
});
```

### Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'article-cache.log' })
  ]
});

// Log cache operations
logger.info('Cache refreshed', { 
  articlesAdded: newCount,
  totalArticles: this.articles.length,
  stats: this.getCacheStats()
});
```

## Testing

### Unit Tests
```javascript
const assert = require('assert');
const ArticleCache = require('./articleCache');

describe('ArticleCache', () => {
  it('should maintain minimum 750 articles', async () => {
    const cache = new ArticleCache();
    await cache.refreshCache();
    const stats = cache.getCacheStats();
    assert(stats.total >= 750);
  });
  
  it('should have 40%+ articles from last 3 days', async () => {
    const cache = new ArticleCache();
    await cache.refreshCache();
    const stats = cache.getCacheStats();
    assert(parseFloat(stats.last3DaysPercent) >= 40);
  });
});
```

## Cost Estimation

### API Costs (Monthly)
- NewsAPI Pro: $449/month (200,000 requests)
- Alpha Vantage Premium: $49.99/month (unlimited)
- Finnhub Premium: $59.99/month (unlimited)

**Total estimated:** ~$560/month for production-grade APIs

### Infrastructure
- AWS EC2 t3.medium: ~$30/month
- RDS PostgreSQL: ~$50/month
- Redis ElastiCache: ~$40/month

**Total infrastructure:** ~$120/month

## License

Internal use only. Do not distribute without permission.
