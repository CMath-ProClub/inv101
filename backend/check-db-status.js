// Quick Database Status Checker
// Run with: node check-db-status.js

const mongoose = require('mongoose');
const Article = require('./models/Article');
const CacheRefreshLog = require('./models/CacheRefreshLog');

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Checking database status...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/investing101', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB\n');

    // Get article distribution stats
    console.log('📊 Article Distribution:');
    console.log('─'.repeat(50));
    const stats = await Article.getDistributionStats();
    console.log(`Total Articles:      ${stats.total}`);
    console.log(`Last 3 Days:         ${stats.last3Days} (${stats.last3DaysPercent}%)`);
    console.log(`Last Week:           ${stats.lastWeek} (${stats.lastWeekPercent}%)`);
    console.log(`Oldest Article:      ${stats.oldestArticle ? new Date(stats.oldestArticle).toLocaleDateString() : 'N/A'}`);
    console.log('');

    // Check if distribution meets requirements
    const meetsRequirements = 
      stats.total >= 750 &&
      parseFloat(stats.last3DaysPercent) >= 40 &&
      parseFloat(stats.lastWeekPercent) >= 75;

    if (meetsRequirements) {
      console.log('✅ Distribution meets all requirements!');
    } else {
      console.log('⚠️  Distribution does NOT meet requirements:');
      if (stats.total < 750) console.log(`   - Need ${750 - stats.total} more articles`);
      if (parseFloat(stats.last3DaysPercent) < 40) console.log(`   - Need more recent articles (${40 - parseFloat(stats.last3DaysPercent)}% short)`);
      if (parseFloat(stats.lastWeekPercent) < 75) console.log(`   - Need more weekly articles (${75 - parseFloat(stats.lastWeekPercent)}% short)`);
    }
    console.log('');

    // Get article breakdown by category
    console.log('📂 Articles by Category:');
    console.log('─'.repeat(50));
    const categories = await Article.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    categories.forEach(cat => {
      console.log(`${cat._id || 'uncategorized'}:`.padEnd(15) + cat.count);
    });
    console.log('');

    // Get article breakdown by source
    console.log('📰 Top 10 Sources:');
    console.log('─'.repeat(50));
    const sources = await Article.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    sources.forEach(src => {
      console.log(`${src._id}:`.padEnd(30) + src.count);
    });
    console.log('');

    // Get most popular articles
    console.log('🔥 Most Popular Articles (by access count):');
    console.log('─'.repeat(50));
    const popular = await Article.find({ isActive: true })
      .sort({ accessCount: -1 })
      .limit(5)
      .select('title source accessCount publishDate');
    
    if (popular.length > 0) {
      popular.forEach((article, i) => {
        console.log(`${i + 1}. ${article.title.substring(0, 50)}...`);
        console.log(`   Source: ${article.source} | Views: ${article.accessCount} | Date: ${new Date(article.publishDate).toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('No articles with access tracking yet\n');
    }

    // Get recent refresh logs
    console.log('🔄 Recent Refresh History:');
    console.log('─'.repeat(50));
    const logs = await CacheRefreshLog.find()
      .sort({ startTime: -1 })
      .limit(5)
      .select('startTime duration status totalArticlesAdded totalArticlesFound articlesDeleted triggeredBy');
    
    if (logs.length > 0) {
      logs.forEach(log => {
        const status = log.status === 'completed' ? '✅' : 
                      log.status === 'failed' ? '❌' : 
                      log.status === 'partial' ? '⚠️' : '⏳';
        console.log(`${status} ${new Date(log.startTime).toLocaleString()}`);
        console.log(`   Duration: ${(log.duration / 1000).toFixed(2)}s | Found: ${log.totalArticlesFound} | Added: ${log.totalArticlesAdded} | Deleted: ${log.articlesDeleted || 0}`);
        console.log(`   Triggered by: ${log.triggeredBy}`);
        console.log('');
      });
    } else {
      console.log('No refresh logs yet. Run a cache refresh to populate.\n');
    }

    // Get refresh statistics (last 7 days)
    const refreshStats = await CacheRefreshLog.getRefreshStats(7);
    console.log('📈 Refresh Statistics (Last 7 Days):');
    console.log('─'.repeat(50));
    console.log(`Total Refreshes:           ${refreshStats.totalRefreshes}`);
    console.log(`Average Duration:          ${(refreshStats.averageDuration / 1000).toFixed(2)}s`);
    console.log(`Total Articles Added:      ${refreshStats.totalArticlesAdded}`);
    console.log(`Avg Articles Per Refresh:  ${refreshStats.averageArticlesPerRefresh}`);
    console.log(`Success Rate:              ${refreshStats.successRate}%`);
    console.log('');

    // Articles needing cleanup
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const outdated = await Article.countDocuments({
      isActive: true,
      publishDate: { $lt: ninetyDaysAgo }
    });

    if (outdated > 0) {
      console.log(`⚠️  ${outdated} articles are older than 90 days and may be cleaned on next refresh`);
    } else {
      console.log('✅ No articles older than 90 days');
    }
    console.log('');

    // Soft-deleted articles
    const softDeleted = await Article.countDocuments({ isActive: false });
    if (softDeleted > 0) {
      console.log(`🗑️  ${softDeleted} soft-deleted articles in database (not shown in queries)`);
      console.log('   To permanently delete: db.articles.deleteMany({ isActive: false })');
    }
    console.log('');

    console.log('✅ Database check complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nMake sure MongoDB is running:');
    console.error('  net start MongoDB');
    console.error('  OR');
    console.error('  mongod --dbpath="C:\\data\\db"');
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkDatabaseStatus();
