# Clerk Environment Variables - Quick Setup

## Required Variables

Add these to your `.env` file in the `backend` directory:

```bash
# ============================================
# CLERK AUTHENTICATION
# ============================================

# Get these from: https://dashboard.clerk.com → Your App → API Keys

# Publishable Key (starts with pk_test_ or pk_live_)
# Used by frontend to connect to Clerk
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Secret Key (starts with sk_test_ or sk_live_)
# Used by backend to verify sessions and call Clerk API
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Webhook Secret (starts with whsec_)
# Get from: https://dashboard.clerk.com → Webhooks → Your Endpoint → Signing Secret
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Frontend Configuration

Update these files with your CLERK_PUBLISHABLE_KEY:

1. **prototype/signin-clerk.html** (line 174)
2. **prototype/signup-clerk.html** (line 174)

Replace:
```html
data-clerk-publishable-key="YOUR_CLERK_PUBLISHABLE_KEY"
```

With:
```html
data-clerk-publishable-key="pk_test_your_actual_key"
```

## How to Get Keys

### 1. Create Clerk Account
- Go to [clerk.com](https://clerk.com)
- Sign up for free
- Create a new application

### 2. Get Publishable & Secret Keys
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Click "API Keys" in sidebar
4. Copy both keys:
   - **Publishable key** → `CLERK_PUBLISHABLE_KEY`
   - **Secret key** → `CLERK_SECRET_KEY`

### 3. Get Webhook Secret
1. Go to "Webhooks" in Clerk Dashboard
2. Click "Add Endpoint"
3. Enter webhook URL:
   - **Local Dev**: Use ngrok: `https://abc123.ngrok.io/auth/clerk-webhook`
   - **Production**: `https://your-domain.com/auth/clerk-webhook`
4. Subscribe to events:
   - ✅ user.created
   - ✅ user.updated
   - ✅ user.deleted
5. Save and copy the "Signing Secret"
6. Add to `.env` as `CLERK_WEBHOOK_SECRET`

## Quick Test

### Backend Test
```bash
cd backend
npm start

# Should see:
# ✅ Clerk authentication initialized
```

### Frontend Test
```bash
# Open in browser:
http://localhost:3000/signin-clerk.html

# Should see Clerk sign-in form
# Try signing up/in with email or Google
```

### Webhook Test (Local Dev)
```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Copy HTTPS URL and add to Clerk webhook
# Example: https://abc123.ngrok.io/auth/clerk-webhook

# Test by creating user in Clerk Dashboard
# Check backend logs for webhook event
```

## Example .env File

```bash
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/investing101

# Clerk Authentication (REQUIRED)
CLERK_PUBLISHABLE_KEY=pk_test_abc123xyz789
CLERK_SECRET_KEY=sk_test_def456uvw012
CLERK_WEBHOOK_SECRET=whsec_ghi789rst345

# JWT (Keep for legacy auth during migration)
JWT_SECRET=your-jwt-secret-key-here
SESSION_SECRET=your-session-secret-here

# Server
PORT=3000
NODE_ENV=development

# App URL (for redirects)
APP_URL=http://localhost:3000
```

## Security Notes

⚠️ **IMPORTANT:**

1. **Never commit .env file** - Add to `.gitignore`
2. **Use different keys** for test vs production
3. **Rotate keys regularly** (every 90 days)
4. **Test keys** start with `pk_test_` / `sk_test_`
5. **Production keys** start with `pk_live_` / `sk_live_`

## Troubleshooting

### "Clerk authentication disabled" warning
- Check that `CLERK_SECRET_KEY` is set in `.env`
- Restart backend server after adding keys

### "Failed to load authentication" on frontend
- Check that `CLERK_PUBLISHABLE_KEY` matches your backend secret key environment (both test or both live)
- Verify key is correctly placed in HTML file
- Check browser console for errors

### Webhook not working
- Verify webhook URL is accessible from internet
- Use ngrok for local development
- Check `CLERK_WEBHOOK_SECRET` matches Dashboard
- Verify endpoint is: `/auth/clerk-webhook`

## Migration from Google OAuth

### Keep During Migration
```bash
# Optional: Keep these during migration period
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Remove After Migration
Once all users are migrated to Clerk:
```bash
# Can remove these:
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# FACEBOOK_APP_ID=...
# FACEBOOK_APP_SECRET=...
```

## Need Help?

- 📚 Full guide: See `CLERK_MIGRATION_GUIDE.md`
- 🌐 Clerk Docs: https://clerk.com/docs
- 💬 Support: https://clerk.com/discord
- 📧 Email: support@clerk.com (Pro plans)

---

**Quick Start Checklist:**

- [ ] Sign up at clerk.com
- [ ] Create application
- [ ] Copy publishable key to `.env`
- [ ] Copy secret key to `.env`
- [ ] Set up webhook endpoint
- [ ] Copy webhook secret to `.env`
- [ ] Update frontend HTML files with publishable key
- [ ] Restart backend server
- [ ] Test sign-in at `/signin-clerk.html`
- [ ] Verify user appears in MongoDB

**Ready to go!** 🚀
