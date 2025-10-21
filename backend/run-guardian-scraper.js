const connectDB = require('./config/database');
const articleCache = require('./articleCache');
const Article = require('./models/Article');

async function runGuardianAPIScraper() {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Database connected. Starting Guardian API scraper...');

    // Get existing URLs to check for duplicates
    const existingDocs = await Article.find({ isActive: true }).select('url -_id').lean();
    const existingUrls = new Set(existingDocs.map(doc => doc.url));
    console.log(`📋 Found ${existingUrls.size} existing articles in database`);

    console.log('🗞️ [4/6] Fetching articles via The Guardian Open Platform...');
    const result = await articleCache.fetchGuardianArticles(existingUrls);
    console.log(`   ✅ Guardian API: ${result.articles.length} articles fetched`);

    const insertResult = await articleCache.insertArticles(result.articles);
    console.log(`💾 Database: ${insertResult.inserted} articles inserted, ${insertResult.duplicates} duplicates skipped`);

    console.log('✅ Guardian API scraper completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Guardian API scraper failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runGuardianAPIScraper();
