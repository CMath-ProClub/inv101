# OAuth Implementation Guide

This guide will help you set up Google and Facebook OAuth for Investing101.

## Current Status

✅ **Backend OAuth Routes**: Already configured in `backend/passport.js`  
✅ **Frontend OAuth Buttons**: Implemented on signin and signup pages  
❌ **OAuth Credentials**: Need to be added to `.env` file  

---

## Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it something like "Investing101"

### Step 2: Enable Google+ API

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **Enable**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in:
     - App name: `Investing101`
     - User support email: Your email
     - Developer contact: Your email
   - Save and continue through the scopes (leave defaults)
   - Add test users if needed

4. Back in Create OAuth client ID:
   - Application type: **Web application**
   - Name: `Investing101 Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:4000`
     - `https://inv101.onrender.com` (your production URL)
   - **Authorized redirect URIs**:
     - `http://localhost:4000/auth/google/callback`
     - `https://inv101.onrender.com/auth/google/callback`

5. Click **CREATE**
6. Copy the **Client ID** and **Client Secret**

### Step 4: Add to Environment Variables

Add these to `backend/.env`:

```env
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
```

For production (Render.com), add these environment variables:
- `GOOGLE_CLIENT_ID`: Your Google Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google Client Secret
- `GOOGLE_CALLBACK_URL`: `https://inv101.onrender.com/auth/google/callback`

---

## Facebook OAuth Setup

### Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose **Consumer** as the app type
4. Fill in:
   - App name: `Investing101`
   - App contact email: Your email
5. Click **Create App**

### Step 2: Add Facebook Login Product

1. In your app dashboard, find **Facebook Login** in the products list
2. Click **Set Up**
3. Choose **Web** platform
4. Enter your site URL: `http://localhost:4000` (or your production URL)

### Step 3: Configure OAuth Redirect URIs

1. Go to **Facebook Login** → **Settings** in the left sidebar
2. Under **Valid OAuth Redirect URIs**, add:
   - `http://localhost:4000/auth/facebook/callback`
   - `https://inv101.onrender.com/auth/facebook/callback`
3. Click **Save Changes**

### Step 4: Get App Credentials

1. Go to **Settings** → **Basic** in the left sidebar
2. You'll see:
   - **App ID** (this is your Facebook App ID)
   - **App Secret** (click Show to reveal it)

### Step 5: Add to Environment Variables

Add these to `backend/.env`:

```env
FACEBOOK_APP_ID=your_actual_facebook_app_id_here
FACEBOOK_APP_SECRET=your_actual_facebook_app_secret_here
FACEBOOK_CALLBACK_URL=http://localhost:4000/auth/facebook/callback
```

For production (Render.com), add these environment variables:
- `FACEBOOK_APP_ID`: Your Facebook App ID
- `FACEBOOK_APP_SECRET`: Your Facebook App Secret
- `FACEBOOK_CALLBACK_URL`: `https://inv101.onrender.com/auth/facebook/callback`

### Step 6: Make App Public (For Production)

1. In your Facebook app dashboard, go to **Settings** → **Basic**
2. Scroll down and toggle **App Mode** from "Development" to "Live"
3. You may need to complete additional verification steps

---

## Complete .env File Example

Your `backend/.env` should look like this:

```env
# Server
PORT=4000
APP_URL=http://localhost:4000

# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Secrets
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Session
SESSION_SECRET=your_session_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=abcdef1234567890abcdef1234567890
FACEBOOK_CALLBACK_URL=http://localhost:4000/auth/facebook/callback

# Market Data APIs (optional)
POLYGON_API_KEY=your_polygon_key_if_you_have_one
ALPHAVANTAGE_API_KEY=your_alphavantage_key_if_you_have_one
```

---

## Testing OAuth Flow

### Local Testing

1. Make sure all environment variables are set in `backend/.env`
2. Restart your backend server: `cd backend && node index.js`
3. Open `http://localhost:4000/signin.html`
4. Click "Sign in with Google" or "Sign in with Facebook"
5. You should be redirected to Google/Facebook for authentication
6. After approval, you'll be redirected back and logged in

### Production Testing (Render.com)

1. Add all OAuth environment variables in Render dashboard
2. Make sure callback URLs use `https://inv101.onrender.com`
3. Deploy your changes
4. Test on your live site

---

## Troubleshooting

### "Internal Server Error" when clicking OAuth button

**Cause**: Missing environment variables

**Fix**: 
1. Check that `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, etc. are set in `.env`
2. Restart your server after adding them
3. Check `backend/index.js` logs for specific error messages

### "Redirect URI mismatch" error

**Cause**: The callback URL in your OAuth app doesn't match the one in your code

**Fix**:
1. Make sure the redirect URI in Google Cloud Console matches exactly: `http://localhost:4000/auth/google/callback`
2. For Facebook, check **Facebook Login** → **Settings** → **Valid OAuth Redirect URIs**
3. URLs are case-sensitive and must match exactly (http vs https, trailing slash, etc.)

### OAuth works locally but not in production

**Cause**: Production callback URLs not configured

**Fix**:
1. Add production URLs to authorized redirect URIs in both Google and Facebook
2. Update `GOOGLE_CALLBACK_URL` and `FACEBOOK_CALLBACK_URL` environment variables on Render to use `https://inv101.onrender.com`
3. Facebook: Make sure your app is in "Live" mode, not "Development"

### User gets logged in but redirected to a blank page

**Cause**: OAuth callback is completing but redirect path is wrong

**Fix**: Check `backend/passport.js` - after successful auth, users should be redirected to `/` or your dashboard page

---

## Security Best Practices

1. **Never commit `.env` files to Git** - they contain sensitive credentials
2. **Use different OAuth apps for development and production**
3. **Regularly rotate your secrets** - especially if you suspect they've been exposed
4. **Limit OAuth scopes** - only request the permissions you actually need (email, profile)
5. **Enable 2FA** on your Google Cloud and Facebook developer accounts

---

## Next Steps

Once OAuth is working:

1. ✅ Users can sign in with Google/Facebook
2. ✅ User profiles are automatically created with email and name
3. ✅ Sessions are managed with JWT tokens
4. Consider adding:
   - Profile picture sync from Google/Facebook
   - Email verification for traditional signups
   - "Link Google/Facebook account" option for existing users
   - Account deletion/unlinking features

---

## Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Passport.js Facebook Strategy](http://www.passportjs.org/packages/passport-facebook/)
