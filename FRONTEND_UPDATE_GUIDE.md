# Frontend API Update Instructions

## 🔗 Connect Frontend to Live Backend

### Step 1: Update API Configuration

1. Open `prototype/config.js`
2. Change the `BASE_URL` from:
   ```javascript
   BASE_URL: 'http://localhost:4000',
   ```
   To your Render URL:
   ```javascript
   BASE_URL: 'https://YOUR-APP-NAME.onrender.com',
   ```

### Step 2: Files to Update

The following files need to be updated to use `config.js`:

**Stock Analysis & Recommendations:**
- `prototype/stock-analysis.html` (Line 86)
- `prototype/stock-recommendations.html` (Line 86)
- `prototype/comparison.html` (Line 474)

**Change from:**
```javascript
fetch('http://localhost:4000/api/stocks/...')
```

**To:**
```javascript
fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.STOCKS_...))
```

### Step 3: Enhanced Features Added

**✅ Stock Analysis (stock-analysis.html)**
- Already has ticker input field
- Connected to live API
- Just needs API URL update

**✅ Index Fund Comparison (comparison.html)**
- Added index fund type selector
- Options: S&P 500, Dow Jones, Nasdaq 100, Russell 2000
- Custom ticker input for comparison
- Live data from backend

**✅ Calculator Verification**
- All 18 calculators are client-side (no API needed)
- Formulas verified for accuracy
- Ready to test

### Step 4: Deploy Frontend

**Option A: GitHub Pages (Recommended for static sites)**
```powershell
# Enable GitHub Pages in repo settings
# Choose: Deploy from branch 'main', folder '/prototype'
```

**Option B: Netlify**
1. Go to netlify.com
2. Drag & drop `prototype` folder
3. Done!

**Option C: Vercel**
1. Go to vercel.com
2. Import GitHub repo
3. Set root directory to `/prototype`
4. Deploy

---

## 📝 Quick Update Checklist

- [ ] Get Render URL from dashboard
- [ ] Update `prototype/config.js` with Render URL
- [ ] Test stock-analysis.html locally
- [ ] Test comparison.html locally
- [ ] Commit changes to GitHub
- [ ] Deploy frontend to hosting platform
- [ ] Test live site end-to-end
