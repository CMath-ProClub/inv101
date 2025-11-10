
# 🚀 Deploy to Render (FREE) - Simple Steps

## ⚠️ Railway Free Tier Limitation

Railway's free tier now only supports databases. Instead, we'll use **Render**, which offers:
- ✅ Free web service hosting
- ✅ Automatic GitHub deployments
- ✅ Works with your MongoDB Atlas
- ✅ SSL certificates included

---

## 📋 Step 1: Create Render Account

1. Go to https://render.com
2. Click **Get Started** or **Sign Up**
3. Sign up with **GitHub** (easiest option)
4. Authorize Render to access your GitHub repos

---

## 📋 Step 2: Create New Web Service

1. From Render Dashboard, click **+ New**
2. Select **Web Service**
3. Connect your GitHub repository:
   - Search for: **inv101**
   - Click **Connect**

---

## 📋 Step 3: Configure Service

Fill in these settings:

**Name:** `inv101` (or any name you like)

**Region:** Choose closest to you (e.g., Oregon USA)

**Branch:** `main`

**Root Directory:** Leave empty (or use `/backend` if needed)

**Runtime:** `Node`

**Build Command:** 
```
cd backend && npm install
```
⚠️ **Important:** Make sure to type `npm` not `nmp`!

**Start Command:**
```
node backend/index.js
```
⚠️ **Important:** Use `node backend/index.js` not `cd backend && node index.js`!

**Instance Type:** `Free`

---

## 📋 Step 4: Add Environment Variables

Scroll down to **Environment Variables** section and add:

**Variable 1:**
- **Key:** `MONGODB_URI`
- **Value:** 
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/investing101?retryWrites=true&w=majority&appName=Cluster0
```
*(Get this from your MongoDB Atlas Dashboard → Database → Connect)*

**Variable 2:**
- **Key:** `NODE_ENV`
- **Value:** `production`

**Variable 3:**
- **Key:** `JWT_SECRET`
- **Value:** (a long random string you generate locally)

**Variable 4:**
- **Key:** `SESSION_SECRET`
- **Value:** (a different long random string)

Optional (if using Clerk auth):
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET` (for /webhooks/clerk)

(Add your other API keys too: news providers, market data, email SMTP)

**Note:** Render automatically sets the `PORT` environment variable - you don't need to set it manually!

---

## 📋 Step 5: Deploy!

1. Click **Create Web Service**
2. Render will:
   - Clone your repo
   - Run `npm install`
   - Start your server
   - Give you a URL like: `https://inv101.onrender.com`

**First deployment takes 5-10 minutes**

---

## 📋 Step 6: Verify Deployment

Once deployed, test these URLs:

1. **Health Check:**
   ```
   https://inv101.onrender.com/health
   ```

2. **Stock Data:**
   ```
   https://inv101.onrender.com/api/stocks/cached/AAPL
   ```

3. **Homepage:**
   ```
   https://inv101.onrender.com/
   ```

---

## ⚡ Important Notes:

### Free Tier Limitations:
- **Spins down after 15 minutes of inactivity**
- **First request after spin-down takes ~30 seconds** (cold start)
- Good for development/demo, not production traffic

### Keeping It Awake (Optional):
You can use a service like **UptimeRobot** (free) to ping your app every 5 minutes to keep it awake.

---

## 🎯 What Happens During Deployment:

1. **Render clones** your GitHub repo
2. **Installs dependencies** (`npm install`)
3. **Starts server** (`node index.js`)
4. **Connects to MongoDB Atlas**
5. **Loads stock cache** (~3-5 minutes)
6. **Server ready!**

---

## 📞 Troubleshooting:

### If Build Fails:
- Check the **Logs** tab in Render
- Verify `package.json` has correct `start` script
- Make sure all environment variables are set

### If Server Crashes:
- Check MongoDB URI is correct
- Verify MongoDB Network Access allows `0.0.0.0/0`
- Check Render logs for specific errors

---

## 🔄 Auto-Deploys:

After initial setup, Render automatically redeploys when you:
1. Push to GitHub
2. Merge a pull request
3. Make any changes to `main` branch

No need to manually redeploy!

---

## 💰 Cost:

**FREE** - Render's free tier includes:
- 750 hours/month web service
- Automatic SSL
- Global CDN
- GitHub auto-deploys

Perfect for your app! 🎉
