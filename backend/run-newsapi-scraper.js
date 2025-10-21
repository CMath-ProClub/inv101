const connectDB = require('./config/database');
const articleCache = require('./articleCache');
const Article = require('./models/Article');

async function runNewsAPIScraper() {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Database connected. Starting NewsAPI scraper...');

    // Get existing URLs to check for duplicates
    const existingDocs = await Article.find({ isActive: true }).select('url -_id').lean();
    const existingUrls = new Set(existingDocs.map(doc => doc.url));
    console.log(`📋 Found ${existingUrls.size} existing articles in database`);

    console.log('🌐 [1/6] Fetching articles via NewsAPI.org...');
    const result = await articleCache.fetchNewsApiArticles(existingUrls);
    console.log(`   ✅ NewsAPI: ${result.articles.length} articles fetched`);

    const insertResult = await articleCache.insertArticles(result.articles);
    console.log(`💾 Database: ${insertResult.inserted} articles inserted, ${insertResult.duplicates} duplicates skipped`);

    console.log('✅ NewsAPI scraper completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ NewsAPI scraper failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runNewsAPIScraper();