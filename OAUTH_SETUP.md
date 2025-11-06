# OAuth Setup Guide for Investing101

This guide will help you set up Google and Facebook OAuth authentication for your Investing101 application.

## Prerequisites

- A Google Cloud account
- A Facebook Developer account
- Your application's public URL (e.g., `https://yourdomain.com` or `http://localhost:4000` for development)

---

## Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Name your project (e.g., "Investing101")
4. Click "Create"

### Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (unless you have a Google Workspace)
3. Fill in the required fields:
   - **App name**: Investing101
   - **User support email**: your email
   - **Developer contact**: your email
4. Click "Save and Continue"
5. On "Scopes" page, click "Save and Continue"
6. On "Test users", add your email for testing
7. Click "Save and Continue"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Configure:
   - **Name**: Investing101 Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:4000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:4000/auth/google/callback` (development)
     - `https://yourdomain.com/auth/google/callback` (production)
5. Click "Create"
6. Copy your **Client ID** and **Client Secret**

### Step 5: Add to Environment Variables

Add these to your `.env` file:

```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
APP_URL=http://localhost:4000
```

---

## Facebook OAuth Setup

### Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Click "Create App"
3. Choose "Consumer" as app type
4. Fill in:
   - **App Display Name**: Investing101
   - **App Contact Email**: your email
5. Click "Create App"

### Step 2: Add Facebook Login Product

1. From your app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" as your platform
4. Enter your site URL (e.g., `http://localhost:4000`)

### Step 3: Configure Facebook Login Settings

1. Go to "Facebook Login" → "Settings"
2. Configure:
   - **Valid OAuth Redirect URIs**:
     - `http://localhost:4000/auth/facebook/callback` (development)
     - `https://yourdomain.com/auth/facebook/callback` (production)
   - **Deauthorize Callback URL**: (optional)
   - **Data Deletion Request URL**: (optional)
3. Click "Save Changes"

### Step 4: Get App Credentials

1. Go to "Settings" → "Basic"
2. Copy your **App ID** and **App Secret**
3. Add your app domain:
   - **App Domains**: `localhost` (development) or `yourdomain.com` (production)
4. Fill in **Privacy Policy URL** and **Terms of Service URL** (required for public apps)

### Step 5: Make App Public (Optional - for production)

1. Toggle "App Mode" to "Live" (only when ready for production)
2. Complete all required verification steps

### Step 6: Add to Environment Variables

Add these to your `.env` file:

```bash
FACEBOOK_APP_ID=your-app-id-here
FACEBOOK_APP_SECRET=your-app-secret-here
APP_URL=http://localhost:4000
```

---

## Complete .env Example

Your `.env` file should look like this:

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/investing101

# Node Environment
NODE_ENV=development

# Application URL
APP_URL=http://localhost:4000

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijk123456789
 
# Facebook OAuth
FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=abcdef1234567890abcdef1234567890

# JWT Secret
JWT_SECRET=your-super-secret-random-string-here

# ... other configuration
```

---

## Testing OAuth

### Development Testing

1. Start your server:
   ```bash
   cd backend
   npm start
   ```

2. Navigate to `http://localhost:4000/signin.html`
3. Click "Sign in with Google" or "Sign in with Facebook"
4. Authorize the app
5. You should be redirected back to your app and logged in

### Common Issues

**Google OAuth Errors:**
- `redirect_uri_mismatch`: Make sure your callback URL exactly matches what's in Google Console
- `invalid_client`: Check that your Client ID and Secret are correct
- `access_denied`: User cancelled the authorization or app is not verified

**Facebook OAuth Errors:**
- `invalid_oauth_redirect_uri`: Verify redirect URI in Facebook App Settings
- `app_not_setup`: Make sure Facebook Login product is added to your app
- `invalid_app_id`: Check your App ID and Secret are correct

**General Tips:**
- Always use HTTPS in production
- For development, `localhost` is allowed by both Google and Facebook
- Keep your secrets secure and never commit them to version control
- Rotate secrets if they are ever exposed

---

## Production Deployment

When deploying to production:

1. **Update OAuth Redirect URIs**:
   - Add your production domain to both Google and Facebook app settings
   - Example: `https://investing101.com/auth/google/callback`

2. **Update Environment Variables**:
   - Set `APP_URL` to your production domain
   - Set `NODE_ENV=production`
   - Use strong, unique secrets

3. **Security Checklist**:
   - ✅ Enable HTTPS
   - ✅ Set secure cookie flags
   - ✅ Use environment variables for secrets
   - ✅ Enable CORS only for your domains
   - ✅ Rate limit authentication endpoints
   - ✅ Monitor for suspicious login attempts

4. **Facebook App Review** (if needed):
   - For accessing user data beyond email/public profile
   - Submit your app for review through Facebook Developer Console
   - Provide clear use cases and privacy policy

---

## Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Test with a different browser or incognito mode
5. Review the [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
6. Review the [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/web)

For additional help, open an issue on the project repository.
