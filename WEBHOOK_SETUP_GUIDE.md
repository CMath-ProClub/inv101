# 🔗 Clerk Webhook Setup Guide

This guide will walk you through setting up Clerk webhooks to keep your MongoDB database in sync with Clerk user changes.

---

## 📋 Prerequisites

- ✅ Clerk account created
- ✅ Backend running with Clerk integration
- ✅ `CLERK_SECRET_KEY` in `.env`

---

## 🎯 Why Setup Webhooks?

Webhooks automatically sync your MongoDB when:
- ✅ User signs up (creates user in your DB)
- ✅ User updates profile (syncs changes)
- ✅ User deletes account (soft deletes in your DB)
- ✅ Email address changes
- ✅ Profile picture updates

**Without webhooks:** User data only syncs when they make API requests  
**With webhooks:** User data syncs in real-time automatically

---

## 🚀 Setup Steps

### Step 1: Install Tunneling Tool (For Local Development)

**Choose one of these options - they all work the same way:**

---

#### **Option 1: Cloudflare Tunnel (Easiest - No Installation, No Antivirus Issues)**

```powershell
# Download and run - one command!
npx cloudflared tunnel --url http://localhost:4000
```

That's it! No installation, no antivirus issues. Just copy the `https://` URL it shows.

**Example output:**
```
Your quick Tunnel has been created!
https://random-name-1234.trycloudflare.com
```

---

#### **Option 2: localtunnel (Simplest - via npm)**

```powershell
# Install globally
npm install -g localtunnel

# Run it
lt --port 4000
```

**Example output:**
```
your url is: https://random-subdomain-1234.loca.lt
```

**Note:** First visit may show a warning page - click "Continue" to proceed.

---

#### **Option 3: Pinggy (No Installation)**

```powershell
# Windows PowerShell - one line
ssh -p 443 -R0:localhost:4000 -L4300:localhost:4300 a.pinggy.io
```

Or visit: http://pinggy.io and follow their simple setup.

---

#### **Option 4: ngrok (Original - If you want to troubleshoot)**

⚠️ **Windows Defender may flag this as a virus (false positive)**

**Quick fix for antivirus block:**
1. Open Windows Security → Virus & threat protection → Manage settings
2. Scroll to "Exclusions" → Add exclusion → Folder → `C:\Users\YourUsername\ngrok`
3. Download from: https://ngrok.com/download
4. Extract ZIP to the exclusion folder
5. Run: `cd C:\Users\YourUsername\ngrok` then `.\ngrok http 4000`

---

### **Recommended: Use Cloudflare Tunnel (Option 1)**

It's the easiest and has no antivirus issues. Just run:

```powershell
npx cloudflared tunnel --url http://localhost:4000
```

### Step 2: Start Tunnel

**Using Cloudflare Tunnel (Recommended):**
```powershell
npx cloudflared tunnel --url http://localhost:4000
```

**Using localtunnel:**
```powershell
lt --port 4000
```

**Using ngrok (if you got it working):**
```powershell
ngrok http 4000
```

**Expected output (any tool):**
```
Forwarding    https://random-name-1234.something.com -> http://localhost:4000
```

**Copy the HTTPS URL** (e.g., `https://random-name-1234.trycloudflare.com`)

⚠️ **Important:** 
- Use the HTTPS URL, not HTTP
- Keep the tunnel running while testing
- Free URLs may change each time you restart
- Cloudflare/localtunnel URLs work without sign-up

### Step 3: Add Webhook in Clerk Dashboard

1. **Go to Clerk Dashboard:**
   - Visit: https://dashboard.clerk.com
   - Select your application

2. **Navigate to Webhooks:**
   - Click **"Webhooks"** in the left sidebar
   - Click **"+ Add Endpoint"**

3. **Configure Endpoint:**
   
   **Endpoint URL:**
   ```
   https://YOUR_NGROK_URL.ngrok.io/auth/clerk-webhook
   ```
   
   Example: `https://abc123.ngrok.io/auth/clerk-webhook`

4. **Subscribe to Events:**
   
   Check these three events:
   - ☑️ `user.created`
   - ☑️ `user.updated`
   - ☑️ `user.deleted`

5. **Click "Create"**

### Step 4: Copy Webhook Secret

After creating the webhook:

1. Click on your newly created webhook endpoint
2. Find the **"Signing Secret"** section
3. Click **"Reveal"** to show the secret
4. Copy the secret (starts with `whsec_...`)

### Step 5: Add Secret to `.env`

Open `backend/.env` and add:

