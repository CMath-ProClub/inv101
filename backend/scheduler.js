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
