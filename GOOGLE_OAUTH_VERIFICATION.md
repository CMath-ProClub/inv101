# Fixing Google "Dangerous Site" Warning for OAuth

## Why This Happens

Google shows a "This app isn't verified" or "dangerous site" warning when:
1. Your OAuth app is in **testing mode** (not verified)
2. The app requests sensitive scopes
3. The domain is new or unverified

This is **NORMAL** for apps in development. You have two options:

---

## Option 1: Add Test Users (Quick Fix - For Development)

This allows specific people to use your OAuth without verification:

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your "Investing101" project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Scroll down to **Test users**
5. Click **+ ADD USERS**
6. Add email addresses of people who should be able to sign in (including yourself)
7. Click **SAVE**

### Result:
- Test users can sign in without seeing the warning
- Good for development and testing
- Limit: 100 test users
- **Best for now while developing**

---

## Option 2: Verify Your App (For Production)

This removes the warning for everyone but requires Google's approval:

### Requirements:
- Privacy Policy URL (published on your site)
- Terms of Service URL (published on your site)
- Domain verification
- App verification review (can take days/weeks)

### Steps:

#### 1. Create Privacy Policy & Terms of Service
Create these files in your `prototype` folder:

**privacy.html** - Example structure:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Privacy Policy - Investing101</title>
</head>
<body>
    <h1>Privacy Policy</h1>
    <p>Last updated: [Date]</p>
    
    <h2>Information We Collect</h2>
    <p>When you sign in with Google, we collect:</p>
    <ul>
        <li>Your email address</li>
        <li>Your name</li>
        <li>Your profile picture (optional)</li>
    </ul>
    
    <h2>How We Use Your Information</h2>
    <p>We use your information to:</p>
    <ul>
        <li>Provide access to your account</li>
        <li>Save your portfolio and trading data</li>
        <li>Display your profile information</li>
    </ul>
    
    <h2>Data Security</h2>
    <p>We store your data securely in MongoDB Atlas with industry-standard encryption.</p>
    
    <h2>Contact</h2>
    <p>Email: [your-email@example.com]</p>
</body>
</html>
```

**terms.html** - Example structure:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Terms of Service - Investing101</title>
</head>
<body>
    <h1>Terms of Service</h1>
    <p>Last updated: [Date]</p>
    
    <h2>Acceptance of Terms</h2>
    <p>By using Investing101, you agree to these terms.</p>
    
    <h2>Service Description</h2>
    <p>Investing101 is an educational platform for learning about investing through simulations.</p>
    
    <h2>User Accounts</h2>
    <p>You are responsible for maintaining the security of your account.</p>
    
    <h2>Disclaimer</h2>
    <p>This is a simulation platform. Do not use this for actual investment advice.</p>
    
    <h2>Contact</h2>
    <p>Email: [your-email@example.com]</p>
</body>
</html>
```

#### 2. Update OAuth Consent Screen
1. Go to **OAuth consent screen** in Google Cloud Console
2. Click **EDIT APP**
3. Add these URLs:
   - **Application home page**: `https://inv101.onrender.com`
   - **Application privacy policy link**: `https://inv101.onrender.com/privacy.html`
   - **Application terms of service link**: `https://inv101.onrender.com/terms.html`
4. Click **SAVE AND CONTINUE**

#### 3. Submit for Verification
1. Still on OAuth consent screen, click **SUBMIT FOR VERIFICATION**
2. Fill out the verification questionnaire
3. Explain what scopes you need and why
4. Wait for Google's review (1-6 weeks typically)

---

## Option 3: Use Limited Scopes (Reduce Warning Severity)

If you're only requesting basic profile and email, the warning is less severe.

### Check Your Scopes in `backend/passport.js`:

Look for this section:
```javascript
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  // Make sure you're only requesting: 'profile' and 'email'
));
```

The scopes should be minimal:
- `profile` - basic profile info
- `email` - email address

**Don't request** sensitive scopes like:
- Drive access
- Gmail access
- Calendar access
- etc.

---

## Recommended Approach (Right Now)

### For Development/Testing:
1. ✅ **Add yourself as a test user** (Option 1)
2. ✅ Share the app with friends by adding their emails as test users
3. ✅ Continue developing

### Before Going Public:
1. Create proper Privacy Policy and Terms of Service pages
2. Submit for Google verification (Option 2)
3. Wait for approval
4. Then open to public

---

## What About the "Dangerous Site" Warning?

If Google Safe Browsing is flagging your **domain** (not just OAuth):

### Check if your site is flagged:
Go to: https://transparencyreport.google.com/safe-browsing/search?url=inv101.onrender.com

### If flagged:
1. **Review your site for issues**:
   - No malicious code
   - No phishing content
   - HTTPS enabled
   
2. **Request a review**:
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add and verify your property
   - Request a review

### Common False Positive Causes:
- New domain (Render gives you a subdomain)
- Login/signup forms (can look like phishing to bots)
- Financial keywords ("investing", "stocks", "portfolio")

---

## Quick Test - Is It Just OAuth Warning?

Try this to see what type of warning you're getting:

1. **OAuth Warning**: Shows "This app isn't verified" when clicking "Sign in with Google"
   - **Solution**: Add test users (Option 1)

2. **Dangerous Site Warning**: Shows before even reaching your site
   - **Solution**: Check Safe Browsing report and request review

---

## Summary

**Most likely scenario**: You're seeing the OAuth "unverified app" warning, which is completely normal for development.

**Quick fix**: Add yourself as a test user in Google Cloud Console

**Long-term fix**: Create privacy policy and terms, then submit for verification

**Not a real security issue**: Your site isn't actually dangerous, Google just requires verification for OAuth apps

---

## Need Help?

If you share a screenshot of the exact warning you're seeing, I can give you more specific guidance!
