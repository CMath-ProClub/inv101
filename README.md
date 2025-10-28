# Investing 101 - Interactive Investment Education Platform

A comprehensive web application for learning investing concepts through interactive calculators, simulations, and real-time market data.

## 🌟 Features

### 📊 Real-Time Stock Data
- **1,615+ Stocks**: Coverage of S&P 500, Russell 1000, and mid-cap companies
- **S&P 500 Comparison**: Compare any stock against market benchmark
- **Performance Tracking**: Top performers, worst performers, sector analysis
- **Smart Search**: Search across all stocks by ticker or company name
- **Auto-Refresh**: Data updates every 6 hours automatically

### 📰 Financial News Aggregation
- **Multi-Source**: Aggregates from 5+ news APIs (NewsAPI, TheNewsAPI, Currents, Guardian, NewsData.io)
- **Intelligent Caching**: 750+ articles cached with smart refresh strategy
- **Ticker-Specific**: Get news for any stock symbol
- **Market Overview**: General market and economy news

### 🧮 Financial Calculators (25+)
- **Core**: ROI, Compound Interest, Risk/Reward, Volatility, Annualized Returns
- **Stocks**: P/E Ratio, Dividend Yield, Dividend Growth, Intrinsic Value
- **Asset Allocation**: Portfolio allocation, MPT optimizer
- **Retirement**: 401(k) calculator, retirement savings planner
- **Tax**: Capital gains, net profit after tax
- **Risk**: Kelly Criterion, Position sizing, Value at Risk (VaR)
- **Crypto**: Mining profitability, staking rewards

### 📚 Educational Content
- **Foundations**: Basic investing concepts and terminology
- **Financial Instruments**: Stocks, bonds, ETFs, options explained
- **Market Analysis**: Technical and fundamental analysis lessons
- **Practical Skills**: Portfolio management, risk management, trading strategies

### 🎮 Trading Simulator
- **AI Opponents**: Practice against Safe, Aggressive, or Balanced strategies
- **Customizable**: Set duration, difficulty level, and market conditions
- **Performance Tracking**: See how you stack up against AI

### 🏛️ Politician Portfolio Tracker
- Track congressional stock trades
- Monitor portfolio performance
- Analyze trading patterns

### 📈 Market Analysis Tools
- Stock comparison charts
- Sector performance analysis
- Market heatmaps
- Portfolio analysis

## 🛠️ Tech Stack

### Frontend
- **Framework**: Vanilla JavaScript (no dependencies)
- **Styling**: Responsive CSS with CSS Grid/Flexbox
- **Features**: Dark mode, mobile-responsive design
- **Visualizations**: Chart.js for interactive charts

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB (via Railway)
- **APIs**: Yahoo Finance, multiple news APIs
- **Scheduling**: node-cron for automated tasks
- **Caching**: In-memory caching with smart refresh

