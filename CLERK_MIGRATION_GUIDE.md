# Clerk Authentication Migration Guide

## Overview

This guide documents the migration from Google OAuth/Passport.js to Clerk authentication. Clerk provides a more comprehensive authentication solution with better UI components, session management, and support for multiple auth methods.

## Benefits of Clerk

### Why Clerk?

1. **Pre-built UI Components** - Beautiful, customizable sign-in/sign-up forms
2. **Multiple Auth Methods** - Email/password, Google, GitHub, Microsoft, and more
3. **Better Session Management** - Secure, JWT-based sessions with automatic refresh
4. **User Management Dashboard** - Easy-to-use admin interface
5. **Webhooks** - Real-time sync of user data
6. **Two-Factor Authentication** - Built-in 2FA support
7. **Magic Links** - Passwordless authentication
8. **Developer Experience** - Simple SDK, excellent documentation

### What Changed?

| Before (Passport.js) | After (Clerk) |
|---------------------|---------------|
| passport.js configuration | clerkAuth.js middleware |
| Custom OAuth routes | Clerk managed auth |
| Manual session handling | Automatic session management |
| Custom sign-in/sign-up forms | Clerk pre-built components |
| JWT token management | Clerk handles tokens |
| Manual user sync | Webhook-based sync |

---

## Setup Instructions

### 1. Create Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Choose your framework (select "JavaScript" for this project)

### 2. Get API Keys

From the Clerk Dashboard, you'll need three keys:

1. **Publishable Key** - For frontend (starts with `pk_`)
2. **Secret Key** - For backend (starts with `sk_`)
3. **Webhook Secret** - For webhook verification (starts with `whsec_`)

### 3. Configure Environment Variables

Add these to your `.env` file:

```bash
# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Optional: Keep for migration period
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Configure Clerk Dashboard

#### Application Settings

1. Go to **Settings** → **General**
2. Set **Application Name**: "Investing101"
3. Set **Application Logo**: Upload your logo

#### Social Connections

1. Go to **User & Authentication** → **Social Connections**
2. Enable the providers you want:
   - ✅ Google
   - ✅ GitHub
   - ✅ Microsoft
   - ✅ Apple (requires additional setup)

#### Email & Password

1. Go to **User & Authentication** → **Email & Password**
2. Configure settings:
   - ✅ Enable email verification
   - ✅ Enable password strength requirements
   - ✅ Allow email addresses as usernames

#### Session Settings

1. Go to **User & Authentication** → **Sessions**
2. Configure:
   - **Session lifetime**: 7 days
   - **Inactivity timeout**: 1 day
   - **Multi-session handling**: Allow multiple sessions

#### Redirect URLs

1. Go to **Settings** → **Paths**
2. Configure URLs:
   - **Sign-in redirect**: `/index.html`
   - **Sign-up redirect**: `/onboarding.html`
   - **Sign-out redirect**: `/signin.html`
   - **Home URL**: `/index.html`

### 5. Setup Webhooks

#### Create Webhook Endpoint

1. Go to **Webhooks** in Clerk Dashboard
2. Click **Add Endpoint**
3. Enter your webhook URL:
   - **Development**: `https://your-ngrok-url.ngrok.io/auth/clerk-webhook`
   - **Production**: `https://your-domain.com/auth/clerk-webhook`

#### Subscribe to Events

Enable these webhook events:

- ✅ `user.created` - When a new user signs up
- ✅ `user.updated` - When user profile is updated
- ✅ `user.deleted` - When user account is deleted
- ✅ `session.created` - When user signs in (optional)
- ✅ `session.ended` - When user signs out (optional)

#### Copy Webhook Secret

1. After creating the webhook, copy the **Signing Secret**
2. Add to `.env` as `CLERK_WEBHOOK_SECRET`

### 6. Update Frontend Files

#### Replace Publishable Key

In the following files, replace `YOUR_CLERK_PUBLISHABLE_KEY` with your actual key:

1. **prototype/signin-clerk.html**
2. **prototype/signup-clerk.html**

