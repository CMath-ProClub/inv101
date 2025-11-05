const Article = require('../models/Article');
const StockQuote = require('../models/StockQuote');
const stockCache = require('../stockCache');
const stockMarketData = require('../stockMarketData');

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PERFORMANCE_LOOKBACKS = [1, 7, 30, 90];
const DEFAULT_ARTICLE_LOOKBACK_DAYS = parseInt(process.env.STOCK_RECOMMENDATION_ARTICLE_LOOKBACK_DAYS || '21', 10);
const DEFAULT_ARTICLE_LIMIT = parseInt(process.env.STOCK_RECOMMENDATION_ARTICLE_LIMIT || '24', 10);
const SENTIMENT_POSITIVE_THRESHOLD = 0.1;
const SENTIMENT_NEGATIVE_THRESHOLD = -0.1;

function normalizeSymbol(symbol) {
  if (!symbol || typeof symbol !== 'string') {
    return '';
  }
  return symbol.trim().toUpperCase();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getTickerUniverse() {
  const universe = Array.isArray(stockCache.ALL_TICKERS) ? stockCache.ALL_TICKERS : [];
  return universe.map(normalizeSymbol);
}

async function getHistoricalSnapshot(symbol, daysAgo) {
  const cutoff = new Date(Date.now() - daysAgo * DAY_MS);
  const doc = await StockQuote.findOne({
    symbol,
    fetchedAt: { $lte: cutoff }
  }).sort({ fetchedAt: -1 }).lean();

  if (!doc) {
    return null;
  }

  return {
    price: doc.price,
    change: doc.change,
    changePercent: doc.changePercent,
    fetchedAt: doc.fetchedAt,
    bucket: doc.bucket
  };
}

async function getHistoricalSnapshots(symbol, lookbacks = DEFAULT_PERFORMANCE_LOOKBACKS) {
  const tasks = lookbacks.map((days) => getHistoricalSnapshot(symbol, days));
  const results = await Promise.all(tasks);
  const map = {};
  lookbacks.forEach((days, idx) => {
    map[days] = results[idx];
  });
  return map;
}

async function fetchQuote(symbol, options = {}) {
  const { persistNewQuotes = false } = options;
  const quotes = await stockMarketData.fetchStockQuotes([symbol], {
    persistNewQuotes,
    useAtlasCache: true
  });
  return quotes[symbol] || null;
}

async function fetchArticles(symbol, options = {}) {
  const {
    lookbackDays = DEFAULT_ARTICLE_LOOKBACK_DAYS,
    limit = DEFAULT_ARTICLE_LIMIT
  } = options;

  const startDate = new Date(Date.now() - lookbackDays * DAY_MS);
  const regex = new RegExp(`\\b${escapeRegex(symbol)}\\b`, 'i');

  const articles = await Article.find({
    isActive: true,
    publishDate: { $gte: startDate },
    $or: [
      { ticker: symbol },
      { tags: `ticker:${symbol}` },
      { title: regex },
      { summary: regex }
    ]
  })
    .sort({ publishDate: -1 })
    .limit(limit)
    .lean();

  if (!articles.length) {
    return {
      articles: [],
      stats: {
        total: 0,
        averageSentiment: null,
        positive: 0,
        negative: 0,
        neutral: 0
      }
    };
  }

  let sentimentSum = 0;
  let positive = 0;
  let negative = 0;
  let neutral = 0;

  const summaries = articles.map((article) => {
    const sentiment = typeof article.sentiment === 'number' ? article.sentiment : 0;
    sentimentSum += sentiment;

    if (sentiment > SENTIMENT_POSITIVE_THRESHOLD) {
      positive += 1;
    } else if (sentiment < SENTIMENT_NEGATIVE_THRESHOLD) {
      negative += 1;
    } else {
      neutral += 1;
    }

    return {
      id: String(article._id),
      title: article.title,
      url: article.url,
      source: article.source,
      publishDate: article.publishDate,
      sentiment,
      relevanceScore: article.relevanceScore,
      summary: article.summary,
      tags: article.tags
    };
  });

  return {
    articles: summaries,
    stats: {
      total: summaries.length,
      averageSentiment: sentimentSum / summaries.length,
      positive,
      negative,
      neutral
    }
  };
}

function buildPerformanceMetrics(latestPrice, historyMap) {
  const metrics = {};

  function addMetric(key, historyEntry) {
    if (!historyEntry || !historyEntry.price || !latestPrice) {
      metrics[key] = null;
      return;
    }

    const change = latestPrice - historyEntry.price;
    const percent = historyEntry.price !== 0 ? (change / historyEntry.price) * 100 : null;

    metrics[key] = {
      priceThen: historyEntry.price,
      priceNow: latestPrice,
      change,
      percent,
      fetchedAt: historyEntry.fetchedAt
    };
  }

  addMetric('oneDay', historyMap[1]);
  addMetric('oneWeek', historyMap[7]);
  addMetric('oneMonth', historyMap[30]);
  addMetric('threeMonth', historyMap[90]);

  return metrics;
}

function evaluateRecommendation(symbol, quote, performance, newsStats) {
  let score = 0;
  const rationale = [];

  const priceNow = quote?.price;
  if (performance.oneDay?.percent != null) {
    if (performance.oneDay.percent > 1) {
      score += 1;
      rationale.push(`${symbol} gained ${performance.oneDay.percent.toFixed(2)}% over the last trading day.`);
    } else if (performance.oneDay.percent < -1) {
      score -= 1;
      rationale.push(`${symbol} declined ${performance.oneDay.percent.toFixed(2)}% over the last trading day.`);
    }
  }

  if (performance.oneWeek?.percent != null) {
    if (performance.oneWeek.percent > 3) {
      score += 1;
      rationale.push(`One-week momentum remains positive at ${performance.oneWeek.percent.toFixed(2)}%.`);
    } else if (performance.oneWeek.percent < -3) {
      score -= 1;
      rationale.push(`One-week momentum is negative at ${performance.oneWeek.percent.toFixed(2)}%.`);
    }
  }

  if (performance.oneMonth?.percent != null) {
    if (performance.oneMonth.percent > 6) {
      score += 1;
      rationale.push(`One-month trend is bullish with ${performance.oneMonth.percent.toFixed(2)}% gains.`);
    } else if (performance.oneMonth.percent < -6) {
      score -= 1;
      rationale.push(`One-month trend is bearish with ${performance.oneMonth.percent.toFixed(2)}% losses.`);
    }
  }

  if (typeof newsStats.averageSentiment === 'number') {
    if (newsStats.averageSentiment > SENTIMENT_POSITIVE_THRESHOLD) {
      score += 1;
      rationale.push(`Recent coverage shows a positive sentiment score of ${newsStats.averageSentiment.toFixed(2)}.`);
    } else if (newsStats.averageSentiment < SENTIMENT_NEGATIVE_THRESHOLD) {
      score -= 1;
      rationale.push(`Recent coverage has a negative sentiment score of ${newsStats.averageSentiment.toFixed(2)}.`);
    }
  }

  if (newsStats.total === 0) {
    rationale.push('Limited recent news coverage; sentiment impact is neutral.');
  }

  let rating = 'neutral';
  if (score >= 2) {
    rating = 'bullish';
  } else if (score <= -2) {
    rating = 'bearish';
  }

  return {
    rating,
    score,
    confidence: Math.min(Math.abs(score) / 4, 1),
    rationale,
    priceNow: priceNow || null
  };
}

async function buildStockInsight(symbol, options = {}) {
  const normalizedSymbol = normalizeSymbol(symbol);
  const universe = await getTickerUniverse();

  if (!universe.includes(normalizedSymbol)) {
    return {
      success: false,
      error: 'Unknown ticker symbol',
      symbol: normalizedSymbol
    };
  }

  const {
    lookbacks = DEFAULT_PERFORMANCE_LOOKBACKS,
    articleLookbackDays = DEFAULT_ARTICLE_LOOKBACK_DAYS,
    articleLimit = DEFAULT_ARTICLE_LIMIT,
    includeArticles = true,
    persistQuotes = false,
    skipRecommendation = false
  } = options;

  const [quote, historyMap, news] = await Promise.all([
    fetchQuote(normalizedSymbol, { persistNewQuotes: persistQuotes }),
    getHistoricalSnapshots(normalizedSymbol, lookbacks),
    fetchArticles(normalizedSymbol, { lookbackDays: articleLookbackDays, limit: articleLimit })
  ]);

  const latestPrice = quote?.price || historyMap[1]?.price || null;
  const performance = buildPerformanceMetrics(latestPrice, historyMap);

  const recommendation = skipRecommendation
    ? null
    : evaluateRecommendation(normalizedSymbol, quote, performance, news.stats);

  return {
    success: true,
    symbol: normalizedSymbol,
    name: quote?.name || normalizedSymbol,
    lastUpdated: new Date().toISOString(),
    marketOpen: stockCache.isMarketOpen(),
    quote,
    performance,
    news: {
      stats: news.stats,
      articles: includeArticles ? news.articles : undefined
    },
    recommendation
  };
}

async function buildStockRecommendations(options = {}) {
  const {
    limit = parseInt(process.env.STOCK_RECOMMENDATION_LIMIT || '10', 10),
    lookbackDays = parseInt(process.env.STOCK_RECOMMENDATION_LOOKBACK_DAYS || '14', 10)
  } = options;

  const candidates = new Set();
  const topPerformers = stockCache.getTopPerformers ? stockCache.getTopPerformers(50) : [];
  const worstPerformers = stockCache.getWorstPerformers ? stockCache.getWorstPerformers(50) : [];

  topPerformers.forEach((item) => {
    if (item?.ticker) {
      candidates.add(normalizeSymbol(item.ticker));
    }
  });
  worstPerformers.forEach((item) => {
    if (item?.ticker) {
      candidates.add(normalizeSymbol(item.ticker));
    }
  });

  if (candidates.size === 0) {
    const universe = await getTickerUniverse();
    universe.slice(0, limit * 3).forEach((symbol) => candidates.add(symbol));
  }

  const recommendations = [];
  for (const symbol of candidates) {
    const insight = await buildStockInsight(symbol, {
      articleLookbackDays: lookbackDays,
      articleLimit: DEFAULT_ARTICLE_LIMIT,
      includeArticles: false
    });

    if (insight?.success && insight.recommendation) {
      recommendations.push(insight);
    }

    if (recommendations.length >= limit * 2) {
      break;
    }
  }

  recommendations.sort((a, b) => {
    const scoreA = a.recommendation?.score || 0;
    const scoreB = b.recommendation?.score || 0;
    return scoreB - scoreA;
  });

  return recommendations.slice(0, limit);
}

module.exports = {
  getTickerUniverse,
  buildStockInsight,
  buildStockRecommendations
};
