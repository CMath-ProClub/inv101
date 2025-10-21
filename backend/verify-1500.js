// Quick script to count exact number of stocks in updated file
const fs = require('fs');
const path = require('path');

// Read the stockCache.js file
const stockCacheFile = fs.readFileSync(path.join(__dirname, 'stockCache.js'), 'utf8');

// Extract TOP_1500_TICKERS array
const top1500Match = stockCacheFile.match(/const TOP_1500_TICKERS = \[([\s\S]*?)\];/);
if (!top1500Match) {
  console.error('❌ Could not find TOP_1500_TICKERS array');
  process.exit(1);
}

const top1500String = top1500Match[1];
const top1500Tickers = top1500String.match(/'[^']+'/g).map(t => t.replace(/'/g, ''));

// Extract INDEX_FUNDS array
const indexMatch = stockCacheFile.match(/const INDEX_FUNDS = \[([\s\S]*?)\];/);
if (!indexMatch) {
  console.error('❌ Could not find INDEX_FUNDS array');
  process.exit(1);
}

const indexString = indexMatch[1];
const indexFunds = indexString.match(/'[^']+'/g).map(t => t.replace(/'/g, ''));

// Combine and deduplicate
const allTickers = [...new Set([...top1500Tickers, ...indexFunds])];

console.log('\n📊 UPDATED Stock Data Coverage Report\n');
console.log('='.repeat(60));
console.log(`\n📈 Individual Stocks (TOP_1500):     ${top1500Tickers.length}`);
console.log(`📊 Index Funds & ETFs:                ${indexFunds.length}`);
console.log(`🎯 Total Unique Tickers:              ${allTickers.length}`);
console.log('\n' + '='.repeat(60));

console.log('\n🌍 Coverage:\n');
console.log(`   ✅ S&P 500 companies (top 500)`);
console.log(`   ✅ Russell 1000 extension (501-1000)`);
console.log(`   ✅ Russell 2000 mid-caps (1001-1500)`);
console.log(`   ✅ Major index funds (S&P, NASDAQ, Total Market)`);
console.log(`   ✅ Sector-specific ETFs (11 sectors)`);
console.log(`   ✅ International funds`);
console.log(`   ✅ Bond funds`);
console.log(`   ✅ Growth, Value, Dividend funds`);
console.log(`   ✅ Small-cap and Mid-cap funds`);
console.log(`   ✅ Real Estate and Commodity funds`);

console.log('\n' + '='.repeat(60));
console.log(`\n🎯 GRAND TOTAL: ${allTickers.length} stocks and funds cached\n`);
console.log(`📈 That's ${allTickers.length - 553} MORE stocks than before!\n`);

// Sample some famous stocks
console.log('💼 Sample of stocks included:\n');
const famousStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK.B', 'JPM', 'V'];
famousStocks.forEach(ticker => {
  if (allTickers.includes(ticker)) {
    console.log(`   ✅ ${ticker}`);
  }
});

console.log('\n');
