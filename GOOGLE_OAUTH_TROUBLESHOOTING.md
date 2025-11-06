# Google OAuth Troubleshooting Guide

## Current Configuration

### Environment Variables (backend/.env)
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
APP_URL=http://localhost:4000
```

### Callback URL
The application uses: `http://localhost:4000/auth/google/callback`

## Google Cloud Console Setup

### 1. OAuth Consent Screen
- Go to: https://console.cloud.google.com/apis/credentials/consent
- **Application name**: Investing101
- **User support email**: Your email
- **Authorized domains**: 
  - `localhost` (for development)
  - Your production domain (when deploying)
- **Scopes**: 
  - `userinfo.email`
  - `userinfo.profile`

### 2. OAuth 2.0 Client ID
- Go to: https://console.cloud.google.com/apis/credentials
- Click "Create Credentials" → "OAuth client ID"
- **Application type**: Web application
- **Name**: Investing101 Web Client

#### Authorized JavaScript origins:
```
http://localhost:4000
http://127.0.0.1:4000
```

#### Authorized redirect URIs:
```
http://localhost:4000/auth/google/callback
http://127.0.0.1:4000/auth/google/callback
```

**For Production (Render):**
```
https://your-app-name.onrender.com/auth/google/callback
```

### 3. Enable Google+ API
- Go to: https://console.cloud.google.com/apis/library
- Search for "Google+ API"
- Click "Enable"

## Common Issues & Solutions

### Issue 1: "redirect_uri_mismatch" Error
**Solution**: Make sure the redirect URI in Google Console EXACTLY matches:
- `http://localhost:4000/auth/google/callback` (development)
- `https://your-app.onrender.com/auth/google/callback` (production)

### Issue 2: "Internal Server Error" on Callback
**Possible Causes**:
1. MongoDB connection issue
2. Missing environment variables
3. Passport strategy not initialized

**Debug Steps**:
```bash
# Check if Google strategy is loaded
cd backend
node -e "require('dotenv').config(); console.log('Google OAuth:', process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Missing');"

# Check backend logs when clicking "Sign in with Google"
npm start
# Look for console.log messages starting with 📍
```

### Issue 3: "Access blocked: This app's request is invalid"
**Solution**: 
- Your app must be in "Testing" mode in Google Console
- Add your email to "Test users" list
- OR publish your app (requires verification for production)

## Testing OAuth Flow

### Development Testing:
1. Start backend: `cd backend && npm start`
2. Open: `http://localhost:4000/signin.html`
3. Click "Google" button
4. Watch terminal for logs:
   - "📍 Google OAuth initiated"
   - "📍 Google OAuth callback received"
   - "📍 Google OAuth successful, user: email@example.com"

### Production Testing (Render):
1. Update `APP_URL` in Render environment variables:
   ```
   APP_URL=https://your-app-name.onrender.com
   ```
2. Add production callback URL to Google Console
3. Redeploy on Render
4. Test from production URL

## Verification Checklist

- [ ] Google Client ID and Secret are in backend/.env
- [ ] APP_URL matches your current environment
- [ ] Google Console has correct redirect URI
- [ ] Google+ API is enabled
- [ ] OAuth Consent Screen is configured
- [ ] Test user is added (if app is in Testing mode)
- [ ] Backend passport.js loads Google strategy
- [ ] MongoDB is connected and running
- [ ] User model exists and is working

## Additional Notes

### For Render Deployment:
1. Go to Render Dashboard → Your Service → Environment
2. Add these variables:
   ```
   GOOGLE_CLIENT_ID=<your_client_id>
   GOOGLE_CLIENT_SECRET=<your_client_secret>
   APP_URL=https://your-app-name.onrender.com
   ```
3. In Google Console, add:
   ```
   https://your-app-name.onrender.com/auth/google/callback
   ```

### Security Notes:
- Never commit `.env` file to Git
- Use different OAuth clients for development and production
- Rotate secrets regularly
- Monitor OAuth usage in Google Console

## Current Status

✅ Environment variables are set
✅ Passport strategy is configured
✅ Routes are mounted at `/auth/google` and `/auth/google/callback`
✅ Error handling added to routes
✅ Logging added for debugging

⚠️ **ACTION NEEDED**: Verify Google Cloud Console settings match this configuration

## Support

If issues persist after following this guide:
1. Check Render deployment logs for specific errors
2. Verify MongoDB connection is working
3. Test with a fresh Google OAuth client
4. Check if User model schema matches the data being saved
