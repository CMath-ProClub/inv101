# 🚀 Deploy to Railway - Simple Steps

## ✅ Everything is Ready!

Your code is committed and pushed to GitHub. MongoDB Atlas is configured and working locally.

---

## 📋 Step 1: Add MongoDB URI to Railway

1. Go to your Railway dashboard: https://railway.app/dashboard
2. Open your **inv101** project
3. Click on your service
4. Go to the **Variables** tab
5. Click **+ New Variable**
6. Add this:

**Variable Name:**
```
MONGODB_URI
```

**Variable Value:**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/investing101?retryWrites=true&w=majority&appName=Cluster0
```
*(Get this from MongoDB Atlas Dashboard → Database → Connect)*

7. Click **Add** or **Save**

---

## 📋 Step 2: Deploy from GitHub

### If This is a New Railway Project:
1. Click **+ New Project**
2. Choose **Deploy from GitHub repo**
3. Select **CMath-ProClub/inv101**
4. Railway will auto-detect Node.js and deploy

### If Project Already Exists:
1. Go to your project settings
2. Click **Redeploy** or wait for automatic deployment

---

## 📋 Step 3: Verify Deployment

Once deployed, Railway will give you a URL like:
```
https://inv101-production.up.railway.app
```

Test these endpoints:

1. **Health Check:**
   ```
   https://your-app.railway.app/health
   ```
   Should return: `{"status":"ok","timestamp":"...","database":"connected"}`

2. **Stock Data:**
   ```
   https://your-app.railway.app/api/stocks/cached/AAPL
   ```
   Should return Apple stock data

3. **Homepage:**
   ```
   https://your-app.railway.app/
   ```
   Should show your Investing101 app

---

## ⚙️ What Will Happen:

1. **Railway detects** `package.json` and runs:
   - `npm install` (installs dependencies)
   - `npm start` (runs `node index.js`)

2. **Server starts** (~5 seconds)

3. **MongoDB connects** to Atlas (persistent database)

4. **Stock cache loads** in background (~3-5 minutes)
   - 1,615 tickers
   - ~99% success rate
   - Data saved to MongoDB

5. **Server ready!** All APIs working

---

## 🎯 That's It!

Just add the MongoDB URI variable in Railway and it will deploy automatically.

The entire deployment process takes about 5-10 minutes total.

---

## 📞 Need Help?

If something goes wrong:
1. Check Railway **Logs** tab for errors
2. Verify MongoDB URI is correct
3. Make sure `0.0.0.0/0` is whitelisted in MongoDB Atlas Network Access
