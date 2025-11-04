const express = require('express');
const Stock = require('../models/Stock');
const StockPrice = require('../models/StockPrice');
const User = require('../models/User');
const CacheRefreshLog = require('../models/CacheRefreshLog');
const Article = require('../models/Article');

const router = express.Router();

router.get('/overview', async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [trackedEquities, ingestionJobs, newMembers, recentArticles, priceUpdates] = await Promise.all([
      Stock.countDocuments({}),
      CacheRefreshLog.countDocuments({ startTime: { $gte: weekAgo } }),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      Article.countDocuments({ isActive: true, publishDate: { $gte: weekAgo } }),
      StockPrice.countDocuments({ createdAt: { $gte: dayAgo } })
    ]);

    res.json({
      success: true,
      generatedAt: now.toISOString(),
      metrics: {
        trackedEquities,
        ingestionJobsLast7d: ingestionJobs,
        newMembersLast7d: newMembers,
        articlesPublishedLast7d: recentArticles,
        priceUpdatesLast24h: priceUpdates
      }
    });
  } catch (error) {
    console.error('metrics_overview_error', error.message);
    res.status(500).json({
      success: false,
      error: 'Unable to compute overview metrics'
    });
  }
});

module.exports = router;
