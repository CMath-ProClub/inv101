# 🔐 Testing Clerk Authentication

## ✅ Current Status

**Backend**: ✅ Running on `http://localhost:4000`  
**Clerk Integration**: ✅ Initialized successfully  
**Frontend Pages**: ✅ Ready to test  
**API Keys**: ✅ Configured in `.env` and HTML files

---

## 🧪 Quick Test Steps

### 1. Test Sign-Up Flow

```bash
# Open in your browser:
http://localhost:4000/signup-clerk.html
```

**What to expect:**
- ✅ Beautiful Clerk sign-up form loads
- ✅ Can sign up with email + password
- ✅ Receives verification email
- ✅ After verification, redirects to `/onboarding.html`
- ✅ User created in your MongoDB with `clerkId` field

### 2. Test Sign-In Flow

```bash
# Open in your browser:
http://localhost:4000/signin-clerk.html
```

**What to expect:**
- ✅ Clerk sign-in form loads
- ✅ Can sign in with existing email + password
- ✅ After sign-in, redirects to `/index.html`
- ✅ Session cookie is set automatically

### 3. Test Session Endpoint

```bash
# In a new PowerShell window (while signed in):
curl http://localhost:4000/auth/session -UseBasicParsing
```

**Expected response (if signed in):**
```json
{
  "authenticated": true,
  "user": {
    "clerkId": "user_...",
    "email": "your-email@example.com",
    "firstName": "Your",
    "lastName": "Name",
    "profileImage": "https://...",
    ...
  }
}
```

**Expected response (if NOT signed in):**
```json
{
  "authenticated": false,
  "user": null
}
```

### 4. Check MongoDB

```bash
# In MongoDB Compass or mongo shell:
db.users.find({ provider: 'clerk' })
```

**Expected:**
- New user document with `clerkId: "user_..."`
- `provider: "clerk"`
- Email and profile data synced from Clerk

---

## 🎯 Test Checklist

- [ ] Sign-up page loads Clerk component
- [ ] Can create new account with email
- [ ] Receives verification email
- [ ] Can verify email and complete sign-up
- [ ] Redirects to onboarding after sign-up
- [ ] Sign-in page loads Clerk component
- [ ] Can sign in with existing credentials
- [ ] Redirects to index after sign-in
- [ ] Session persists across page refreshes
- [ ] `/auth/session` returns user data when signed in
- [ ] User appears in MongoDB with `clerkId`
- [ ] Can sign out (via Clerk UI)

---

## 🔗 Next Steps After Testing

### 1. Setup Webhook (Optional but Recommended)

See `CLERK_MIGRATION_GUIDE.md` for detailed webhook setup instructions.

### 2. Migrate Protected Routes

Update existing protected routes to use Clerk middleware - see `CLERK_MIGRATION_COMPLETE.md` for examples.

### 3. Update `auth-widget.js`

Replace JWT-based checks with Clerk session checks - see migration guide for details.

---

## 🐛 Troubleshooting

See `CLERK_MIGRATION_GUIDE.md` for comprehensive troubleshooting guide.

---

## ✅ Success!

**Your Clerk authentication is fully configured and ready to test! 🎉**

Start testing at: **http://localhost:4000/signin-clerk.html**

## Overview
Your backend has **two separate authentication systems**:

1. **Email/Password Auth** → `/api/auth/*` (apiAuth.js)
2. **OAuth Providers** → `/auth/*` (auth.js) - Google, Facebook

The server is now running with updated OAuth configuration. Follow this guide to test both systems.

---

## Prerequisites

### Server Status
✅ Backend is running on `http://localhost:4000`  
✅ MongoDB Atlas connected  
✅ Environment variables loaded:
- `APP_URL=http://localhost:4000`
- `GOOGLE_CLIENT_ID` (from your .env file)
- `GOOGLE_CLIENT_SECRET` (from your .env file)

---

## Test 1: Email/Password Signup

### What This Tests
- Email/password user creation
- JWT token generation
- Cookie authentication

### Steps
1. **Open signup page**: `http://localhost:4000/signup.html`

2. **Fill out the form**:
   - Email: Use a real email you have access to
   - Display Name: Any name you want
   - Password: At least 6 characters
   - Check "I agree to Terms of Service"

3. **Click "Create Account"**

### Expected Results
✅ **Success**: 
- Brief "Account created successfully!" message
- Automatic redirect to `/profile.html`
- You're logged in with cookies set:
  - `inv101_token` (access token)
  - `inv101_refresh` (refresh token)

