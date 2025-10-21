# MongoDB Atlas Setup Guide for Vercel Deployment

## Why MongoDB Atlas is Required for Vercel

**Vercel is serverless**, which means:
- Each API request runs in an isolated, ephemeral container
- No persistent local storage between requests
- The in-memory MongoDB database is **destroyed after each request**
- You **MUST** use MongoDB Atlas (cloud database) for data persistence

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google account (free tier available)
3. Choose **FREE M0 cluster** (512 MB storage, perfect for development)

## Step 2: Create a Cluster

1. After signup, click **"Build a Database"**
2. Choose **M0 (Free tier)**
3. Select cloud provider: **AWS** (recommended)
4. Choose region: **Closest to your users** (e.g., us-east-1 for US)
5. Cluster name: `inv101-cluster` (or any name you prefer)
6. Click **"Create"**

Wait 1-3 minutes for cluster provisioning.

## Step 3: Configure Database Access

### Create Database User:
1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `inv101-user` (or your choice)
5. Password: **Generate a strong password** (save it!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

## Step 4: Configure Network Access

### Add IP Whitelist:
1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Required for Vercel serverless functions
   - Vercel uses dynamic IPs, so you can't whitelist specific IPs
4. Click **"Confirm"**

## Step 5: Get Connection String

1. Go to **"Database"** (Deployments) in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string:

```
mongodb+srv://inv101-user:<password>@inv101-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. Replace `<password>` with your actual database user password
7. Add database name before the `?`:

```
mongodb+srv://inv101-user:YOUR_PASSWORD@inv101-cluster.xxxxx.mongodb.net/investing101?retryWrites=true&w=majority
```

## Step 6: Update Local .env File

Add to `backend/.env`:

```env
# MongoDB Atlas Connection (for production/Vercel)
MONGODB_URI=mongodb+srv://inv101-user:YOUR_PASSWORD@inv101-cluster.xxxxx.mongodb.net/investing101?retryWrites=true&w=majority

# Keep local development option (will fallback to Atlas if this fails)
# MONGODB_LOCAL_URI=mongodb://localhost:27017/investing101
```

## Step 7: Configure Vercel Environment Variables

When deploying to Vercel, add environment variables:

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add each variable from your `.env` file:

### Required Variables:
```
MONGODB_URI=mongodb+srv://inv101-user:YOUR_PASSWORD@...
NEWSAPI_API_KEY=your_newsapi_key_here
THENEWSAPI_TOKEN=your_thenewsapi_key_here
CURRENTS_API_KEY=your_currents_key_here
GUARDIAN_API_KEY=your_guardian_key_here
NEWSDATA_API_KEY=your_newsdata_key_here
NYTIMES_API_KEY=your_nytimes_key_here
```

4. Set environment scope to: **Production, Preview, Development**
5. Click **"Save"**

## Step 8: Test Connection Locally

Update your database config to prefer Atlas:

```javascript
// backend/config/database.js
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investing101';
```

Test the connection:

```powershell
node backend/check-db-status.js
```

You should see:
```
✅ MongoDB connected: inv101-cluster.xxxxx.mongodb.net/investing101
```

## Step 9: Initial Data Population

Run the article scrapers to populate your Atlas database:

```powershell
node backend/run-all-scrapers.js
```

This will fetch and store 500+ articles directly to MongoDB Atlas.

## Step 10: Deploy to Vercel

```powershell
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## MongoDB Atlas Free Tier Limits

- **Storage**: 512 MB (enough for ~50,000-100,000 articles)
- **RAM**: Shared (sufficient for this app)
- **Connections**: 500 concurrent (more than enough)
- **Cost**: FREE forever!

## Monitoring Your Database

1. Go to MongoDB Atlas dashboard
2. Click **"Browse Collections"** on your cluster
3. You'll see:
   - `articles` collection (your news articles)
   - `cacherefreshlogs` collection (scraper history)

## Backup Strategy (Optional)

MongoDB Atlas automatic backups:
1. Go to **"Backup"** tab
2. Free tier: Manual exports only
3. For automatic backups: Upgrade to M10+ ($0.08/hr)

## Troubleshooting

### Connection Timeout
- Check IP whitelist includes `0.0.0.0/0`
- Verify connection string has correct password
- Ensure database name is in the URL

### Authentication Failed
- Double-check username and password
- Regenerate password if unsure
- Ensure user has "Read and write" privileges

### Database Not Found
- Add database name to connection string: `/investing101?`
- MongoDB creates the database automatically on first write

## Important Notes for Vercel

1. **Cron jobs won't work** on Vercel's free tier
   - Use Vercel Cron (paid) or external service like cron-job.org
   - Alternative: Call `/api/articles/refresh` endpoint from external scheduler

2. **Cold starts**: First request may take 3-5 seconds
   - Keep one endpoint warm with uptime monitor (uptimerobot.com)

3. **Function timeout**: 10 seconds on free tier
   - Article scraping should be done manually or via scheduled external calls

## Ready to Deploy!

Once MongoDB Atlas is configured:
1. ✅ Connection string in `.env`
2. ✅ Environment variables in Vercel
3. ✅ Database populated with articles
4. ✅ Run `vercel --prod`

Your app will be live at: `https://your-project.vercel.app`
