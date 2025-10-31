// Automatically run API scrapers at midnight CST every day
const schedule = require('node-schedule');
const { exec } = require('child_process');

// CST is UTC-6 (or UTC-5 during daylight saving)
const midnightCST = '0 0 * * *'; // At 00:00 every day

schedule.scheduleJob({ rule: midnightCST, tz: 'America/Chicago' }, () => {
  console.log('⏰ Running API scrapers at midnight CST...');
  exec('node run-all-scrapers.js', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error('Scraper run failed:', error);
    } else {
      console.log('Scraper run output:', stdout);
      if (stderr) console.error('Scraper run errors:', stderr);
    }
  });
});
const cron = require('node-cron');
const articleCache = require('./articleCache');
const stockCache = require('./stockCache');

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
      try {
        const stats = await articleCache.refreshCache('scheduled');
        console.log('✅ Scheduled refresh completed:', {
          articlesAdded: stats.articlesAdded,
          duplicatesSkipped: stats.duplicatesSkipped,
          sources: stats.sourceBreakdown?.length || 0
        });
      } catch (error) {
        console.error('❌ Scheduled refresh failed:', error.message);
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
      console.log(`⏰ Time: ${new Date().toLocaleString()}`);
      try {
        const stats = await articleCache.refreshCache('midnight-scheduled');
        console.log('✅ Midnight scraper completed:', {
          articlesAdded: stats.articlesAdded,
          duplicatesSkipped: stats.duplicatesSkipped,
          sources: stats.sourceBreakdown?.length || 0,
          duration: `${stats.duration}s`
        });
      } catch (error) {
        console.error('❌ Midnight scraper failed:', error.message);
      }
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
      try {
        const result = await stockCache.refreshAll(50);
        console.log('✅ Stock cache refresh completed:', {
          success: result.successCount,
          failed: result.errorCount,
          duration: `${result.duration}s`
        });
      } catch (error) {
        console.error('❌ Stock cache refresh failed:', error.message);
      }
    });

    this.tasks.push(task);
    console.log('✅ Stock cache refresh scheduled successfully');
  }

  /**
   * Start daily cleanup task (remove articles older than 90 days)
   * Default: Daily at 2 AM
   */
  startDailyCleanup(cronExpression = '0 2 * * *') {
    console.log(`📅 Scheduling daily cleanup: ${cronExpression}`);
    
    const task = cron.schedule(cronExpression, async () => {
      console.log('\n🧹 Daily cleanup task triggered');
      try {
        const Article = require('./models/Article');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);
        
        const result = await Article.deleteMany({
          publishDate: { $lt: cutoffDate }
        });
        
        console.log(`✅ Cleanup completed: ${result.deletedCount} old articles removed`);
      } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
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
