const connectDB = require('./config/database');
const articleCache = require('./articleCache');

async function runScraper() {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected. Starting article scraper...');
    
    console.log('📡 Refreshing article cache from all available APIs...');
    const result = await articleCache.refreshCache('manual');
    
    console.log('✅ Scraper completed successfully!');
    console.log('📊 Stats:', result);
  } catch (error) {
    console.error('❌ Scraper failed:', error.message);
    process.exit(1);
  }
}

runScraper();