❌ **If it fails**:
- Check browser console (F12 → Console) for errors
- Check backend terminal for error messages
- Common issues:
  - Email already exists → Use a different email
  - Weak password → Must be 6+ characters
  - MongoDB connection issue → Check backend logs

### Debugging
If signup fails, open browser DevTools (F12) and check:
1. **Console tab**: Look for fetch errors or JavaScript errors
2. **Network tab**: 
   - Find the POST to `/api/auth/signup`
   - Check status code (should be 200)
   - Check response body for error details

---

## Test 2: Email/Password Login

### What This Tests
- Password verification
- JWT token refresh
- Session persistence

### Steps
1. **Open signin page**: `http://localhost:4000/signin.html`

2. **Fill out the form**:
   - Email: The email you used to sign up
   - Password: Your password
   - (Optional) Check "Remember me" for 30-day session

3. **Click "Sign In"**

### Expected Results
✅ **Success**: 
- Brief "Signed in successfully!" message
- Automatic redirect to `/index.html` (dashboard)
- You're logged in with valid session

❌ **If it fails**:
- Check for "Invalid credentials" error
- Verify you're using the correct email/password
- Make sure account was created successfully in Test 1

---

## Test 3: Google OAuth Login

### What This Tests
- Google OAuth flow
- OAuth callback handling
- JWT token issuance after OAuth
- Proper redirects

### Google "Dangerous App" Warning
⚠️ You **WILL** see this warning because your OAuth app isn't verified yet:

```
Google hasn't verified this app
This app hasn't been verified by Google yet. Only continue if you trust the developer.
```

**This is NORMAL and expected!** You have two options:

#### Option A: Continue Anyway (Quick Test)
1. Click "Continue" or "Advanced" → "Go to inv101 (unsafe)"
2. You'll be able to sign in despite the warning
3. Use this for testing, but users will see this scary message

