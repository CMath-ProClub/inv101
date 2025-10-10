# MongoDB Article Cache Database Setup Guide

## 🗄️ Database Overview

Your article caching system now uses **MongoDB** to persist articles with automatic filtering of outdated content.

### Features
- ✅ **Persistent Storage** - Articles survive server restarts
- ✅ **Automatic Cleanup** - Articles older than 90 days are softly deleted
- ✅ **Smart Distribution** - Maintains 750+ articles with 40%/75% requirements
- ✅ **Deduplication** - Prevents duplicate articles by URL and content hash
- ✅ **Access Tracking** - Records when articles are viewed
- ✅ **Refresh Logging** - Tracks all cache refresh operations
- ✅ **Efficient Queries** - Optimized indexes for fast retrieval

## 📊 Database Schema

### Article Collection
```javascript
{
  title: String,              // Article headline
  source: String,             // News source (Bloomberg, Reuters, etc.)
  url: String (unique),       // Article URL
  publishDate: Date,          // When article was published
  summary: String,            // Brief description
  fullText: String,           // Full article text (optional)
  ticker: String,             // Stock ticker (e.g., "AAPL")
  politician: String,         // Politician name
  category: String,           // 'market', 'stock', 'politician', 'general'
  sentiment: Number,          // -1 to 1 (negative to positive)
  relevanceScore: Number,     // 0 to 1 (relevance quality)
  tags: [String],             // Additional tags
  imageUrl: String,           // Article image
  author: String,             // Article author
  scrapedAt: Date,            // When we scraped it
  lastAccessedAt: Date,       // Last time someone viewed it
  accessCount: Number,        // How many times viewed
  isActive: Boolean,          // True = active, False = deleted
  contentHash: String,        // For deduplication
  createdAt: Date,            // Auto-managed
  updatedAt: Date             // Auto-managed
}
```

### CacheRefreshLog Collection
```javascript
{
  startTime: Date,                   // When refresh started
  endTime: Date,                     // When refresh ended
  duration: Number,                  // Milliseconds
  sourcesScraped: [{                 // Results per source
    source: String,
    articlesFound: Number,
    articlesAdded: Number,
    errors: [String]
  }],
  totalArticlesFound: Number,        // Total scraped
  totalArticlesAdded: Number,        // Total inserted
  duplicatesSkipped: Number,         // Skipped duplicates
  articlesDeleted: Number,           // Pruned articles
  distributionBefore: {              // Stats before refresh
    total, last3Days, lastWeek, 
    last3DaysPercent, lastWeekPercent
  },
  distributionAfter: {               // Stats after refresh
    total, last3Days, lastWeek,
    last3DaysPercent, lastWeekPercent
  },
  status: String,                    // 'running', 'completed', 'failed', 'partial'
  errors: [{                         // Any errors encountered
    message: String,
    source: String,
    timestamp: Date
  }],
  triggeredBy: String                // 'auto', 'manual', 'scheduled'
}
```

## 🚀 Installation Steps

### 1. Install MongoDB

**Windows:**
```powershell
# Download MongoDB Community Server from:
# https://www.mongodb.com/try/download/community

# Or install with Chocolatey:
choco install mongodb

# Or with winget:
winget install MongoDB.Server
```

**After installation, start MongoDB:**
```powershell
# Start MongoDB service
net start MongoDB

# Or run mongod manually:
mongod --dbpath="C:\data\db"
```

### 2. Install Mongoose Dependency

```powershell
cd c:\Users\Carter Matherne\inv101\backend
npm install mongoose
```

### 3. Configure Connection (Optional)

By default, the system connects to `mongodb://localhost:27017/investing101`

To use a different database, create a `.env` file:

```powershell
# In backend folder, create .env file
@"
MONGODB_URI=mongodb://localhost:27017/investing101
PORT=4000
"@ | Out-File -FilePath .env -Encoding utf8
```

Then install dotenv:
```powershell
npm install dotenv
```

And add to `index.js` (top of file):
```javascript
require('dotenv').config();
```

### 4. Start the Server

```powershell
cd c:\Users\Carter Matherne\inv101\backend
npm start
```

You should see:
```
✅ MongoDB connected successfully
📊 Database: investing101
🌐 Host: localhost
🚀 Google Finance backend running on port 4000
📊 Article cache system initialized
🔥 Warming up article cache...
  📰 Scraping Bloomberg...
  📰 Scraping Reuters...
  ...
✅ Cache refresh complete:
   Total: 750 articles
   Last 3 days: 315 (42.0%)
   Last week: 570 (76.0%)
   Duration: 3.45s
```

## 🧪 Testing the Database

### Check MongoDB Connection
```powershell
# Open MongoDB shell
mongo

# Or with mongosh (newer versions)
mongosh

# List databases
show dbs

# Use investing101 database
use investing101

# Show collections
show collections

# Count articles
db.articles.countDocuments({ isActive: true })

# View recent articles
db.articles.find({ isActive: true }).sort({ publishDate: -1 }).limit(5).pretty()

# Check distribution
db.articles.aggregate([
  { $match: { isActive: true } },
  { $group: {
      _id: null,
      total: { $sum: 1 },
      avgRelevance: { $avg: "$relevanceScore" },
      avgSentiment: { $avg: "$sentiment" }
    }
  }
])
```

### Test API Endpoints
```powershell
# Get cache statistics
curl http://localhost:4000/api/articles/stats

# Get market articles
curl http://localhost:4000/api/articles/market?limit=10

# Get stock articles
curl "http://localhost:4000/api/articles/stock/AAPL?limit=10"

# Get refresh history
curl http://localhost:4000/api/articles/refresh-history

# Trigger manual refresh
curl -X POST http://localhost:4000/api/articles/refresh
```

