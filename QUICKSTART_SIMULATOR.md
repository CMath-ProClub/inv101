# Quick Start Guide - Market Simulator

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account (or local MongoDB)
- Environment variables configured

### Installation

1. **Install Dependencies:**
```bash
cd backend
npm install
```

2. **Configure Environment Variables:**

Create a `.env` file in the `backend/` directory:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_secret_key_here

# Server Configuration
PORT=4000
NODE_ENV=development

# Pinger Service (Optional - for production)
APP_URL=https://your-app-name.onrender.com

# API Keys (Optional - for enhanced data)
POLYGON_API_KEY=your_polygon_key
ALPHA_VANTAGE_KEY=your_alpha_vantage_key
```

3. **Start the Server:**
```bash
npm start
```

You should see:
```
🚀 Yahoo Finance backend running on port 4000
✅ MongoDB connected successfully
✅ Server ready for requests
```

If `APP_URL` is set, you'll also see:
```
🔄 Pinger service initialized for https://your-app-name.onrender.com
⏱️  Pinging every 10 minutes to keep server alive
```

4. **Access the Application:**

Open your browser and navigate to:
- Main App: `http://localhost:4000`
- Trading Simulator: `http://localhost:4000/market-simulator.html`
- Leaderboard: `http://localhost:4000/leaderboard.html`

---

## 📱 Features Overview

### 🎯 Market Simulator
**URL:** `/market-simulator.html`

**Features:**
- Real-time stock quotes via Yahoo Finance
- Buy/sell stocks with virtual $100,000
- Portfolio tracking with P&L calculations
- Multi-line charts showing:
  - Portfolio performance over time
  - Comparison with S&P 500 benchmark
- Position management with average cost tracking
- Real-time portfolio value updates

**How to Use:**
1. Search for a stock symbol (e.g., AAPL, TSLA, MSFT)
2. View real-time quote with price and change
3. Click "Buy" or "Sell" to open trade form
4. Enter number of shares
5. Review cost estimate
6. Click "Execute" to place trade
7. Watch your portfolio update in real-time

### 🏆 Leaderboard
**URL:** `/leaderboard.html`

**Features:**
- Top 50 traders ranked by performance
- View total portfolio values and returns
- Follow/unfollow other traders
- Recent trading activity feed
- Click usernames to view profiles

### 👤 Profile Pages
**URLs:** `/my-profile.html`, `/user-profile.html`

**Features:**
- Edit your profile (avatar, bio, location)
- Set profile privacy (public/private)
- View trading statistics
- See followers and following
- Trade history

---

## 🎨 Theme System

### Available Themes
1. **Light** - Clean, bright interface
2. **Dark** - Easy on the eyes
3. **Ultradark** - Maximum contrast
4. **Emerald Trust** - Green/financial theme
5. **Quantum Violet** - Purple/tech theme
6. **Copper Balance** - Bronze/copper tones
7. **Regal Portfolio** - Royal blue elegance
8. **Carbon Edge** - Carbon fiber dark

### Switching Themes
1. Click your profile icon
2. Navigate to Settings
3. Select theme from dropdown
4. Theme applies instantly and persists across pages

### Theme Persistence
- Themes save to localStorage
- Automatically restored on page load
- Works across all simulator pages

---

## 🔧 Navigation Features

### Sidebar
- **Icons:** Quick access to main sections
- **Labels:** Show on hover or when expanded
- **Collapse:** Click toggle button to hide completely
- **State Persistence:** Collapse state saves to localStorage

**Sections:**
- 🏠 **Main** - Home dashboard
- ⚡ **Simulator** - Trading interface
- ⭐ **Leaderboard** - Top traders
- 👤 **Profile** - Your profile
- ⚙️ **Settings** - App settings

### Keyboard Shortcuts
- `Esc` - Close modals/forms
- `Enter` - Submit forms
- Click toggle or use mouse to collapse sidebar

---

## 📊 Understanding the Charts

### Portfolio Performance Chart
**Location:** Top left of market-simulator.html

**What it shows:**
- Total portfolio value over time
- Includes cash + position values
- Green line = your performance
- Time range: 1D, 1W, 1M, or ALL

**How to read:**
- Y-axis: Dollar amounts ($)
- X-axis: Time periods
- Hover over line to see exact values
- Line slopes up = gains, down = losses

### Performance Comparison Chart
**Location:** Top right of market-simulator.html

**What it shows:**
- Your portfolio % return (blue line)
- S&P 500 % return (orange line)
- Normalized to show relative performance

**How to read:**
- Y-axis: Percentage return (%)
- X-axis: Time periods
- Above 0% = gains
- Below 0% = losses
- Compare blue vs orange to see if you beat the market

---

## 💰 Trading Guide

### Starting Balance
Every new user gets **$100,000** in virtual cash.

### Placing Trades

**Buy Order:**
1. Search for stock symbol
2. Click "Buy" button
3. Enter number of shares
4. Review total cost
5. Ensure you have enough cash
6. Click "Execute"

**Sell Order:**
1. Must own shares of the stock
2. Click "Sell" button
3. Enter number of shares (max = your position)
4. Review proceeds
5. Click "Execute"
6. Cash is added to your account

### Portfolio Metrics

**Total Value:** Cash + value of all positions
**Cash:** Available buying power
**Total P&L:** Unrealized gains/losses on positions
**Return:** Your overall percentage return
**Trades:** Total number of trades executed

### Position Metrics

