const cron = require('node-cron');
const articleCache = require('./articleCache');
const stockCache = require('./stockCache');
const CacheRefreshLog = require('./models/CacheRefreshLog');
const SchedulerLog = require('./models/SchedulerLog');

const MIDNIGHT_CST_CRON = '0 0 * * *';
const TIMEZONE = 'America/Chicago';

async function hasRunSince(date) {
  try {
    const count = await CacheRefreshLog.countDocuments({
      startTime: { $gte: date },
      status: { $in: ['completed', 'partial'] }
    });
    return count > 0;
  } catch (error) {
    console.error('Failed to check refresh log:', error.message);
    return false;
  }
}

async function startJobLog(jobName, options = {}) {
  const { trigger = 'cron', cronExpression, metadata = {} } = options;
  const context = {
    jobName,
    trigger,
    cron: cronExpression,
    metadata,
    startedAt: new Date(),
    id: null
  };

  try {
    const doc = await SchedulerLog.create({
      jobName,
      trigger,
      cron: cronExpression,
      status: 'running',
      startedAt: context.startedAt,
      metadata
    });
    context.id = doc._id;
  } catch (error) {
    console.warn('Failed to create scheduler log entry:', error.message);
  }

  return context;
}

async function finalizeJobLog(context, status, result = null, error = null) {
  if (!context) return;

  const completedAt = new Date();
  const durationMs = context.startedAt ? completedAt - context.startedAt : undefined;
  const update = {
    status,
    completedAt,
    durationMs,
    result
  };

  if (context.metadata && Object.keys(context.metadata).length > 0) {
    update.metadata = context.metadata;
  }

  if (error) {
    update.error = {
      message: error.message,
      stack: error.stack
    };
  }

  try {
    if (context.id) {
      await SchedulerLog.findByIdAndUpdate(context.id, { $set: update });
    } else {
      await SchedulerLog.create({
        jobName: context.jobName,
        trigger: context.trigger,
        cron: context.cron,
        status,
        startedAt: context.startedAt || new Date(),
        completedAt,
        durationMs,
        metadata: context.metadata,
        result,
        error: update.error
      });
    }
  } catch (logError) {
    console.warn('Failed to finalize scheduler log entry:', logError.message);
  }
}

class ArticleScheduler {
  constructor() {
    this.tasks = [];
  }

  /**
   * Start scheduled article refresh
   * Default: Every 6 hours
   */
  startScheduledRefresh(cronExpression = '0 */6 * * *') {
    console.log(`📅 Scheduling article refresh: ${cronExpression}`);
    
    const task = cron.schedule(cronExpression, async () => {
      console.log('\n⏰ Scheduled article refresh triggered');
      const logContext = await startJobLog('articles.refresh.scheduled', {
        cronExpression,
        metadata: { runType: 'scheduled' }
      });
      const startedAt = Date.now();
      try {
        const stats = await articleCache.refreshCache('scheduled');
        console.log('✅ Scheduled refresh completed:', {
          articlesAdded: stats.articlesAdded,
          duplicatesSkipped: stats.duplicatesSkipped,
          sources: stats.sourceBreakdown?.length || 0
        });
        await finalizeJobLog(logContext, 'completed', {
          durationMs: Date.now() - startedAt,
          articlesAdded: stats.articlesAdded,
          duplicatesSkipped: stats.duplicatesSkipped,
          sourcesTracked: stats.sourceBreakdown?.length || 0
        });
      } catch (error) {
        console.error('❌ Scheduled refresh failed:', error.message);
        await finalizeJobLog(logContext, 'failed', {
          durationMs: Date.now() - startedAt
        }, error);
      }
    });

    this.tasks.push(task);
    console.log('✅ Article refresh scheduled successfully');
    
    // Log next scheduled run
    console.log('⏭️  Next refresh at:', this.getNextRunTime(cronExpression));
  }

