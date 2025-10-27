# Render Deployment Setup - Keep Alive Configuration

## ✅ What Was Added

Your backend now includes a **self-ping scheduler** that automatically keeps your Render free tier instance awake by pinging itself every 10 minutes.

## 🚀 How to Configure on Render

### Step 1: Set Environment Variable on Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your `inv101` backend service
3. Click **Environment** in the left sidebar
4. Add this environment variable:

```
Key: APP_URL
Value: https://inv101.onrender.com
```

(Replace `inv101.onrender.com` with your actual Render URL)

**OR** Render automatically provides `RENDER_EXTERNAL_URL` - the code checks for both!

### Step 2: Redeploy

After adding the environment variable:
1. Click **Manual Deploy** > **Deploy latest commit**
2. Or just push your latest code (already done!)

### Step 3: Verify It's Working

Check your Render logs for these messages:
```
📅 Scheduling self-ping: */10 * * * * (every 10 minutes)
✅ Self-ping scheduled successfully
🌐 Keeping Render instance awake
```

Every 10 minutes you'll see:
```
🏓 Self-ping successful (200)
```

## 🎯 What This Does

- **Pings your `/health` endpoint every 10 minutes**
- **Prevents Render free tier from spinning down** (happens after 15 minutes of inactivity)
- **Only runs in production** (skips when running on localhost)
- **Completely automatic** - no user action needed

## 📊 Result

Your Render instance will now:
- ✅ Stay awake 24/7
- ✅ Run midnight scrapers automatically at 00:00 UTC
- ✅ Run all scheduled tasks on time
- ✅ Remain responsive without cold starts

## 🔧 How It Works

```javascript
// Every 10 minutes:
scheduler.startSelfPing('https://your-app.onrender.com');

// Fetches: https://your-app.onrender.com/health
// Result: Instance stays active
```

## 📝 Important Notes

1. **Time Zone**: Render runs in UTC. Your midnight scraper will run at midnight UTC (adjust if needed)
2. **Free Tier**: This uses minimal bandwidth and keeps you within free tier limits
3. **Logs**: You'll see ping logs every 10 minutes - this is normal and expected
4. **Alternative**: If you want to stop self-pinging, just remove the `APP_URL` environment variable on Render

## 🌍 Current Scheduled Tasks

With your instance staying awake, these run automatically:

| Task | Schedule | Time (UTC) |
|------|----------|------------|
| Self-Ping | Every 10 min | Always |
| Midnight Scraper | Daily | 00:00 |
| Article Refresh | Every 6 hours | 00:00, 06:00, 12:00, 18:00 |
| Stock Cache | Every 6 hours | 03:00, 09:00, 15:00, 21:00 |
| Daily Cleanup | Daily | 02:00 |

---

**That's it!** Your app will now run 24/7 on Render's free tier. 🎉