### Deployment
- **Backend & Database**: Railway (Node.js + MongoDB)
- **Frontend**: Vercel (static hosting)
- **CDN**: Vercel Edge Network

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm 9+
- MongoDB (or use Railway's hosted MongoDB)
- API keys (see Environment Variables below)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/CMath-ProClub/inv101.git
cd inv101
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env and add your API keys
```

4. **Start the backend server**
```bash
npm start
# Server runs on http://localhost:4000
```

5. **Open the frontend**
- Open `prototype/index.html` in your browser
- Or use a live server (VS Code Live Server extension recommended)

## 🔐 Environment Variables

Required API keys (add to `backend/.env`):

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/investing101

# News APIs (at least one required)
NEWSAPI_KEY=your_key_here
THENEWSAPI_TOKEN=your_token_here
CURRENTS_API_KEY=your_key_here
GUARDIAN_API_KEY=your_key_here
NEWSDATA_API_KEY=your_key_here
```

See `backend/.env.example` for all configuration options.

### Getting API Keys

- **NewsAPI**: https://newsapi.org/ (Free tier: 100 req/day)
- **TheNewsAPI**: https://www.thenewsapi.com/ (Free tier: 150 req/day)
- **Currents API**: https://currentsapi.services/ (Free tier: 600 req/day)
- **Guardian**: https://open-platform.theguardian.com/ (Free, requires registration)
- **NewsData.io**: https://newsdata.io/ (Free tier: 200 req/day)

## 🚀 Deployment

### Deploy to Railway (Backend + Database)

1. Create account at [Railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Add MongoDB service to project
4. Configure environment variables
5. Deploy

See `RAILWAY_SETUP_GUIDE.md` for detailed instructions.

### Deploy to Vercel (Frontend)

1. Create account at [Vercel.com](https://vercel.com)
2. Import project from GitHub
3. Set root directory to `prototype`
4. Deploy

Update `vercel.json` with your Railway backend URL after deployment.

## 📁 Project Structure

```
inv101/
├── backend/              # Express.js backend
│   ├── index.js         # Main server file
│   ├── articleCache.js  # News article caching
│   ├── stockCache.js    # Stock data caching (1,615 stocks)
│   ├── scheduler.js     # Automated refresh tasks
│   ├── simulate.js      # Trading simulator logic
│   ├── config/          # Database configuration
│   ├── models/          # MongoDB schemas
│   └── package.json     # Backend dependencies
├── prototype/           # Frontend application
│   ├── index.html       # Main landing page
│   ├── styles.css       # Global styles
│   ├── calculators.html # Calculator hub
│   ├── lessons.html     # Educational content
│   ├── simulator.html   # Trading simulator
│   ├── calc-*.html      # Individual calculators (25+)
│   └── lesson-*.html    # Individual lessons
├── design/              # Design documentation
├── vercel.json          # Vercel deployment config
└── README.md           # This file
```

## 🔌 API Endpoints

### Stock Data
```
GET  /api/stocks/cached/:ticker      # Get cached stock data
GET  /api/stocks/compare/:ticker     # Compare to S&P 500
GET  /api/stocks/top-performers      # Top 50 gainers
GET  /api/stocks/worst-performers    # Top 50 losers
GET  /api/stocks/search?q=query      # Search stocks
GET  /api/stocks/sector/:sector      # Get stocks by sector
GET  /api/stocks/cache-stats         # Cache statistics
POST /api/stocks/refresh-cache       # Manual refresh (rate-limited)
```

### News Articles
```
GET  /api/articles/market            # General market news
GET  /api/articles/ticker/:ticker    # Ticker-specific news
GET  /api/articles/stats             # Cache statistics
POST /api/articles/refresh           # Manual refresh
```

### Trading Simulator
```
POST /api/simulate                   # Run trading simulation
     Body: { opponent, durationDays, difficultyPct }
```

### Health Checks
```
GET  /health                         # Service health status
GET  /api/health                     # API health check
```

## 🧪 Testing

```bash
# Check database connection
node backend/check-database.js

# Test API endpoints
node backend/test-apis.js

# Initialize stock cache (takes 30-40 minutes)
npm run scrape-stocks

# Scrape news articles
npm run scrape
```

## 📊 Performance

- **Stock Cache**: 1,615 stocks cached in memory (~1.6 MB)
- **Article Cache**: 750+ articles (~2-3 MB)
- **Response Time**: < 50ms for cached data
- **Auto-Refresh**: Every 6 hours (stocks and articles)
- **Uptime**: Designed for 24/7 operation

## 🤝 Contributing

## 🔐 Auth, Refresh Tokens & Local Unit Tests

This project uses short-lived access tokens (stored in an HttpOnly cookie `inv101_token`) and rotating refresh tokens (stored in an HttpOnly cookie `inv101_refresh`). For local development you can run the following commands in PowerShell to install dependencies and run the unit tests we scaffolded.

PowerShell commands:

```powershell
cd backend
npm install
npm test
```

Notes:
- The test suite uses `mongodb-memory-server` to run fast unit tests for the `User` and `Portfolio` models without requiring an external MongoDB instance.
- The server exposes `/api/auth/logout` to clear tokens and `/api/auth/refresh` to rotate refresh tokens and re-issue a fresh access token.
- For cross-device persistence use a hosted MongoDB and set `MONGODB_URI` in `backend/.env`.

If you'd like I can add full integration tests that start the Express app and exercise the auth and portfolio endpoints end-to-end (this requires minor refactors to export the app instance from `backend/index.js`).

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see LICENSE file for details

## 🎯 Roadmap

- [ ] Real-time WebSocket updates for stock prices
- [ ] Historical data charts (1Y, 5Y, 10Y)
- [ ] Options trading calculator
- [ ] Cryptocurrency support
- [ ] Social features (share portfolios, compare performance)
- [ ] Mobile app (React Native)

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the documentation in the `/docs` folder
- Review the deployment guides

## 🙏 Acknowledgments

- Stock data powered by [Yahoo Finance API](https://github.com/gadicc/node-yahoo-finance2)
- News from multiple providers
- Built with ❤️ for education

---

**Live Demo**: [Coming Soon]  
**Documentation**: See individual markdown files in the repository  
**Version**: 1.0.0