  /**
   * Start midnight scraper run (runs all scrapers daily at midnight)
   * Default: Daily at 00:00 (midnight)
   */
  startMidnightScraper(cronExpression = '0 0 * * *') {
    console.log(`📅 Scheduling midnight scraper: ${cronExpression}`);
    
    const task = cron.schedule(cronExpression, async () => {
      console.log('\n🌙 Midnight scraper task triggered');
      console.log(`⏰ Time: ${new Date().toLocaleString('en-US', { timeZone: TIMEZONE })}`);

      const logContext = await startJobLog('articles.refresh.midnight', {
        cronExpression,
        metadata: { runType: 'midnight-scheduled' }
      });

      const cutoff = new Date();
      cutoff.setHours(0, 0, 0, 0);
      const alreadyRan = await hasRunSince(cutoff);

      if (alreadyRan) {
        console.log('⏭️  Skipping midnight run: cache already refreshed today');
        await finalizeJobLog(logContext, 'skipped', {
          reason: 'Cache refreshed earlier today'
        });
        return;
      }

      const startedAt = Date.now();
      try {
        const stats = await articleCache.refreshCache('midnight-scheduled');
        console.log('✅ Midnight scraper completed:', {
          articlesAdded: stats.articlesAdded,
          duplicatesSkipped: stats.duplicatesSkipped,
          sources: stats.sourceBreakdown?.length || 0,
          duration: `${stats.duration}s`
        });
        await finalizeJobLog(logContext, 'completed', {
          durationMs: Date.now() - startedAt,
          articlesAdded: stats.articlesAdded,
          duplicatesSkipped: stats.duplicatesSkipped,
          sourcesTracked: stats.sourceBreakdown?.length || 0,
          reportedDuration: stats.duration
        });
      } catch (error) {
        console.error('❌ Midnight scraper failed:', error.message);
        await finalizeJobLog(logContext, 'failed', {
          durationMs: Date.now() - startedAt
        }, error);
      }
    }, {
      timezone: TIMEZONE
    });

    this.tasks.push(task);
    console.log('✅ Midnight scraper scheduled successfully');
    console.log('🌙 Scrapers will run automatically every day at midnight');
  }

  /**
   * Start scheduled stock cache refresh
   * Default: Every 6 hours (offset by 3 hours from articles)
   */
  startStockCacheRefresh(cronExpression = '0 3,9,15,21 * * *') {
    console.log(`📅 Scheduling stock cache refresh: ${cronExpression}`);
    
    const task = cron.schedule(cronExpression, async () => {
      console.log('\n⏰ Scheduled stock cache refresh triggered');
      const logContext = await startJobLog('stocks.cache.refresh', {
        cronExpression,
        metadata: { runType: 'scheduled-cache' }
      });
      const startedAt = Date.now();
      try {
        const result = await stockCache.refreshAll(50);
        console.log('✅ Stock cache refresh completed:', {
          success: result.successCount,
          failed: result.errorCount,
          duration: `${result.duration}s`
        });
        await finalizeJobLog(logContext, 'completed', {
          durationMs: Date.now() - startedAt,
          successCount: result.successCount,
          errorCount: result.errorCount,
          cacheSize: result.cacheSize
        });
      } catch (error) {
        console.error('❌ Stock cache refresh failed:', error.message);
        await finalizeJobLog(logContext, 'failed', {
          durationMs: Date.now() - startedAt
        }, error);
      }
    }, {
      timezone: TIMEZONE
    });

    this.tasks.push(task);
    console.log('✅ Stock cache refresh scheduled successfully');
  }

  /**
   * Start frequent intraday stock updates (every 5 minutes by default)
   */
  startIntradayStockUpdates(cronExpression = '*/5 * * * *') {
    console.log(`📅 Scheduling intraday stock updates: ${cronExpression}`);

    const task = cron.schedule(cronExpression, async () => {
      console.log('\n📈 Intraday stock update triggered');
      const logContext = await startJobLog('stocks.quote.intraday', {
        cronExpression,
        metadata: { frequency: 'intraday' }
      });
      const startedAt = Date.now();
      try {
        const result = await stockCache.refreshIntraday();
        console.log('✅ Intraday refresh completed:', {
          success: result.successCount,
          failed: result.errorCount,
          duration: `${result.duration}s`
        });
        await finalizeJobLog(logContext, 'completed', {
          durationMs: Date.now() - startedAt,
          successCount: result.successCount,
          errorCount: result.errorCount,
          cacheSize: result.cacheSize
        });
      } catch (error) {
        console.error('❌ Intraday refresh failed:', error.message);
        await finalizeJobLog(logContext, 'failed', {
          durationMs: Date.now() - startedAt
        }, error);
      }
    }, {
      timezone: TIMEZONE
    });

    this.tasks.push(task);
    console.log('✅ Intraday stock updates scheduled successfully');
  }