For each stock you own:
- **Symbol:** Stock ticker
- **Shares:** Quantity owned
- **Avg Cost:** Average purchase price per share
- **Current:** Latest market price
- **Value:** Current total value (shares × price)
- **P&L:** Profit/loss on position
- **Return:** Percentage return on position

---

## 🔐 Account Features

### Authentication
- Sign up with email
- Sign in with Google OAuth
- Secure JWT-based sessions
- Remember me option

### Profile Privacy
- **Public:** Anyone can view your profile and stats
- **Private:** Only you can see your information

### Social Features
- Follow other traders
- View their public profiles
- See their rankings on leaderboard
- Track recent trading activity

---

## 🌐 API Endpoints

### Simulator API
```
GET  /api/simulator/portfolio         # Get your portfolio
POST /api/simulator/quote             # Get stock quote
POST /api/simulator/quotes            # Get multiple quotes
POST /api/simulator/trade/buy         # Buy shares
POST /api/simulator/trade/sell        # Sell shares
GET  /api/simulator/history           # Trade history
GET  /api/simulator/stats             # Trading stats
GET  /api/simulator/search            # Search stocks
GET  /api/simulator/company/:symbol   # Company info
GET  /api/simulator/market-status     # Market hours
POST /api/simulator/reset             # Reset portfolio
```

### Profile API
```
GET  /api/profile/me                  # Your profile
PUT  /api/profile/me                  # Update profile
GET  /api/profile/:username           # View profile
GET  /api/profile/leaderboard/top     # Top traders
POST /api/profile/follow/:userId      # Follow user
DELETE /api/profile/unfollow/:userId  # Unfollow user
```

---

## 🐛 Troubleshooting

### Server Won't Start
**Check:**
- MongoDB connection string is correct
- Port 4000 is not in use
- Environment variables are set
- Dependencies are installed (`npm install`)

### Pinger Not Starting
**Solution:**
- Ensure `APP_URL` is set in `.env`
- Check URL format: `https://your-app.com` (no trailing slash)
- Restart server after adding APP_URL

### Charts Not Displaying
**Check:**
- JavaScript is enabled in browser
- No console errors (F12 Developer Tools)
- Chart.js CDN is accessible
- Page fully loaded before viewing charts

### Theme Not Saving
**Solution:**
- Enable localStorage in browser settings
- Clear browser cache
- Check for cookie/storage restrictions
- Try incognito mode to test

### Trades Not Executing
**Verify:**
- You're logged in (check session)
- Stock symbol is valid
- You have enough cash (for buys)
- You own shares (for sells)
- Market data is loading

---

## 📈 Performance Tips

### For Best Experience:
1. **Use Latest Browsers:** Chrome 90+, Firefox 88+, Safari 14+
2. **Enable JavaScript:** Required for all features
3. **Clear Cache:** If experiencing issues
4. **Check Network:** Ensure stable internet for real-time quotes
5. **Use Desktop:** Charts display better on larger screens

### Mobile Usage:
- All pages are responsive
- Sidebar auto-collapses on mobile
- Touch-friendly buttons and forms
- Swipe gestures supported

---

## 🔒 Security Notes

- Never share your password or JWT tokens
- Log out from public computers
- Use strong, unique passwords
- Enable 2FA if available
- Report suspicious activity

---

## 📞 Support

### Getting Help:
1. Check console logs (F12 → Console tab)
2. Review error messages
3. Verify environment variables
4. Check MongoDB connection
5. Restart server

### Common Issues:
- **401 Unauthorized:** Log in again
- **500 Server Error:** Check backend logs
- **Network Error:** Verify server is running
- **Quote Failed:** Stock symbol may be invalid

---

## 🎓 Advanced Features

### Using the Pinger Service

**Development:**
- Don't set `APP_URL` for local development
- Pinger is optional for localhost

**Production:**
- Set `APP_URL=https://your-app.onrender.com`
- Pinger keeps server alive (prevents sleep)
- Pings every 10 minutes automatically
- Monitor logs for ping activity

### Customizing Themes

Developers can add new themes by:
1. Adding theme ID to `SUPPORTED_THEMES` in `global-ui.js`
2. Creating CSS overrides in `styles.css`
3. Defining custom properties for the theme
4. Testing across all pages

### Extending Charts

To add more chart types:
1. Import Chart.js plugins
2. Create new canvas elements
3. Initialize charts in JavaScript
4. Update data on portfolio changes

---

## 📚 Resources

- **Chart.js Docs:** https://www.chartjs.org/
- **Yahoo Finance:** Stock data source
- **MongoDB:** https://www.mongodb.com/docs/
- **Express.js:** https://expressjs.com/
- **Node.js:** https://nodejs.org/docs/

---

## ✅ Checklist for New Users

- [ ] Create account or sign in
- [ ] Complete profile setup
- [ ] Explore available themes
- [ ] Search for your first stock
- [ ] Place your first trade
- [ ] Check portfolio charts
- [ ] View the leaderboard
- [ ] Follow top traders
- [ ] Try collapsing the sidebar
- [ ] Switch between light/dark themes

---

## 🎯 Pro Tips

1. **Diversify:** Don't put all cash in one stock
2. **Research:** Use company info before trading
3. **Monitor:** Check charts regularly
4. **Learn:** Study top traders' strategies
5. **Practice:** It's virtual money - experiment!
6. **Compete:** Try to make the leaderboard
7. **Social:** Follow traders to learn from them
8. **Themes:** Find the theme that suits your style

---

**Happy Trading! 📈**

For questions or issues, check the console logs or review the SIMULATOR_ENHANCEMENTS.md documentation.
