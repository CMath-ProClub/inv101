# 🚀 Pre-Deployment Checklist for Railway & Vercel

## Critical Changes Before Deployment

### 1. ⚠️ SECURITY: Remove API Keys from .env
Your `.env` file currently has **exposed API keys**! These should NOT be committed to Git.

**Current exposed keys:**
```
THENEWSAPI_TOKEN=Pebo5INe3IlZjcCUITVLc8AX4gEUUv266aH6sdCT
CURRENTS_API_KEY=H2haKxvNiv0L27DzvAZ_GH9ekf2hG2dZdzAsA00VQLIs-Rsi
GUARDIAN_API_KEY=a5bc2f17-5b2c-452e-a574-0cc21a8e58cb
NEWSDATA_API_KEY=pub_f5e1a3c85b3b42009b4af840031ac238
```

**ACTION REQUIRED:**
1. Verify `.env` is in `.gitignore` ✅ (already there)
2. Check if `.env` was already committed to Git
3. If yes, you should rotate these API keys (get new ones)
4. Add these keys to Railway environment variables instead

---

### 2. 📝 Update README.md
Current README is minimal. Should explain the project properly.

**Suggested README:**
```markdown
# Investing 101 - Interactive Investment Education Platform

A comprehensive web application for learning investing concepts through interactive calculators, simulations, and real-time market data.

## Features

- 📊 **Stock Data**: Real-time data for 1,615+ stocks (S&P 500, Russell 1000, mid-caps)
- 📰 **Financial News**: Aggregated news from 5+ sources with caching
- 🧮 **Calculators**: 25+ financial calculators (ROI, compound interest, risk analysis, etc.)
- 📚 **Educational Lessons**: Foundations, instruments, market analysis, practical skills
- 🎮 **Trading Simulator**: Practice trading against AI opponents
- 🏛️ **Politician Portfolio Tracker**: Track congress member stock trades
- 📈 **Market Analysis Tools**: Stock comparison, sector analysis, performance tracking

## Tech Stack

**Frontend:**
- Vanilla JavaScript (no framework)
- Responsive CSS with dark mode
- Chart.js for visualizations

**Backend:**
- Node.js + Express
- MongoDB (via Railway)
- Yahoo Finance API for stock data
- Multiple news APIs with caching
- Scheduled data refresh (node-cron)

## Deployment

- **Backend**: Railway (Node.js + MongoDB)
- **Frontend**: Vercel (static hosting)
- **Database**: MongoDB on Railway

## Environment Variables

See `backend/.env.example` for required API keys.

## Local Development

\`\`\`bash
# Install dependencies
cd backend
npm install

# Set up environment
cp .env.example .env
# Add your API keys to .env

# Start server
npm start
\`\`\`

Frontend: Open `prototype/index.html` in browser or serve with live server.

## License

MIT
```

---

### 3. 🗄️ Add MONGODB_URI to .env.example

**Current .env.example is missing:**
```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/investing101
```

---

### 4. 📦 Add .nvmrc or engines field

**Add to package.json** to specify Node version:
```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

Railway will use this to select the correct Node version.

---

### 5. 🔧 Add Production Environment Check

**In `backend/index.js`**, add environment detection:
```javascript
const isProduction = process.env.NODE_ENV === 'production';

// Log appropriate messages
if (isProduction) {
  console.log('🚀 Running in PRODUCTION mode');
} else {
  console.log('💻 Running in DEVELOPMENT mode');
}
```

---

### 6. 📊 Add Health Check Endpoint

**Add to `backend/index.js`:**
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    cacheSize: stockCache.cache.size,
    lastStockRefresh: stockCache.lastRefresh,
    articlesInCache: articleCache.cache.size
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    endpoints: [
      '/api/stocks/*',
      '/api/articles/*',
      '/api/simulate',
      '/api/politician-trades/*'
    ]
  });
});
```

---

### 7. 🛡️ Add Rate Limiting (Optional but Recommended)

**Install:**
```bash
npm install express-rate-limit
```

**Add to index.js:**
```javascript
const rateLimit = require('express-rate-limit');

// Rate limiter for stock cache refresh
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: { error: 'Too many refresh requests, please try again later' }
});

app.post('/api/stocks/refresh-cache', refreshLimiter, async (req, res) => {
  // ... existing code
});
```

