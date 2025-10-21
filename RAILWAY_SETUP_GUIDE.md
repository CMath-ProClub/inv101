# Railway MongoDB Setup - Step by Step

## Step 1: Sign Up for Railway (1 minute)

1. Go to: **https://railway.app/**
2. Click **"Start a New Project"** or **"Login"**
3. Choose: **"Login with GitHub"** (fastest)
4. Authorize Railway to access your GitHub

✅ You're now logged in!

---

## Step 2: Create MongoDB Database (30 seconds)

1. You should see the Railway dashboard
2. Click **"New Project"** (big button in center or top right)
3. You'll see options:
   - "Deploy from GitHub repo"
   - "Deploy a Template"
   - "Provision a Database"
4. Click **"Provision MongoDB"** or look for MongoDB in templates

**Alternative if you don't see "Provision MongoDB":**
1. Click **"+ New"**
2. Select **"Database"**
3. Choose **"Add MongoDB"**

---

## Step 3: Wait for Deployment (30 seconds)

You'll see:
- "Deploying MongoDB..."
- Progress indicator

**Wait for it to say:** ✅ "Active" or show a green status

---

## Step 4: Get Connection String (30 seconds)

1. Click on the **MongoDB service** (box with MongoDB logo)
2. Look for **"Connect"** tab or **"Variables"** tab
3. Find one of these variables:
   - **`MONGO_URL`** ← Copy this one!
   - Or **`DATABASE_URL`**
   - Or **`MONGODB_URI`**

The connection string looks like:
```
mongodb://mongo:RANDOM_PASSWORD@containers-us-west-123.railway.app:7654
```

4. **Click the copy icon** 📋 next to the connection string

---

## Step 5: Update Your .env File (30 seconds)

1. Open VS Code
2. Open file: **`backend/.env`**
3. Find or add this line at the top:

```env
MONGODB_URI=mongodb://mongo:PASSWORD@containers.railway.app:PORT
```

4. **Replace** with your copied Railway connection string:

```env
MONGODB_URI=mongodb://mongo:abc123xyz@containers-us-west-42.railway.app:7654
```

5. **Add `/investing101`** at the end (important!):

```env
MONGODB_URI=mongodb://mongo:abc123xyz@containers-us-west-42.railway.app:7654/investing101
```

6. **Save the file** (Ctrl + S)

---

## Step 6: Test Connection (30 seconds)

Run this in your terminal:

```powershell
node backend/test-mongodb-connection.js
```

**You should see:**
```
✅ MongoDB Atlas - SUCCESS!
   Database: investing101
   Host: containers-us-west-42.railway.app
```

(It says "Atlas" but it's actually testing ANY MongoDB connection!)

---

## Step 7: Populate Database (2-3 minutes)

```powershell
node backend/run-all-scrapers.js
```

This will:
- Fetch 500+ articles from news APIs
- Store them in your Railway MongoDB
- Take 2-3 minutes

**You should see:**
```
✅ All scrapers completed!
📊 Total articles: 500+
```

---

## Step 8: Start Your Server (5 seconds)

```powershell
node backend/index.js
```

**You should see:**
```
✅ MongoDB connected successfully
📊 Database: investing101
🌐 Host: containers-us-west-42.railway.app
🚀 Yahoo Finance backend running on port 4000
```

✅ **SUCCESS!** Your app is now using Railway MongoDB!

---

## Step 9: Test in Browser (10 seconds)

Open: **http://localhost:4000/play-ai.html**

Everything should work! Articles are now stored in Railway's cloud database.

---

## Troubleshooting

### "Connection failed" or "Authentication failed"
- Check that you copied the FULL connection string
- Make sure you added `/investing101` at the end
- Verify no extra spaces in `.env` file

### "Database not found"
- Add `/investing101` to the end of connection string
- Format: `mongodb://user:pass@host:port/investing101`

### "Network timeout"
- Check your internet connection
- Railway might be deploying, wait 1 minute and try again

---

## Railway Free Tier

- **Database Storage**: 512 MB (enough for 50,000+ articles)
- **Cost**: $5 monthly credit (FREE for your usage)
- **Uptime**: 24/7
- **Backups**: Manual (you can export data)

---

## Next Steps

After Railway is working:

1. ✅ Test your app locally with Railway database
2. ✅ Deploy to Vercel (add same connection string to Vercel env vars)
3. ✅ Your app is live with persistent database!

---

## Need Help?

If you get stuck, tell me:
1. What step are you on?
2. What do you see on the Railway page?
3. Any error messages?

I'll help you troubleshoot!

---

**Ready? Go to https://railway.app/ and start! Let me know when you have the connection string!** 🚂
