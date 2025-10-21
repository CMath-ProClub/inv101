# Vercel Deployment Guide for inv101

## Prerequisites

1. ✅ MongoDB Atlas account set up (see MONGODB_ATLAS_SETUP.md)
2. ✅ All API keys ready
3. ✅ Git repository pushed to GitHub

## Step 1: Prepare for Deployment

### Update .gitignore
Make sure your `.gitignore` includes:

```
node_modules/
.env
backend/.env
.vercel
*.log
```

### Commit all changes:

```powershell
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Install Vercel CLI

```powershell
npm install -g vercel
```

## Step 3: Login to Vercel

```powershell
vercel login
```

Choose your preferred login method (GitHub, GitLab, Bitbucket, or Email).

## Step 4: Deploy to Vercel

### Initial Deployment (Development):

```powershell
# From project root
vercel
```

Answer the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → inv101 (or your choice)
- **Which directory?** → ./ (press Enter)
- **Override settings?** → No

Wait 30-60 seconds for deployment.

### Production Deployment:

```powershell
vercel --prod
```

## Step 5: Configure Environment Variables

### Via Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Select your `inv101` project
3. Navigate to **Settings → Environment Variables**
4. Add each variable:

```
MONGODB_URI = mongodb+srv://your-user:your-password@cluster.mongodb.net/investing101?retryWrites=true&w=majority
NEWSAPI_API_KEY = your_newsapi_key
THENEWSAPI_TOKEN = your_thenewsapi_key
CURRENTS_API_KEY = your_currents_key
GUARDIAN_API_KEY = your_guardian_key
NEWSDATA_API_KEY = your_newsdata_key
NYTIMES_API_KEY = your_nytimes_key
NODE_ENV = production
```

5. Set environment scope: **Production, Preview, Development**

### Via Vercel CLI (Alternative):

```powershell
vercel env add MONGODB_URI production
# Paste your MongoDB Atlas connection string when prompted

vercel env add NEWSAPI_API_KEY production
# Paste your API key when prompted

# Repeat for all other environment variables
```

## Step 6: Populate Database

Before your app can show articles, populate MongoDB Atlas:

```powershell
# Update backend/.env with MongoDB Atlas URI
# Then run:
node backend/run-all-scrapers.js
```

This will fetch 500+ articles directly to your cloud database.

## Step 7: Test Your Deployment

Your app is now live! Visit:
- **Production**: `https://inv101.vercel.app` (or your custom domain)
- **Latest deployment**: Check Vercel dashboard for URL

### Test endpoints:
1. Homepage: `https://your-app.vercel.app/`
2. Market articles: `https://your-app.vercel.app/api/articles/market`
3. Stock data: `https://your-app.vercel.app/api/stocks/AAPL`
4. Simulation: `https://your-app.vercel.app/play-ai.html`

## Step 8: Configure Custom Domain (Optional)

1. Go to **Settings → Domains** in Vercel dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `investing101.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-60 minutes)

## Important: Serverless Limitations

### ⚠️ Cron Jobs Don't Work on Vercel Free Tier

The scheduled article refresh (`node-cron`) won't work on Vercel's free tier because:
- Functions are stateless and terminate after each request
- No persistent processes

### Solutions:

#### Option 1: Manual Refresh Endpoint
Call the refresh endpoint manually or via external scheduler:

```bash
curl -X POST https://your-app.vercel.app/api/articles/refresh
```

#### Option 2: External Cron Service
Use free services to trigger your endpoint:
- **cron-job.org** (free, reliable)
- **EasyCron** (free tier available)
- **GitHub Actions** (run workflows on schedule)

Example GitHub Action (`.github/workflows/refresh-articles.yml`):

```yaml
name: Refresh Articles
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger article refresh
        run: |
          curl -X POST https://your-app.vercel.app/api/articles/refresh
```

#### Option 3: Vercel Cron (Paid)
Upgrade to Vercel Pro ($20/month) for native cron support:

```json
// vercel.json
{
  "crons": [{
    "path": "/api/articles/refresh",
    "schedule": "0 */6 * * *"
  }]
}
```

## Monitoring and Debugging

### View Logs:
```powershell
vercel logs
```

### Check Function Metrics:
1. Go to Vercel dashboard
2. Select your project
3. Navigate to **Analytics** tab
4. View request counts, errors, performance

### Common Issues:

#### 1. MongoDB Connection Timeout
- **Cause**: IP not whitelisted
- **Fix**: Ensure `0.0.0.0/0` is in Atlas Network Access

#### 2. Environment Variables Not Loaded
- **Cause**: Not set in Vercel
- **Fix**: Add all variables in Settings → Environment Variables
- **Note**: Redeploy after adding variables

#### 3. API Rate Limits
- **Cause**: Too many requests to news APIs
- **Fix**: Implement caching, reduce scraping frequency

#### 4. Function Timeout (10s limit on free tier)
- **Cause**: Article scraping takes too long
- **Fix**: Run scrapers locally, use manual refresh endpoint

## Performance Optimization

### 1. Enable Edge Caching:
Add to response headers:

```javascript
res.set('Cache-Control', 's-maxage=3600, stale-while-revalidate');
```

### 2. Reduce Cold Starts:
Use uptime monitoring to ping your site every 5 minutes:
- **UptimeRobot** (free)
- **Pingdom** (free tier)

### 3. Optimize Bundle Size:
Vercel automatically optimizes, but you can help:
- Remove unused dependencies
- Use code splitting
- Minimize frontend assets

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```powershell
git add .
git commit -m "Add new feature"
git push origin main
```

Within 30-60 seconds, your changes are live!

### Branch Deployments:
Every branch gets its own preview URL:

```powershell
git checkout -b feature-new-calculator
git push origin feature-new-calculator
```

Vercel creates: `https://inv101-git-feature-new-calculator.vercel.app`

## Cost Breakdown

### Vercel Free Tier:
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Serverless functions
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ❌ No cron jobs
- ⚠️ 10-second function timeout

### Vercel Pro ($20/month):
- ✅ Everything in Free
- ✅ Cron jobs
- ✅ 60-second function timeout
- ✅ 1TB bandwidth
- ✅ Advanced analytics

### MongoDB Atlas Free Tier:
- ✅ 512 MB storage (forever free)
- ✅ Shared RAM
- ✅ 500 concurrent connections

**Total Monthly Cost: $0** (Free tier perfectly adequate for this project!)

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure environment variables
3. ✅ Populate database with articles
4. ✅ Test all endpoints
5. ⏭️ Set up external cron job for article refresh
6. ⏭️ Configure custom domain (optional)
7. ⏭️ Set up uptime monitoring
8. ⏭️ Enable analytics tracking

## Useful Commands

```powershell
# Deploy to production
vercel --prod

# View logs
vercel logs

# List all deployments
vercel ls

# Remove a deployment
vercel rm [deployment-id]

# Check deployment status
vercel inspect [deployment-url]

# Pull environment variables locally
vercel env pull
```

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/

## Your App is Live! 🚀

Visit: `https://inv101.vercel.app`

Share your investment education platform with the world!
