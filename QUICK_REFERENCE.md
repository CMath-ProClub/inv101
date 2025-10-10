# 📋 Article Cache Database - Quick Reference

## 🚀 Setup (One-Time)

```powershell
# Automated setup
.\setup-database.ps1

# OR Manual setup:
# 1. Install MongoDB: https://www.mongodb.com/try/download/community
# 2. Start MongoDB: net start MongoDB
# 3. Install dependencies: cd backend && npm install mongoose
# 4. Start server: npm start
```

## 🎯 Common Commands

### Start Server
```powershell
cd backend
npm start
```

### Check Database Status
```powershell
cd backend
node check-db-status.js
```

### MongoDB Shell
```powershell
mongosh
use investing101
db.articles.countDocuments({ isActive: true })
db.articles.find({ isActive: true }).sort({ publishDate: -1 }).limit(5)
```

### API Endpoints
```powershell
# Cache statistics
curl http://localhost:4000/api/articles/stats

# Market articles
curl "http://localhost:4000/api/articles/market?limit=10&daysOld=3"

# Stock articles
curl "http://localhost:4000/api/articles/stock/AAPL?limit=10"

# Politician articles
curl "http://localhost:4000/api/articles/politician/Nancy%20Pelosi"

# Refresh history
curl http://localhost:4000/api/articles/refresh-history

# Manual refresh
curl -X POST http://localhost:4000/api/articles/refresh
```

## 📊 Key Metrics

| Metric | Requirement | Current |
|--------|-------------|---------|
| Total Articles | ≥ 750 | Check with API |
| Last 3 Days | ≥ 40% | Check with API |
| Last Week | ≥ 75% | Check with API |
| Max Age | 90 days | Auto-cleanup |

## 🧹 Cleanup Rules

- **Runs**: During cache refresh (hourly or on-demand)
- **Removes**: Articles older than 90 days
- **Keeps**: Minimum 750 articles
- **Maintains**: 40% last 3 days, 75% last week
- **Prioritizes Deletion**:
  1. Oldest articles (>90 days)
  2. Lowest relevance scores
  3. Lowest access counts
- **Never Breaks**: Distribution requirements

## 🗄️ Database Collections

### `articles`
- Stores all scraped articles
- Soft delete with `isActive` field
- Indexed for fast queries

### `cacherefreshlogs`
- Tracks refresh operations
- Records timing, stats, errors
- Audit trail

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `backend/models/Article.js` | Article schema & methods |
| `backend/models/CacheRefreshLog.js` | Refresh log schema |
| `backend/config/database.js` | MongoDB connection |
| `backend/articleCache.js` | Cache logic & cleanup |
| `backend/index.js` | API endpoints |

## 🧪 Useful Queries

### Check Distribution
```javascript
db.articles.aggregate([
  { $match: { isActive: true } },
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      recent: {
        $sum: {
          $cond: [
            { $gte: ["$publishDate", new Date(Date.now() - 3*24*60*60*1000)] },
            1,
            0
          ]
        }
      }
    }
  }
])
```

### Find Outdated Articles
```javascript
db.articles.find({
  isActive: true,
  publishDate: { $lt: new Date(Date.now() - 90*24*60*60*1000) }
}).count()
```

### Most Popular Articles
```javascript
db.articles.find({ isActive: true })
  .sort({ accessCount: -1 })
  .limit(10)
```

### Articles by Source
```javascript
db.articles.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: "$source", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

## 🚨 Troubleshooting

### MongoDB Not Running?
```powershell
net start MongoDB
# OR
mongod --dbpath="C:\data\db"
```

### Connection Failed?
```powershell
# Test connection
mongosh "mongodb://localhost:27017/investing101"
```

### No Articles?
```powershell
# Trigger manual refresh
curl -X POST http://localhost:4000/api/articles/refresh
```

### Database Too Large?
```javascript
// In mongosh
use investing101
db.articles.deleteMany({ isActive: false })  // Remove soft-deleted
db.runCommand({ compact: 'articles' })        // Compact collection
```

## 📚 Documentation

- **Complete Setup**: `DATABASE_SETUP.md`
- **System Overview**: `ARTICLE_DATABASE_SUMMARY.md`
- **Quick Start**: `QUICKSTART.md`
- **API Docs**: `backend/ARTICLE_CACHE_README.md`

## 🎯 Next Steps

1. ✅ Database setup complete
2. ✅ Automatic cleanup working
3. 🔲 Integrate real APIs (NewsAPI, etc.)
4. 🔲 Add scheduled refreshes (node-cron)
5. 🔲 Deploy to production

---

**Need Help?** Run `node check-db-status.js` to see current state!
