const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  source: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  publishDate: {
    type: Date,
    required: true,
    index: true
  },
  summary: {
    type: String,
    required: true
  },
  fullText: {
    type: String
  },
  ticker: {
    type: String,
    index: true,
    sparse: true
  },
  politician: {
    type: String,
    index: true,
    sparse: true
  },
  category: {
    type: String,
    enum: ['market', 'stock', 'politician', 'general'],
    default: 'general',
    index: true
  },
  sentiment: {
    type: Number,
    min: -1,
    max: 1,
    default: 0
  },
  relevanceScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  tags: [{
    type: String
  }],
  imageUrl: {
    type: String
  },
  author: {
    type: String
  },
  scrapedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  accessCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  // For deduplication
  contentHash: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
articleSchema.index({ category: 1, publishDate: -1 });
articleSchema.index({ ticker: 1, publishDate: -1 });
articleSchema.index({ politician: 1, publishDate: -1 });
articleSchema.index({ source: 1, publishDate: -1 });
articleSchema.index({ isActive: 1, publishDate: -1 });
articleSchema.index({ relevanceScore: -1, publishDate: -1 });

// Calculate article age in days
articleSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diff = now - this.publishDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Check if article is outdated (older than 90 days)
articleSchema.virtual('isOutdated').get(function() {
  return this.ageInDays > 90;
});

// Check if article is recent (within last 3 days)
articleSchema.virtual('isRecent').get(function() {
  return this.ageInDays <= 3;
});

// Check if article is within last week
articleSchema.virtual('isWithinWeek').get(function() {
  return this.ageInDays <= 7;
});

// Update last accessed timestamp
articleSchema.methods.recordAccess = function() {
  this.lastAccessedAt = new Date();
  this.accessCount += 1;
  return this.save();
};

// Static method to get distribution stats
articleSchema.statics.getDistributionStats = async function(filter = {}) {
  const now = new Date();
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const baseFilter = { isActive: true, ...filter };

  const [total, last3Days, lastWeek] = await Promise.all([
    this.countDocuments(baseFilter),
    this.countDocuments({ ...baseFilter, publishDate: { $gte: threeDaysAgo } }),
    this.countDocuments({ ...baseFilter, publishDate: { $gte: sevenDaysAgo } })
  ]);

  const oldest = await this.findOne(baseFilter).sort({ publishDate: 1 }).select('publishDate');

  return {
    total,
    last3Days,
    lastWeek,
    last3DaysPercent: total > 0 ? (last3Days / total * 100).toFixed(1) : 0,
    lastWeekPercent: total > 0 ? (lastWeek / total * 100).toFixed(1) : 0,
    oldestArticle: oldest ? oldest.publishDate : null
  };
};

// Static method to clean outdated articles
articleSchema.statics.cleanOutdatedArticles = async function(keepMinimum = 750) {
  const now = new Date();
  const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  // Count current articles
  const totalArticles = await this.countDocuments({ isActive: true });
  const recentArticles = await this.countDocuments({ 
    isActive: true, 
    publishDate: { $gte: sevenDaysAgo } 
  });

  // Don't delete if we're below minimum or if it would break the 75% week requirement
  if (totalArticles <= keepMinimum) {
    console.log('⏸️ Skipping cleanup: At minimum article count');
    return { deleted: 0, reason: 'minimum_not_met' };
  }

  // Calculate how many we can safely delete
  const targetWeekPercent = 0.75;
  const maxDeletable = totalArticles - keepMinimum;
  const minWeekArticles = Math.ceil(keepMinimum * targetWeekPercent);

  if (recentArticles <= minWeekArticles) {
    console.log('⏸️ Skipping cleanup: Would break week percentage requirement');
    return { deleted: 0, reason: 'week_requirement_not_met' };
  }

  // Find articles older than 90 days, prioritizing low relevance and access
  const articlesToDelete = await this.find({
    isActive: true,
    publishDate: { $lt: ninetyDaysAgo }
  })
  .sort({ relevanceScore: 1, accessCount: 1, publishDate: 1 })
  .limit(Math.min(maxDeletable, 100)); // Delete max 100 at a time

  // Soft delete (mark as inactive rather than removing)
  const deleteIds = articlesToDelete.map(a => a._id);
  const result = await this.updateMany(
    { _id: { $in: deleteIds } },
    { $set: { isActive: false } }
  );

  console.log(`🗑️ Cleaned ${result.modifiedCount} outdated articles`);
  return { deleted: result.modifiedCount, reason: 'success' };
};

// Static method to prune excess articles while maintaining distribution
articleSchema.statics.pruneToDistribution = async function(targetTotal = 750, target3DayPercent = 40, targetWeekPercent = 75) {
  const stats = await this.getDistributionStats();
  
  if (stats.total <= targetTotal) {
    return { pruned: 0, reason: 'below_target' };
  }

  const now = new Date();
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  // Calculate target counts
  const target3DayCount = Math.ceil(targetTotal * (target3DayPercent / 100));
  const targetWeekCount = Math.ceil(targetTotal * (targetWeekPercent / 100));
  const targetOlderCount = targetTotal - targetWeekCount;

  // Get articles by time period
  const recent3Days = await this.find({
    isActive: true,
    publishDate: { $gte: threeDaysAgo }
  }).sort({ relevanceScore: -1, publishDate: -1 });

  const days3to7 = await this.find({
    isActive: true,
    publishDate: { $gte: sevenDaysAgo, $lt: threeDaysAgo }
  }).sort({ relevanceScore: -1, publishDate: -1 });

  const older = await this.find({
    isActive: true,
    publishDate: { $lt: sevenDaysAgo }
  }).sort({ relevanceScore: -1, publishDate: -1 });

  // Keep top articles from each period
  const keep3Day = recent3Days.slice(0, target3DayCount).map(a => a._id);
  const keepWeek = days3to7.slice(0, targetWeekCount - target3DayCount).map(a => a._id);
  const keepOlder = older.slice(0, targetOlderCount).map(a => a._id);

  const keepIds = [...keep3Day, ...keepWeek, ...keepOlder];

  // Soft delete everything else
  const result = await this.updateMany(
    { isActive: true, _id: { $nin: keepIds } },
    { $set: { isActive: false } }
  );

  console.log(`✂️ Pruned ${result.modifiedCount} articles to maintain distribution`);
  return { pruned: result.modifiedCount, reason: 'success' };
};

articleSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Article', articleSchema);