```bash
CLERK_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

**Example:**
```bash
CLERK_PUBLISHABLE_KEY=pk_test_Y2FzdWFsLXBvcnBvaXNlLTEzLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_PESxQhZGCI6nWLpFmX2E25eflXiJ3DCrwzriSNsNi5
CLERK_WEBHOOK_SECRET=whsec_abc123xyz456
```

### Step 6: Restart Backend Server

```powershell
# Stop the current server (Ctrl+C in terminal)
cd backend
npm start
```

**Look for:**
```
✅ Clerk authentication initialized
🚀 Yahoo Finance backend running on port 4000
```

---

## 🧪 Testing Webhooks

### Test 1: Sign Up New User

1. **Go to:** `http://localhost:4000/signup-clerk.html`
2. **Sign up** with a new email
3. **Check backend console** for:
   ```
   ✅ Webhook verified and processed: user.created
   ✅ Synced Clerk user to database: user_...
   ```
4. **Check MongoDB** for new user:
   ```javascript
   db.users.findOne({ provider: 'clerk' })
   ```

### Test 2: Update User Profile

1. **Go to:** https://dashboard.clerk.com
2. **Navigate to:** Users → Select a user
3. **Edit profile:** Change name or email
4. **Check backend console** for:
   ```
   ✅ Webhook verified and processed: user.updated
   ✅ Updated user in database: user_...
   ```

### Test 3: Delete User

1. **In Clerk Dashboard:** Users → Select user → Delete
2. **Check backend console** for:
   ```
   ✅ Webhook verified and processed: user.deleted
   ✅ Soft deleted user: user_...
   ```
3. **Check MongoDB:**
   ```javascript
   db.users.findOne({ clerkId: 'user_...' })
   // Should have: deleted: true, deletedAt: [timestamp]
   ```

---

## 🐛 Troubleshooting

### Issue: "Webhook verification failed"

**Symptoms:**
- Backend logs: `❌ Webhook verification failed`
- Clerk Dashboard shows failed deliveries

**Solutions:**
1. Verify `CLERK_WEBHOOK_SECRET` in `.env` is correct
2. Check secret starts with `whsec_`
3. Restart backend after adding secret
4. Verify ngrok is running and URL matches Clerk config

### Issue: "Cannot POST /auth/clerk-webhook"

**Symptoms:**
- 404 error in Clerk Dashboard
- Backend doesn't receive webhooks

**Solutions:**
1. Verify endpoint URL includes `/auth/clerk-webhook`
2. Check ngrok URL is correct and active
3. Verify backend is running on port 4000
4. Test manually: `curl https://YOUR_NGROK_URL.ngrok.io/auth/clerk-webhook`

### Issue: ngrok tunnel expired

**Symptoms:**
- Webhooks stop working after ~2 hours
- Free tier ngrok URL changed

**Solutions:**
1. **Quick fix:** Restart ngrok, update Clerk webhook URL
2. **Better fix:** Sign up for ngrok account (free):
   - Get persistent subdomain
   - Longer session times
3. **Production fix:** Use your production domain (no ngrok needed)

### Issue: User not created in MongoDB

**Symptoms:**
- Sign-up succeeds in Clerk
- No user in MongoDB
- No webhook logs

**Solutions:**
1. Check webhook events are subscribed (`user.created`)
2. Verify ngrok tunnel is active
3. Check backend console for errors
4. Test webhook delivery in Clerk Dashboard:
   - Webhooks → Your endpoint → Recent deliveries
   - Click failed delivery to see error details

---

## 📊 Monitoring Webhooks

### Clerk Dashboard

View webhook activity:
1. Go to: **Webhooks** → Your endpoint
2. Check **"Recent Deliveries"** tab
3. See success/failure status
4. View request/response details

**Healthy webhook:**
- ✅ Status: 200
- ✅ Response time: < 1s
- ✅ No errors

### Backend Logs

Watch for these messages:

**Success:**
```
✅ Webhook verified and processed: user.created
✅ Synced Clerk user to database: user_abc123
```

**Errors:**
```
❌ Webhook verification failed
❌ Error handling user.created webhook: [error details]
```

### MongoDB

Check synced users:
```javascript
// Count Clerk users
db.users.countDocuments({ provider: 'clerk' })

// Find recent Clerk users
db.users.find({ provider: 'clerk' }).sort({ createdAt: -1 }).limit(5)

// Check for sync issues
db.users.find({ 
  provider: 'clerk', 
  clerkId: { $exists: true },
  email: { $exists: false } // Missing email = sync issue
})
```

