require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const articleCache = require('./articleCacheService');

/**
 * Script to manually trigger all news scrapers
 * This will fetch articles from all configured news APIs
 */
async function runAllScrapers() {
    console.log('🚀 Starting manual scraper execution...\n');
    
    try {
        // Connect to database
        console.log('📊 Connecting to MongoDB...');
        await connectDB();
        console.log('✅ Database connected\n');
        
        // Check which APIs are configured
        const configuredAPIs = [];
        if (articleCache.newsApiKey) configuredAPIs.push('NewsAPI.org');
        if (articleCache.theNewsApiToken) configuredAPIs.push('TheNewsAPI');
        if (articleCache.currentsApiKey) configuredAPIs.push('Currents API');
        if (articleCache.guardianApiKey) configuredAPIs.push('The Guardian');
        if (articleCache.newsDataApiKey) configuredAPIs.push('NewsData.io');
        if (articleCache.nytimesApiKey) configuredAPIs.push('NY Times API');
        
        console.log('📰 Configured News APIs:');
        if (configuredAPIs.length === 0) {
            console.log('   ⚠️  No APIs configured - will use mock data');
        } else {
            configuredAPIs.forEach(api => console.log(`   ✓ ${api}`));
        }
        console.log('');
        
        // Run the refresh
        console.log('🔄 Starting article refresh from all sources...\n');
        const result = await articleCache.refreshCache('manual');
        
        // Display results
        console.log('\n' + '='.repeat(60));
        console.log('📊 SCRAPER RESULTS');
        console.log('='.repeat(60));
        console.log(`✅ Articles Added: ${result.articlesAdded || 0}`);
        console.log(`⏭️  Duplicates Skipped: ${result.duplicatesSkipped || 0}`);
        console.log(`📦 Total in Database: ${result.totalInDb || 0}`);
        
        if (result.sourceBreakdown && result.sourceBreakdown.length > 0) {
            console.log('\n📋 Breakdown by Source:');
            result.sourceBreakdown.forEach(source => {
                console.log(`   ${source.source}: ${source.articlesAdded} added, ${source.duplicatesSkipped} duplicates`);
            });
        }
        
        if (result.distributionAfter) {
            console.log('\n📅 Article Distribution:');
            console.log(`   Last 3 days: ${result.distributionAfter.last3Days} (${result.distributionAfter.last3DaysPercent}%)`);
            console.log(`   Last week: ${result.distributionAfter.lastWeek} (${result.distributionAfter.lastWeekPercent}%)`);
        }
        
        console.log('\n✨ Scraping completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Error running scrapers:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    } finally {
        // Close database connection
        if (mongoose.connection.readyState === 1) {
            console.log('\n🔌 Closing database connection...');
            await mongoose.connection.close();
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    }
}

// Run the scrapers
runAllScrapers();