## 🧹 Automatic Cleanup Process

### How Outdated Articles Are Filtered

1. **During Refresh** (every hour or when distribution falls below thresholds):
   - New articles are scraped from 15 sources
   - Duplicates are detected and skipped
   - Articles are inserted into database
   - Cleanup process runs

2. **Cleanup Rules**:
   - Articles older than **90 days** are marked `isActive: false` (soft delete)
   - Only runs if total articles > 750 (maintains minimum)
   - Prioritizes deleting low relevance + low access articles
   - Checks that 75% week requirement won't be broken
   - Deletes max 100 articles per cleanup to avoid spikes

3. **Distribution Pruning**:
   - After cleanup, checks if distribution is optimal
   - If total > 750, prunes excess articles
   - Keeps highest relevance articles from each time period:
     - 40%+ from last 3 days
     - 35%  from days 3-7
     - 25%  older than 7 days

4. **Access Tracking**:
   - Every time an article is fetched, `lastAccessedAt` is updated
   - `accessCount` is incremented
   - Rarely accessed articles are prioritized for deletion

### Manual Cleanup

You can manually trigger cleanup:

```javascript
// In backend code or MongoDB shell
const Article = require('./models/Article');

// Clean articles older than 90 days
await Article.cleanOutdatedArticles(750);

// Prune to exact distribution
await Article.pruneToDistribution(750, 40, 75);

// Get current stats
const stats = await Article.getDistributionStats();
console.log(stats);
```

## 📈 Monitoring

### View Refresh Logs
```javascript
// Get recent refresh history
const CacheRefreshLog = require('./models/CacheRefreshLog');
const logs = await CacheRefreshLog.getRecentHistory(10);

// Get refresh statistics (last 7 days)
const stats = await CacheRefreshLog.getRefreshStats(7);
```

### Query Examples

```javascript
// Find all articles about a specific stock from last 3 days
db.articles.find({
  ticker: "AAPL",
  isActive: true,
  publishDate: { $gte: new Date(Date.now() - 3*24*60*60*1000) }
}).sort({ publishDate: -1 })

// Find high-relevance market articles
db.articles.find({
  category: "market",
  isActive: true,
  relevanceScore: { $gte: 0.8 }
}).sort({ relevanceScore: -1, publishDate: -1 }).limit(20)

// Find most popular articles (by access count)
db.articles.find({ isActive: true })
  .sort({ accessCount: -1 })
  .limit(10)

// Find articles that are candidates for deletion
db.articles.find({
  isActive: true,
  publishDate: { $lt: new Date(Date.now() - 90*24*60*60*1000) },
  accessCount: { $lt: 5 }
}).sort({ relevanceScore: 1, publishDate: 1 })
```

## 🔧 Configuration

### Adjust Cleanup Thresholds

In `backend/articleCache.js`:

```javascript
class ArticleCache {
  constructor() {
    this.minArticles = 750;           // Minimum articles to maintain
    this.refreshInterval = 3600000;   // 1 hour (in milliseconds)
    this.cleanupInterval = 86400000;  // 24 hours (in milliseconds)
  }
}
```

In `backend/models/Article.js`:

```javascript
// Change age threshold for outdated articles
articleSchema.statics.cleanOutdatedArticles = async function(keepMinimum = 750) {
  const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000); // Change 90 to desired days
  // ...
}
```

### Database Indexes

The following indexes are automatically created for performance:

```javascript
// Single field indexes
{ publishDate: -1 }
{ source: 1 }
{ ticker: 1 }
{ politician: 1 }
{ isActive: 1 }
{ scrapedAt: -1 }
{ contentHash: 1 }
{ url: 1 }  // Unique

// Compound indexes
{ category: 1, publishDate: -1 }
{ ticker: 1, publishDate: -1 }
{ politician: 1, publishDate: -1 }
{ source: 1, publishDate: -1 }
{ isActive: 1, publishDate: -1 }
{ relevanceScore: -1, publishDate: -1 }
```

## 🐛 Troubleshooting

### MongoDB not connecting?
```powershell
# Check if MongoDB is running
Get-Service MongoDB

# Start if stopped
net start MongoDB

# Check connection string
mongo "mongodb://localhost:27017/investing101"
```

### Articles not being cleaned?
```javascript
// Check when last cleanup ran
console.log(articleCache.lastCleanup);

// Force cleanup
await articleCache.cleanupOutdatedArticles();

// Check cleanup logs
const logs = await CacheRefreshLog.find({ status: 'completed' })
  .sort({ startTime: -1 })
  .limit(10);
```

### Database growing too large?
```javascript
// Compact database
use investing101
db.runCommand({ compact: 'articles' })

// Permanently delete soft-deleted articles
db.articles.deleteMany({ isActive: false })

// Check database size
db.stats()
```

## 📚 Next Steps

1. ✅ Database is set up and working with mock data
2. 🔲 When ready for production, integrate real APIs:
   - NewsAPI ($449/month)
   - Alpha Vantage ($50/month)
   - Finnhub ($60/month)
3. 🔲 Set up scheduled refreshes with node-cron
4. 🔲 Add monitoring/alerts for cache health
5. 🔲 Deploy to production with MongoDB Atlas

## 🌐 MongoDB Atlas (Cloud Option)

For production, consider MongoDB Atlas (cloud-hosted):

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/investing101
   ```

---

**Your article database is now ready!** 🎉

The system will automatically maintain 750+ articles with proper distribution and gradually filter out outdated content while preserving important historical context.