#### Option B: Add Test Users (Better Experience)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to: **APIs & Services** → **OAuth consent screen**
4. Scroll to **"Test users"** section
5. Click **"+ ADD USERS"**
6. Add your email address (the one you'll use to sign in)
7. Click **Save**

Now when you sign in with that email, you'll bypass the "dangerous app" warning!

### Steps
1. **Open signin page**: `http://localhost:4000/signin.html`

2. **Click "Continue with Google"** button

3. **Handle the warning** (see above)

4. **Select your Google account**

5. **Grant permissions** (if prompted):
   - View your email address
   - View your basic profile info

### Expected Results
✅ **Success**: 
- OAuth consent screen shows your app name
- After granting permissions, redirects to callback
- Backend creates/updates your user account
- Issues JWT tokens
- Redirects to `/index.html` (dashboard)
- You're logged in

❌ **If it fails**:
- Check backend terminal for errors
- Common issues:
  - **"Redirect URI mismatch"**: 
    - Go to Google Cloud Console
    - Check authorized redirect URIs
    - Should include: `http://localhost:4000/auth/google/callback`
  - **"Invalid client"**: 
    - Verify `GOOGLE_CLIENT_ID` is correct in `.env`
  - **"Internal Server Error"**: 
    - Check backend logs
    - Verify `APP_URL` is set correctly
    - Make sure server restarted after adding `APP_URL`

### Debugging OAuth Callback
If OAuth redirects but fails:
1. **Check URL after redirect**: Should be `/index.html`
2. **Check browser cookies** (F12 → Application → Cookies):
   - Should see `inv101_token`
   - Should see `inv101_refresh`
3. **Check backend terminal**: Look for error messages during callback
4. **Check Network tab**: Look for POST to `/auth/google/callback`

---

## Test 4: Protected Routes

### What This Tests
- JWT authentication middleware
- Cookie-based session validation
- Access control

### Steps
1. **Make sure you're logged in** (from Test 1, 2, or 3)

2. **Visit protected routes**:
   - `http://localhost:4000/portfolio.html`
   - `http://localhost:4000/my-profile.html`
   - `http://localhost:4000/api/auth/me` (API endpoint)

### Expected Results
✅ **Success**: 
- Pages load correctly
- No redirect to signin
- `/api/auth/me` returns your user data (JSON)

❌ **If it fails**:
- Redirects to `/signin.html` → Your tokens expired or invalid
- 401 error → Authentication required
- Sign out and sign back in to get fresh tokens

---

## Test 5: Logout

### What This Tests
- Session termination
- Cookie clearing
- Redirect to public area

### Steps
1. **Make sure you're logged in**

2. **Click "Sign Out"** in the header/sidebar

### Expected Results
✅ **Success**: 
- Cookies cleared (`inv101_token` and `inv101_refresh` deleted)
- Redirect to `/signin.html` or homepage
- Refresh token removed from database
- Cannot access protected routes anymore

---

## Common Issues & Solutions

### Issue: "Unable to create account"
**Causes**:
- Email already exists
- Password too short
- MongoDB connection issue
- Validation error

**Solutions**:
1. Try a different email
2. Use password with 6+ characters
3. Check backend logs for specific error
4. Verify MongoDB connection in backend startup logs

---

### Issue: "Invalid credentials" on login
**Causes**:
- Wrong email/password
- Account doesn't exist
- Password not hashed correctly

**Solutions**:
1. Verify email spelling (case-sensitive)
2. Try resetting password (if implemented)
3. Create new account with same email
4. Check backend logs for authentication errors

---

### Issue: Google OAuth shows "Redirect URI mismatch"
**Cause**: Google doesn't recognize the callback URL

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:4000/auth/google/callback
   ```
5. Click **Save**
6. Wait 5 minutes for changes to propagate
7. Try again

---

### Issue: "Internal Server Error" after Google login
**Causes**:
- `APP_URL` not set
- Server not restarted after `.env` changes
- JWT_SECRET missing
- Database connection issue

**Solutions**:
1. Check `backend/.env` has `APP_URL=http://localhost:4000`
2. Restart backend: `cd backend && npm start`
3. Check JWT_SECRET is set in `.env`
4. Check backend logs for specific error

---

### Issue: Cookies not being set
**Causes**:
- CORS configuration blocking cookies
- Browser blocking third-party cookies
- Incorrect cookie domain

**Solutions**:
1. Check browser DevTools → Application → Cookies
2. Make sure you're on `localhost:4000` (not `127.0.0.1`)
3. Check backend CORS configuration allows credentials
4. Check `authTokens.js` cookie settings

---

## Architecture Overview

### Email/Password Flow
```
User → signup.html → POST /api/auth/signup → apiAuth.js
                                             ↓
                                    User.createWithPassword()
                                             ↓
                                      issueTokens(res, user)
                                             ↓
                                    Set cookies, return success
                                             ↓
                              Redirect to /profile.html
```

### Google OAuth Flow
```
User → Click Google button → GET /auth/google → passport.authenticate
                                                        ↓
                                              Redirect to Google
                                                        ↓
                                        User grants permissions
                                                        ↓
                                  Google → GET /auth/google/callback
                                                        ↓
                                           passport.authenticate
                                                        ↓
                                         Find/create user in DB
                                                        ↓
                                          issueTokens(res, user)
                                                        ↓
                                     Set cookies, redirect to /index.html
```

### JWT Authentication
```
Cookie: inv101_token (access token)
- Expires: 15 minutes (or 30 days with "Remember me")
- Contains: { sub: userId, email: user.email }
- Used for: API requests, protected routes

Cookie: inv101_refresh (refresh token)
- Expires: 30 days
- Contains: { jti: tokenId }
- Used for: Getting new access tokens when expired
- Stored in: user.refreshTokens array in DB
```

---

## Production Deployment Checklist

Before deploying to Render:

1. **Update environment variables on Render**:
   ```
   APP_URL=https://inv101.onrender.com
   GOOGLE_CLIENT_ID=(same as local)
   GOOGLE_CLIENT_SECRET=(same as local)
   JWT_SECRET=(keep your current value)
   MONGODB_URI=(keep your current value)
   ```

2. **Update Google Cloud Console**:
   - Add authorized redirect URI: `https://inv101.onrender.com/auth/google/callback`
   - Keep localhost URI for local development

3. **OAuth Consent Screen**:
   - Publishing status: Testing (for now)
   - Add test users who should be able to sign in
   - Later: Submit for verification to remove "dangerous app" warning

4. **Deploy and test**:
   - Deploy to Render
   - Test email signup on production URL
   - Test Google OAuth on production URL
   - Monitor Render logs for errors

---

## Next Steps

1. ✅ Test email signup
2. ✅ Test email login
3. ✅ Test Google OAuth
4. ⏳ Add test users to Google OAuth (optional but recommended)
5. ⏳ Test on production (Render)
6. ⏳ Submit Google OAuth app for verification (removes warning)

---

## Support

If you encounter issues not covered here:

1. **Check backend logs**: Look at terminal output
2. **Check browser console**: F12 → Console tab
3. **Check Network tab**: F12 → Network tab, filter by Fetch/XHR
4. **Check cookies**: F12 → Application → Cookies
5. **Review error messages**: They usually indicate the problem

---

**Commit**: `315d7cf` - OAuth authentication flow fixes  
**Date**: November 6, 2025  
**Status**: Ready for testing
