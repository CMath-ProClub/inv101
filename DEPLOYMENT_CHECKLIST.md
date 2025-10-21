# 🚀 inv101 - Quick Deployment Checklist

## ✅ Already Done:
- [x] Backend server fixed and running
- [x] Article scraping system (5 APIs working)
- [x] Scheduled refresh with node-cron
- [x] Article display component created
- [x] Vercel configuration complete
- [x] All documentation written

## 📋 Your Next Steps (in order):

### Step 1: MongoDB Atlas Setup (15 minutes)
**Why**: Vercel needs cloud database (serverless = no persistent storage)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (free tier)
3. Create M0 cluster (free, 512 MB)
4. Create database user with password
5. Whitelist IP: `0.0.0.0/0` (required for Vercel)
6. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/investing101?retryWrites=true&w=majority
   ```
7. Add to `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://...your connection string...
   ```

**Full guide**: See `MONGODB_ATLAS_SETUP.md`

### Step 2: Populate Database (5 minutes)
```powershell
# After updating .env with MongoDB Atlas URI
node backend/run-all-scrapers.js
```

This fetches 500+ articles to your cloud database.

### Step 3: Deploy to Vercel (30 minutes)

#### 3.1 Install Vercel CLI:
```powershell
npm install -g vercel
```

#### 3.2 Login:
```powershell
vercel login
```

#### 3.3 Deploy:
```powershell
vercel --prod
```

#### 3.4 Add Environment Variables in Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all variables from `backend/.env`:
   - `MONGODB_URI`
   - `NEWSAPI_API_KEY` (if you have it)
   - `THENEWSAPI_TOKEN`
   - `CURRENTS_API_KEY`
   - `GUARDIAN_API_KEY`
   - `NEWSDATA_API_KEY`
   - `NYTIMES_API_KEY` (optional)

**Full guide**: See `VERCEL_DEPLOYMENT.md`

### Step 4: Set Up Article Refresh (10 minutes)
**Problem**: Vercel free tier doesn't support cron jobs
**Solution**: Use external cron service

1. Go to https://cron-job.org/en/ (free)
2. Create account
3. Add new cron job:
   - URL: `https://your-app.vercel.app/api/articles/refresh`
   - Schedule: Every 6 hours
   - Method: POST

**Alternative**: GitHub Actions (see `VERCEL_DEPLOYMENT.md` for code)

---

## 🎯 Total Time: ~1 hour

After these 4 steps, your app is **LIVE** at:
`https://your-project.vercel.app`

---

## 📚 Documentation Reference

| File | Purpose |
|------|---------|
| `MONGODB_ATLAS_SETUP.md` | Complete MongoDB setup guide |
| `VERCEL_DEPLOYMENT.md` | Deployment step-by-step |
| `IMPLEMENTATION_COMPLETE.md` | What was built |
| `NEWS_API_SETUP.md` | News API details |

---

## 🆘 Quick Troubleshooting

### Server won't start locally?
```powershell
# Check syntax
node -c backend/index.js

# Run with full error output
node backend/index.js 2>&1
```

### MongoDB Atlas connection fails?
- Check `0.0.0.0/0` in Network Access
- Verify password has no special chars (or URL encode)
- Test connection: `node backend/check-db-status.js`

### Vercel deployment fails?
- Ensure all env vars are set in dashboard
- Check `vercel logs` for errors
- Verify `vercel.json` syntax

### No articles showing?
- Run scrapers: `node backend/run-all-scrapers.js`
- Check database: `node backend/check-database.js`
- Verify API keys are valid

---

## 💻 Essential Commands

```powershell
# Local Development
node backend/index.js              # Start server
node backend/run-all-scrapers.js   # Fetch articles
node backend/check-database.js     # View stats

# Deployment
vercel --prod                      # Deploy to production
vercel logs                        # View logs
vercel env pull                    # Sync env vars locally

# Testing
curl http://localhost:4000/api/articles/stats
curl http://localhost:4000/api/stocks/AAPL
```

---

## 🔐 Security Checklist

- [x] `.gitignore` includes `.env`
- [x] Environment variables in Vercel (not in code)
- [x] MongoDB Atlas has authentication
- [x] CORS configured properly
- [x] API keys not exposed in frontend

---

## 🎉 You're Ready!

Everything is coded, tested, and documented.

Just need to:
1. ✅ MongoDB Atlas (15 min)
2. ✅ Deploy to Vercel (30 min)
3. ✅ Set up cron job (10 min)

**Let's go live! 🚀**