  /**
   * Start historical stock quote backfill (default: daily 1:30 AM CST)
   */
  startHistoricalBackfill(cronExpression = '30 1 * * *') {
    console.log(`📅 Scheduling historical stock backfill: ${cronExpression}`);

    const task = cron.schedule(cronExpression, async () => {
      console.log('\nHistorical backfill task triggered');
      const logContext = await startJobLog('stocks.quote.historical', {
        cronExpression,
        metadata: { frequency: 'daily-backfill' }
      });
      const startedAt = Date.now();
      try {
        const result = await stockCache.backfillHistoricalQuotes();
        if (result.running) {
          console.log('⏭️  Historical backfill skipped: job already running');
          await finalizeJobLog(logContext, 'skipped', {
            reason: 'Backfill already running',
            lastSummary: result.lastSummary || null
          });
          return;
        }
        console.log('✅ Historical backfill completed:', {
          tickers: result.tickersProcessed,
          inserted: result.inserted,
          matched: result.matched,
          failures: result.failures?.length || 0
        });
        await finalizeJobLog(logContext, 'completed', {
          durationMs: Date.now() - startedAt,
          tickersProcessed: result.tickersProcessed,
          inserted: result.inserted,
          matched: result.matched,
          failures: result.failures?.length || 0
        });
      } catch (error) {
        console.error('❌ Historical backfill failed:', error.message);
        await finalizeJobLog(logContext, 'failed', {
          durationMs: Date.now() - startedAt
        }, error);
      }
    }, {
      timezone: TIMEZONE
    });

    this.tasks.push(task);
    console.log('✅ Historical stock backfill scheduled successfully');
  }

  /**
   * Start daily cleanup task (remove articles older than 90 days)
   * Default: Daily at 2 AM
   */
  startDailyCleanup(cronExpression = '0 2 * * *') {
    console.log(`📅 Scheduling daily cleanup: ${cronExpression}`);
    
    const task = cron.schedule(cronExpression, async () => {
      console.log('\n🧹 Daily cleanup task triggered');
      const logContext = await startJobLog('articles.cleanup.daily', {
        cronExpression,
        metadata: { retentionDays: 90 }
      });
      const startedAt = Date.now();
      try {
        const Article = require('./models/Article');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);
        
        const result = await Article.deleteMany({
          publishDate: { $lt: cutoffDate }
        });
        
        console.log(`✅ Cleanup completed: ${result.deletedCount} old articles removed`);
        await finalizeJobLog(logContext, 'completed', {
          durationMs: Date.now() - startedAt,
          deletedCount: result.deletedCount,
          cutoffDate: cutoffDate.toISOString()
        });
      } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
        await finalizeJobLog(logContext, 'failed', {
          durationMs: Date.now() - startedAt
        }, error);
      }
    });

    this.tasks.push(task);
    console.log('✅ Daily cleanup scheduled successfully');
  }

  /**
   * Start self-ping to keep Render instance awake
   * Pings every 10 minutes to prevent spin-down on free tier
   */
  startSelfPing(appUrl) {
    if (!appUrl || appUrl.includes('localhost')) {
      console.log('⏭️  Skipping self-ping (running locally)');
      return;
    }

    console.log(`📅 Scheduling self-ping: */10 * * * * (every 10 minutes)`);
    
    const task = cron.schedule('*/10 * * * *', async () => {
      try {
        const fetch = (await import('node-fetch')).default;
        const pingUrl = `${appUrl}/health`;
        const response = await fetch(pingUrl, { 
          method: 'GET',
          timeout: 5000 
        });
        
        if (response.ok) {
          console.log(`🏓 Self-ping successful (${response.status})`);
        } else {
          console.warn(`⚠️  Self-ping returned ${response.status}`);
        }
      } catch (error) {
        console.warn('⚠️  Self-ping failed:', error.message);
      }
    });

    this.tasks.push(task);
    console.log('✅ Self-ping scheduled successfully');
    console.log('🌐 Keeping Render instance awake');
  }

  /**
   * Calculate next run time for a cron expression
   */
  getNextRunTime(cronExpression) {
    // Simple helper to show next run (approximate)
    const parts = cronExpression.split(' ');
    if (parts[1].includes('*/')) {
      const hours = parseInt(parts[1].replace('*/', ''));
      return `in ${hours} hours`;
    }
    return 'See cron expression for details';
  }

  /**
   * Stop all scheduled tasks
   */
  stopAll() {
    console.log('⏸️  Stopping all scheduled tasks');
    this.tasks.forEach(task => task.stop());
    this.tasks = [];
  }

  /**
   * Get status of all tasks
   */
  getStatus() {
    return {
      activeTasks: this.tasks.length,
      tasks: this.tasks.map((task, index) => ({
        id: index,
        running: task.running || false
      }))
    };
  }
}

// Export singleton instance
const scheduler = new ArticleScheduler();
module.exports = scheduler;
