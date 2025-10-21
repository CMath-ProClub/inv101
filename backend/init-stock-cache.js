/**
 * Stock Cache Initialization Script
 * Fetches and caches top 500 stocks + index funds
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const stockCache = require('./stockCache');

async function initializeStockCache() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║     Stock Data Cache Initialization                  ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  try {
    // Refresh all stock data
    const result = await stockCache.refreshAll(50); // 50 stocks per batch
    
    console.log('\n✅ Stock cache initialized successfully!\n');
    console.log('📊 Cache Statistics:');
    console.log(`   Total Stocks: ${result.cacheSize}`);
    console.log(`   Successful: ${result.successCount}`);
    console.log(`   Failed: ${result.errorCount}`);
    console.log(`   Duration: ${result.duration}s`);
    
    if (stockCache.sp500Data) {
      console.log(`\n📈 S&P 500 Benchmark:`);
      console.log(`   Price: $${stockCache.sp500Data.price?.toFixed(2)}`);
      console.log(`   Change: ${stockCache.sp500Data.changePercent > 0 ? '+' : ''}${stockCache.sp500Data.changePercent?.toFixed(2)}%`);
    }
    
    // Show top 10 performers
    console.log('\n🚀 Top 10 Performers:');
    const topPerformers = stockCache.getTopPerformers(10);
    topPerformers.forEach((stock, index) => {
      console.log(`   ${index + 1}. ${stock.ticker.padEnd(6)} ${stock.name.substring(0, 30).padEnd(32)} +${stock.changePercent?.toFixed(2)}%`);
    });
    
    // Show top 10 losers
    console.log('\n📉 Top 10 Losers:');
    const worstPerformers = stockCache.getWorstPerformers(10);
    worstPerformers.forEach((stock, index) => {
      console.log(`   ${index + 1}. ${stock.ticker.padEnd(6)} ${stock.name.substring(0, 30).padEnd(32)} ${stock.changePercent?.toFixed(2)}%`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Stock cache is ready for use!');
    console.log('🔄 Cache will auto-refresh every 6 hours');
    console.log('='.repeat(60) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to initialize stock cache:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the initialization
initializeStockCache();
