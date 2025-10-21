const mongoose = require('mongoose');

const cacheRefreshLogSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // in milliseconds
  },
  sourcesScraped: [{
    source: String,
    articlesFound: Number,
    articlesAdded: Number,
    duplicatesSkipped: Number,
    error: String,
    errorList: [String]
  }],
  totalArticlesFound: {
    type: Number,
    default: 0
  },
  totalArticlesAdded: {
    type: Number,
    default: 0
  },
  duplicatesSkipped: {
    type: Number,
    default: 0
  },
  articlesDeleted: {
    type: Number,
    default: 0
  },
  distributionBefore: {
    total: Number,
    last3Days: Number,
    lastWeek: Number,
    last3DaysPercent: Number,
    lastWeekPercent: Number
  },
  distributionAfter: {
    total: Number,
    last3Days: Number,
    lastWeek: Number,
    last3DaysPercent: Number,
    lastWeekPercent: Number
  },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed', 'partial'],
    default: 'running'
  },
  errorList: [{
    message: String,
    source: String,
    timestamp: Date
  }],
  triggeredBy: {
    type: String,
    enum: ['auto', 'manual', 'scheduled'],
    default: 'auto'
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Index for querying recent refresh logs
cacheRefreshLogSchema.index({ startTime: -1 });
cacheRefreshLogSchema.index({ status: 1, startTime: -1 });

// Static method to get recent refresh history
cacheRefreshLogSchema.statics.getRecentHistory = async function(limit = 10) {
  return this.find()
    .sort({ startTime: -1 })
    .limit(limit)
    .select('-__v');
};

// Static method to get refresh statistics
cacheRefreshLogSchema.statics.getRefreshStats = async function(days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const logs = await this.find({
    startTime: { $gte: since },
    status: 'completed'
  });

  if (logs.length === 0) {
    return {
      totalRefreshes: 0,
      averageDuration: 0,
      totalArticlesAdded: 0,
      averageArticlesPerRefresh: 0,
      successRate: 0
    };
  }

  const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
  const totalArticles = logs.reduce((sum, log) => sum + (log.totalArticlesAdded || 0), 0);

  return {
    totalRefreshes: logs.length,
    averageDuration: Math.round(totalDuration / logs.length),
    totalArticlesAdded: totalArticles,
    averageArticlesPerRefresh: Math.round(totalArticles / logs.length),
    successRate: 100
  };
};

module.exports = mongoose.model('CacheRefreshLog', cacheRefreshLogSchema);