```html
<!-- Replace this line: -->
<script
  data-clerk-publishable-key="YOUR_CLERK_PUBLISHABLE_KEY"
  ...
></script>

<!-- With your actual key: -->
<script
  data-clerk-publishable-key="pk_test_your_actual_key_here"
  ...
></script>
```

#### Update Frontend API URL

Also replace `YOUR_CLERK_FRONTEND_API_URL` with your Clerk frontend API URL (found in Dashboard → API Keys).

### 7. Test the Integration

#### Backend Test

```bash
# Start the backend
cd backend
npm start

# Server should log:
# ✅ Clerk authentication initialized
```

#### Frontend Test

1. Open `http://localhost:3000/signin-clerk.html`
2. You should see the Clerk sign-in component
3. Try signing in with:
   - Email/password
   - Google
   - Any other enabled provider

#### Webhook Test (Development)

For local development, use [ngrok](https://ngrok.com):

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Add to Clerk Dashboard webhooks as:
# https://abc123.ngrok.io/auth/clerk-webhook
```

Test webhook by:
1. Creating a new user in Clerk Dashboard
2. Check backend logs for: `📥 Clerk webhook received: user.created`
3. Verify user created in MongoDB

---

## Migration Strategy

### Phase 1: Parallel Operation (Recommended)

Run Clerk alongside existing OAuth for smooth transition:

```javascript
// backend/index.js
// Both systems active
app.use('/auth', clerkAuthRouter);      // New Clerk routes
app.use('/auth/legacy', oauthRouter);   // Old OAuth routes
```

**Frontend:**
- Keep old signin.html (Google OAuth)
- Add signin-clerk.html (new Clerk)
- Let users choose which to use

### Phase 2: Gradual Migration

1. **Week 1**: Launch Clerk, monitor for issues
2. **Week 2**: Promote Clerk as default, keep OAuth as fallback
3. **Week 3**: Migrate existing users (see below)
4. **Week 4**: Deprecate OAuth, make Clerk only option

### Phase 3: Complete Migration

After all users migrated:

```javascript
// Remove Passport.js dependencies
npm uninstall passport passport-google-oauth20 passport-facebook

// Remove files
rm backend/passport.js
rm backend/routes/auth.js (old OAuth routes)

// Update index.js
// Remove passport imports and initialization
```

---

## User Data Migration

### Automatic Migration (Recommended)

Clerk webhooks automatically handle new users. For existing users:

```javascript
// backend/routes/clerkAuth.js
// Webhook handler already includes migration logic

// When user signs in with Clerk for first time:
// 1. Check if email exists in database
// 2. If yes, link Clerk ID to existing account
// 3. If no, create new account
```

### Manual Migration Script

For bulk migration of existing users:

```javascript
// backend/scripts/migrateUsersToClerk.js

const User = require('../models/User');
const { clerkClient } = require('@clerk/clerk-sdk-node');

async function migrateUsers() {
  const users = await User.find({ provider: { $ne: 'clerk' } });
  
  for (const user of users) {
    try {
      // Create Clerk user
      const clerkUser = await clerkClient.users.createUser({
        emailAddress: [user.email],
        username: user.username,
        firstName: user.displayName?.split(' ')[0],
        lastName: user.displayName?.split(' ').slice(1).join(' '),
        skipPasswordChecks: true, // They'll reset password via email
      });
      
      // Update local user
      user.clerkId = clerkUser.id;
      user.provider = 'clerk';
      user.providerId = clerkUser.id;
      await user.save();
      
      // Send password reset email
      await clerkClient.users.sendPasswordResetEmail(user.email);
      
      console.log(`✅ Migrated user: ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to migrate user ${user.email}:`, error);
    }
  }
}

migrateUsers();
```

---

## Code Changes Summary

### Files Modified

#### Backend

| File | Change | Purpose |
|------|--------|---------|
| `backend/clerkAuth.js` | Created | Clerk middleware and user sync |
| `backend/routes/clerkAuth.js` | Created | Webhook handlers, session endpoint |
| `backend/models/User.js` | Updated | Added `clerkId` field, `clerk` provider |
| `backend/index.js` | Updated | Replaced Passport with Clerk |
| `backend/package.json` | Updated | Added Clerk dependencies |

#### Frontend

| File | Change | Purpose |
|------|--------|---------|
| `prototype/signin-clerk.html` | Created | New Clerk sign-in page |
| `prototype/signup-clerk.html` | Created | New Clerk sign-up page |
| `prototype/auth-widget.js` | Update Needed | Replace JWT with Clerk session |

### New Dependencies

```json
{
  "@clerk/clerk-sdk-node": "^4.x.x",
  "svix": "^1.x.x"
}
```

### Environment Variables

```bash
# Required
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Optional (for migration period)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## API Changes

### Authentication Endpoints

#### New Endpoints (Clerk)

```
POST /auth/clerk-webhook        # Handles Clerk webhooks
GET  /auth/session              # Get current user session
POST /auth/sign-out             # Confirm sign-out
```

#### Deprecated Endpoints (OAuth)

```
GET  /auth/google               # Replaced by Clerk
GET  /auth/google/callback      # Replaced by Clerk
GET  /auth/facebook             # Replaced by Clerk
GET  /auth/facebook/callback    # Replaced by Clerk
```

### Protected Routes

#### Before (Passport)

```javascript
const passport = require('passport');

router.get('/protected', 
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // Handler
  }
);
```

#### After (Clerk)

```javascript
const { getClerkUser } = require('../clerkAuth');

router.get('/protected', 
  getClerkUser,
  (req, res) => {
    // req.user is now populated by Clerk
    // Handler
  }
);
```

### Session Management

#### Before (JWT)

```javascript
// Manually check JWT token
const token = req.cookies.authToken;
const decoded = jwt.verify(token, JWT_SECRET);
const user = await User.findById(decoded.userId);
```

#### After (Clerk)

```javascript
// Clerk handles session automatically
const { getClerkUser } = require('../clerkAuth');

router.get('/api/user', getClerkUser, (req, res) => {
  // req.user is automatically populated
  res.json({ user: req.user });
});
```

---

## Frontend Integration

### Check Authentication Status

```javascript
// Check if user is signed in
async function checkAuth() {
  const response = await fetch('/auth/session');
  const data = await response.json();
  
  if (data.authenticated) {
    console.log('User signed in:', data.user);
    return data.user;
  } else {
    console.log('User not signed in');
    return null;
  }
}
```

### Sign Out

```javascript
// Sign out user
async function signOut() {
  // Sign out from Clerk
  await window.Clerk.signOut();
  
  // Notify backend
  await fetch('/auth/sign-out', { method: 'POST' });
  
  // Redirect to sign-in page
  window.location.href = '/signin.html';
}
```

### Get Current User

```javascript
// Get current user from Clerk
async function getCurrentUser() {
  if (window.Clerk && window.Clerk.user) {
    return window.Clerk.user;
  }
  return null;
}
```

---

## Troubleshooting

### Webhook Not Receiving Events

1. **Check URL**: Verify webhook URL is correct in Clerk Dashboard
2. **Check Secret**: Ensure `CLERK_WEBHOOK_SECRET` matches Dashboard
3. **Check Firewall**: Make sure port is accessible from Clerk servers
4. **Use ngrok**: For local development, use ngrok tunnel
5. **Check Logs**: Look for webhook errors in backend logs

### User Not Syncing

1. **Check clerkId**: Verify user has `clerkId` field in MongoDB
2. **Check Provider**: Ensure `provider` is set to `'clerk'`
3. **Re-trigger Webhook**: Create/update user in Clerk Dashboard
4. **Check Middleware**: Verify `syncClerkUser` is called

### Authentication Errors

1. **Check Keys**: Verify all environment variables are set correctly
2. **Check Expiry**: Publishable key should match secret key (both test or both production)
3. **Check CORS**: Ensure Clerk domain is allowed in CORS settings
4. **Clear Cache**: Try clearing browser cache and cookies

### Session Not Persisting

1. **Check Cookie Settings**: Ensure cookies are enabled
2. **Check HTTPS**: Clerk requires HTTPS in production
3. **Check Session Lifetime**: Verify session settings in Clerk Dashboard
4. **Check Middleware Order**: Clerk middleware must be before route handlers

---

## Security Considerations

### Best Practices

1. **Never Commit Keys**: Add `.env` to `.gitignore`
2. **Use Environment Variables**: Never hardcode keys in code
3. **Rotate Keys Regularly**: Change keys every 90 days
4. **Use HTTPS**: Always use HTTPS in production
5. **Verify Webhooks**: Always verify webhook signatures
6. **Limit Permissions**: Use least-privilege access
7. **Monitor Logs**: Watch for suspicious activity

### Rate Limiting

Clerk includes built-in rate limiting. For additional protection:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/auth', limiter);
```

---

## Cost Considerations

### Clerk Pricing

- **Free Tier**: 5,000 monthly active users (MAUs)
- **Pro Tier**: $25/month + $0.02 per MAU over 5,000
- **Enterprise**: Custom pricing for large deployments

### What's Included

- ✅ Unlimited applications
- ✅ All authentication methods
- ✅ Webhooks
- ✅ User management dashboard
- ✅ Email support
- ✅ 2FA and MFA
- ✅ Custom branding (Pro+)
- ✅ Advanced security features

---

## Testing Checklist

### Before Deployment

- [ ] Clerk keys configured in `.env`
- [ ] Webhook URL configured and verified
- [ ] Sign-up flow tested (email, Google, etc.)
- [ ] Sign-in flow tested
- [ ] Sign-out flow tested
- [ ] User data syncs to MongoDB
- [ ] Existing OAuth users can migrate
- [ ] Protected routes require authentication
- [ ] Session persists across page reloads
- [ ] 404 errors handled gracefully
- [ ] Error messages are user-friendly

### After Deployment

- [ ] Monitor webhook deliveries in Clerk Dashboard
- [ ] Check user creation rate
- [ ] Verify no authentication errors in logs
- [ ] Test from different browsers/devices
- [ ] Test with slow network connections
- [ ] Monitor MongoDB for duplicate users
- [ ] Check session timeout behavior
- [ ] Verify email delivery

---

## Support Resources

### Documentation

- **Clerk Docs**: https://clerk.com/docs
- **Clerk Node SDK**: https://clerk.com/docs/reference/node
- **Clerk JavaScript SDK**: https://clerk.com/docs/reference/clerk-js

### Community

- **Discord**: https://clerk.com/discord
- **GitHub**: https://github.com/clerkinc/javascript
- **Stack Overflow**: Tag `clerk`

### Need Help?

1. Check Clerk documentation
2. Search Clerk Discord
3. Check backend logs for errors
4. Contact Clerk support (Pro+ plans)

---

## Next Steps

After completing migration:

1. **Update auth-widget.js** to use Clerk sessions
2. **Update all protected routes** to use `getClerkUser`
3. **Remove Passport.js** dependencies and code
4. **Enable additional auth methods** (GitHub, Apple, etc.)
5. **Set up custom branding** in Clerk Dashboard
6. **Configure email templates** for better UX
7. **Enable two-factor authentication**
8. **Set up analytics** to track auth metrics

---

## Rollback Plan

If issues arise, rollback is simple:

1. **Revert backend/index.js**:
   ```javascript
   // Restore Passport
   app.use(passport.initialize());
   app.use(passport.session());
   
   // Restore OAuth routes
   app.use('/auth', oauthRouter);
   ```

2. **Restore signin/signup.html**: Remove `-clerk` suffix or revert to old files

3. **Keep User Data**: clerkId field won't affect existing functionality

4. **No Data Loss**: All user data remains in MongoDB

---

**Migration Complete!** 🎉

Your application now uses Clerk for authentication with better security, UX, and scalability.
