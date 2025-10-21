const connectDB = require('./config/database');
const articleCache = require('./articleCache');
const Article = require('./models/Article');

async function runAllScrapers() {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Database connected. Starting all API scrapers...\n');

    let totalInserted = 0;
    let totalDuplicates = 0;

    // NewsAPI scraper
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🌐 [1/6] Fetching articles via NewsAPI.org...');
    console.log('═══════════════════════════════════════════════════════════');
    try {
      let existingDocs = await Article.find({ isActive: true }).select('url -_id').lean();
      let existingUrls = new Set(existingDocs.map(doc => doc.url));
      console.log(`📋 Current database count: ${existingUrls.size} articles`);
      
      const newsApiResult = await articleCache.fetchNewsApiArticles(existingUrls);
      console.log(`   ✅ NewsAPI: ${newsApiResult.articles.length} articles fetched`);
      
      const newsApiInsert = await articleCache.insertArticles(newsApiResult.articles);
      console.log(`💾 Database: ${newsApiInsert.inserted} inserted, ${newsApiInsert.duplicates} duplicates\n`);
      totalInserted += newsApiInsert.inserted;
      totalDuplicates += newsApiInsert.duplicates;
    } catch (error) {
      console.error(`❌ NewsAPI failed: ${error.message}\n`);
    }

    // TheNewsAPI scraper
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📰 [2/6] Fetching articles via TheNewsAPI...');
    console.log('═══════════════════════════════════════════════════════════');
    try {
      let existingDocs = await Article.find({ isActive: true }).select('url -_id').lean();
      let existingUrls = new Set(existingDocs.map(doc => doc.url));
      console.log(`📋 Current database count: ${existingUrls.size} articles`);
      
      const theNewsApiResult = await articleCache.fetchTheNewsApiArticles(existingUrls);
      console.log(`   ✅ TheNewsAPI: ${theNewsApiResult.articles.length} articles fetched`);
      
      const theNewsApiInsert = await articleCache.insertArticles(theNewsApiResult.articles);
      console.log(`💾 Database: ${theNewsApiInsert.inserted} inserted, ${theNewsApiInsert.duplicates} duplicates\n`);
      totalInserted += theNewsApiInsert.inserted;
      totalDuplicates += theNewsApiInsert.duplicates;
    } catch (error) {
      console.error(`❌ TheNewsAPI failed: ${error.message}\n`);
    }

    // Currents API scraper
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🌎 [3/6] Fetching articles via Currents API...');
    console.log('═══════════════════════════════════════════════════════════');
    try {
      let existingDocs = await Article.find({ isActive: true }).select('url -_id').lean();
      let existingUrls = new Set(existingDocs.map(doc => doc.url));
      console.log(`📋 Current database count: ${existingUrls.size} articles`);
      
      const currentsResult = await articleCache.fetchCurrentsApiArticles(existingUrls);
      console.log(`   ✅ Currents API: ${currentsResult.articles.length} articles fetched`);
      
      const currentsInsert = await articleCache.insertArticles(currentsResult.articles);
      console.log(`💾 Database: ${currentsInsert.inserted} inserted, ${currentsInsert.duplicates} duplicates\n`);
      totalInserted += currentsInsert.inserted;
      totalDuplicates += currentsInsert.duplicates;
    } catch (error) {
      console.error(`❌ Currents API failed: ${error.message}\n`);
    }

    // Guardian API scraper
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🗞️ [4/6] Fetching articles via The Guardian Open Platform...');
    console.log('═══════════════════════════════════════════════════════════');
    try {
      let existingDocs = await Article.find({ isActive: true }).select('url -_id').lean();
      let existingUrls = new Set(existingDocs.map(doc => doc.url));
      console.log(`📋 Current database count: ${existingUrls.size} articles`);
      
      const guardianResult = await articleCache.fetchGuardianArticles(existingUrls);
      console.log(`   ✅ Guardian API: ${guardianResult.articles.length} articles fetched`);
      
      const guardianInsert = await articleCache.insertArticles(guardianResult.articles);
      console.log(`💾 Database: ${guardianInsert.inserted} inserted, ${guardianInsert.duplicates} duplicates\n`);
      totalInserted += guardianInsert.inserted;
      totalDuplicates += guardianInsert.duplicates;
    } catch (error) {
      console.error(`❌ Guardian API failed: ${error.message}\n`);
    }

    // NewsData.io API scraper
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧾 [5/6] Fetching articles via NewsData.io...');
    console.log('═══════════════════════════════════════════════════════════');
    try {
      let existingDocs = await Article.find({ isActive: true }).select('url -_id').lean();
      let existingUrls = new Set(existingDocs.map(doc => doc.url));
      console.log(`📋 Current database count: ${existingUrls.size} articles`);
      
      const newsDataResult = await articleCache.fetchNewsDataArticles(existingUrls);
      console.log(`   ✅ NewsData.io: ${newsDataResult.articles.length} articles fetched`);
      
      const newsDataInsert = await articleCache.insertArticles(newsDataResult.articles);
      console.log(`💾 Database: ${newsDataInsert.inserted} inserted, ${newsDataInsert.duplicates} duplicates\n`);
      totalInserted += newsDataInsert.inserted;
      totalDuplicates += newsDataInsert.duplicates;
    } catch (error) {
      console.error(`❌ NewsData.io failed: ${error.message}\n`);
    }

    // NYTimes API scraper
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🗽 [6/6] Fetching articles via The New York Times API...');
    console.log('═══════════════════════════════════════════════════════════');
    try {
      let existingDocs = await Article.find({ isActive: true }).select('url -_id').lean();
      let existingUrls = new Set(existingDocs.map(doc => doc.url));
      console.log(`📋 Current database count: ${existingUrls.size} articles`);
      
      const nytimesResult = await articleCache.fetchNyTimesArticles(existingUrls);
      console.log(`   ✅ NYTimes API: ${nytimesResult.articles.length} articles fetched`);
      
      const nytimesInsert = await articleCache.insertArticles(nytimesResult.articles);
      console.log(`💾 Database: ${nytimesInsert.inserted} inserted, ${nytimesInsert.duplicates} duplicates\n`);
      totalInserted += nytimesInsert.inserted;
      totalDuplicates += nytimesInsert.duplicates;
    } catch (error) {
      console.error(`❌ NYTimes API failed: ${error.message}\n`);
    }

    // Final statistics
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 FINAL STATISTICS');
    console.log('═══════════════════════════════════════════════════════════');
    const finalStats = await Article.getDistributionStats();
    console.log(`   Total Articles in Database: ${finalStats.total || 0}`);
    console.log(`   Articles Inserted This Run: ${totalInserted}`);
    console.log(`   Duplicates Skipped: ${totalDuplicates}`);
    console.log(`   Last 3 Days: ${finalStats.last3Days || 0} (${finalStats.last3DaysPercent || 0}%)`);
    console.log(`   Last 7 Days: ${finalStats.lastWeek || 0} (${finalStats.lastWeekPercent || 0}%)`);

    // Get article counts by source
    const sources = await Article.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📰 Articles by Source:');
    sources.forEach(source => {
      console.log(`   ${source._id}: ${source.count} articles`);
    });

    console.log('\n✅ All scrapers completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Scraper process failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runAllScrapers();