---

## 🚀 Production Setup

When deploying to production, you don't need ngrok!

### Step 1: Deploy Backend

Deploy to Render, Heroku, AWS, etc. and get your production URL.

**Example:** `https://investing101-api.onrender.com`

### Step 2: Update Clerk Webhook

1. **Go to:** Clerk Dashboard → Webhooks
2. **Edit your endpoint URL:**
   ```
   https://your-production-domain.com/auth/clerk-webhook
   ```
3. **Save changes**

### Step 3: Add Production Secret to `.env`

On your production server:

```bash
CLERK_WEBHOOK_SECRET=whsec_production_secret_here
```

### Step 4: Test Production Webhooks

Sign up a test user and verify:
- ✅ User appears in production MongoDB
- ✅ Clerk Dashboard shows successful delivery
- ✅ Backend logs show successful processing

---

## 🔒 Security Best Practices

### 1. Never Commit Webhook Secret

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

### 2. Use Environment Variables

Always use `process.env.CLERK_WEBHOOK_SECRET`, never hardcode.

### 3. Verify Webhook Signatures

Our implementation uses `svix` library to verify signatures automatically:

```javascript
const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
const payload = wh.verify(body, headers);
```

### 4. Rate Limiting

Consider adding rate limiting for webhook endpoint:

```javascript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.post('/clerk-webhook', webhookLimiter, async (req, res) => {
  // ...
});
```

### 5. Monitor Failed Webhooks

Set up alerts for webhook failures:
- Email notifications
- Slack/Discord webhooks
- Monitoring services (Sentry, Datadog)

---

## 📈 Webhook Events Reference

### `user.created`

**Triggered when:** New user signs up

**Our handler:**
- Creates user in MongoDB
- Sets `provider: 'clerk'`
- Syncs profile data (name, email, avatar)
- Initializes portfolio and settings

**Payload:**
```json
{
  "type": "user.created",
  "data": {
    "id": "user_...",
    "email_addresses": [...],
    "first_name": "John",
    "last_name": "Doe",
    "image_url": "https://...",
    "created_at": 1234567890
  }
}
```

### `user.updated`

**Triggered when:** User profile changes

**Our handler:**
- Updates user in MongoDB
- Syncs changed fields only
- Updates `updatedAt` timestamp

**Common changes:**
- Name updated
- Email verified
- Profile picture changed
- Phone number added

### `user.deleted`

**Triggered when:** User account deleted in Clerk

**Our handler:**
- Soft deletes user (sets `deleted: true`)
- Preserves historical data
- Removes from active queries

**Alternative:** Hard delete (uncomment in `clerkAuth.js`)

---

## 🎯 Alternative: Manual Sync

If you can't use webhooks (firewall, offline dev), users still sync on API requests:

```javascript
// Any protected route with getClerkUser middleware
router.get('/api/profile', getClerkUser, async (req, res) => {
  // req.user is automatically synced from Clerk
  // Works without webhooks!
});
```

**Limitations:**
- Only syncs when user makes API requests
- Profile deletions not detected until API call
- Slightly slower (sync on each request)

---

## ✅ Success Checklist

- [ ] ngrok installed and running (local dev)
- [ ] Webhook endpoint created in Clerk Dashboard
- [ ] Subscribed to `user.created`, `user.updated`, `user.deleted`
- [ ] Webhook secret copied to `.env`
- [ ] Backend restarted with new secret
- [ ] Test sign-up creates user in MongoDB
- [ ] Test profile update syncs to MongoDB
- [ ] Webhook deliveries show success in Clerk Dashboard
- [ ] Backend logs show successful webhook processing
- [ ] No "verification failed" errors

---

## 📚 Resources

- **ngrok Documentation:** https://ngrok.com/docs
- **Clerk Webhooks Guide:** https://clerk.com/docs/integrations/webhooks/overview
- **Svix (Webhook Library):** https://docs.svix.com/
- **Our Implementation:** See `backend/routes/clerkAuth.js`

---

## 🆘 Need Help?

**Check logs:**
```powershell
# Backend logs
cd backend
npm start

# ngrok logs
ngrok http 4000 --log=stdout
```

**Test webhook manually:**
```powershell
curl -X POST https://your-ngrok-url.ngrok.io/auth/clerk-webhook `
  -H "Content-Type: application/json" `
  -d '{"test": true}'
```

**Clerk Dashboard:** Check "Recent Deliveries" for error details

---

**Webhook setup complete! Your app now syncs users in real-time. 🎉**