---

### 8. 📝 Add Better Logging

**Install Winston (optional):**
```bash
npm install winston
```

Or keep console.log but add timestamps:
```javascript
// Add at top of index.js
const originalLog = console.log;
console.log = function(...args) {
  originalLog(new Date().toISOString(), ...args);
};
```

---

### 9. 🔄 Update package.json scripts

**Add these helpful scripts:**
```json
"scripts": {
  "start": "node index.js",
  "dev": "node index.js",
  "scrape": "node run-all-scrapers.js",
  "scrape-stocks": "node init-stock-cache.js",
  "check-db": "node check-database.js",
  "test-apis": "node test-apis.js",
  "postinstall": "echo 'Dependencies installed successfully'",
  "railway-start": "node index.js",
  "logs": "tail -f logs/*.log"
}
```

---

### 10. 🌐 Update vercel.json for Better Routing

**Current vercel.json should have:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "prototype/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://YOUR-RAILWAY-URL.up.railway.app/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/prototype/$1"
    }
  ]
}
```

You'll need to update `YOUR-RAILWAY-URL` after Railway deployment.

---

### 11. 📋 Create DEPLOYMENT.md Guide

Create a clear deployment guide with Railway + Vercel steps.

---

### 12. 🧹 Clean Up Unnecessary Files Before Commit

**Remove/don't commit:**
- `backend/node_modules/` ✅ (already in .gitignore)
- `backend/.env` ✅ (already in .gitignore)
- `backend/stockCache.backup.js` (backup file, not needed in repo)
- `backend/count-stocks.js` (helper script)
- `backend/update-to-1500.js` (helper script)
- `backend/generate-1500-tickers.js` (helper script)
- `backend/verify-1500.js` (keep this one - useful for verification)

---

### 13. 🎨 Add Proper Error Pages

**Create `prototype/404.html`:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found | Investing 101</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/" class="btn">Go Home</a>
  </div>
</body>
</html>
```

---

### 14. 🔐 Add CORS Configuration for Production

**Update CORS in index.js:**
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-domain.vercel.app', 'https://your-custom-domain.com']
    : '*',
  credentials: true
};

app.use(cors(corsOptions));
```

---

## Priority Order

### 🔴 CRITICAL (Do Before Commit)
1. ✅ Verify API keys are NOT in Git history
2. ✅ Add MONGODB_URI placeholder to .env.example
3. ✅ Update README.md
4. ✅ Remove helper scripts (count-stocks.js, update-to-1500.js, etc.)

### 🟡 HIGH PRIORITY (Do Before Deploy)
5. ✅ Add health check endpoints
6. ✅ Add engines to package.json
7. ✅ Update vercel.json with Railway URL
8. ✅ Test all API endpoints locally

### 🟢 NICE TO HAVE (Do Before Production)
9. ⏳ Add rate limiting
10. ⏳ Add better logging
11. ⏳ Add 404 page
12. ⏳ Configure CORS for production domains

---

## Quick Checklist

```bash
# 1. Check Git status
git status

# 2. Verify .env is NOT staged
git status | grep ".env"  # Should show nothing or "Untracked"

# 3. Remove helper scripts
rm backend/count-stocks.js
rm backend/update-to-1500.js
rm backend/generate-1500-tickers.js
rm backend/stockCache.backup.js

# 4. Add all changes
git add .

# 5. Commit
git commit -m "feat: expand stock cache to 1,615 tickers, prepare for deployment"

# 6. Push
git push origin main
```

---

## Railway Deployment Steps

1. Create Railway project
2. Add MongoDB service
3. Add Node.js service (deploy from GitHub)
4. Set environment variables (all API keys + MONGODB_URI)
5. Deploy
6. Get Railway URL
7. Test endpoints

## Vercel Deployment Steps

1. Import project from GitHub
2. Set framework to "Other"
3. Set root directory to `prototype`
4. Add environment variables (if needed)
5. Deploy
6. Update vercel.json with Railway URL
7. Redeploy

---

Would you like me to implement any of these changes right now?
