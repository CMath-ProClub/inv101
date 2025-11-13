# Clerk Authentication Test Guide

Invest101 relies on Clerk for all authentication flows. Use this checklist to validate the integration in development, staging, or production.



## Environment Readiness

- Backend running locally at `http://localhost:4000` or the current API host
- Next.js frontend (or the static prototypes) reachable
- `CLERK_PUBLISHABLE_KEY` exposed to the frontend runtime
- `CLERK_SECRET_KEY` and, if used, `CLERK_WEBHOOK_SECRET` available to the backend
- Browser signed out of any previous Clerk sessions

## Smoke Tests

### 1. Email Sign-Up

1. Open the Next.js `/sign-up` route or `http://localhost:4000/signup-clerk.html`.
2. Complete the email/password flow with a new address.
3. Verify the magic link or OTP from Clerk and finish onboarding.
4. Confirm MongoDB stores `clerkId`, `email`, and expected profile metadata for the new user.

### 2. Email Sign-In

1. Visit `/sign-in` (Next.js) or `http://localhost:4000/signin-clerk.html`.
2. Log in with the account created above.
3. Ensure Clerk redirects back to the app and issues the `__session` cookie.
4. Refresh the page to confirm the session persists.

### 3. Session Probe

```powershell
curl http://localhost:4000/auth/session -UseBasicParsing
```

- Expect `{ "authenticated": true, ... }` when signed in.
- Expect `{ "authenticated": false }` after signing out.

## Deep Validation

### API Middleware

- Call a protected endpoint (e.g., `/portfolio` or `/api/portfolio`) while signed in; it should succeed.
- Repeat the request after signing out; expect `401 Unauthorized`.

### Token Refresh

- Delete the `__session` cookie and reload the app.
- Clerk should silently refresh the session if the user remains active.

### Social Providers (Optional)

- Enable Google, Apple, etc. in the Clerk Dashboard.
- Confirm the provider appears in the Clerk widget and completes the flow end-to-end.

### Sign-Out Paths

- Trigger the `<UserButton afterSignOutUrl="/" />` sign-out and confirm the session clears.
- Call `GET http://localhost:4000/auth/logout` to ensure any legacy cookies are removed via `clearAuthCookies`.
- Verify `/auth/session` reports `authenticated: false` afterward.

### Webhooks (Optional)

```powershell
curl -X POST http://localhost:4000/webhooks/clerk `
  -H "svix-id: test" `
  -H "svix-timestamp: 0" `
  -H "svix-signature: test" `
  -d '{}' -UseBasicParsing
```

- With placeholder secrets expect `204`.
- With valid Svix headers expect `200` and a log entry.

## Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| Clerk components fail to render | Missing `CLERK_PUBLISHABLE_KEY` | Surface the key in the frontend env config |
| `/auth/session` always returns false | Backend missing `CLERK_SECRET_KEY` | Reload env vars and restart the server |
| Webhooks return 400 | Incorrect signing secret | Use the `CLERK_WEBHOOK_SECRET` from the Clerk dashboard |
| Cookies linger after sign-out | Legacy logout still active | Ensure only Clerk sign-out paths are invoked |
| Users missing in MongoDB | Sync hook not invoked | Confirm `clerkAuth.js` persists Clerk users during session checks |

## Pre-Deploy Checklist

- [ ] Production environment variables updated with Clerk keys
- [ ] Backend restarted with refreshed environment
- [ ] Frontend build includes Clerk SSR helpers if applicable
- [ ] `/auth/session` smoke test passes in deployed environment
- [ ] Webhook endpoint verified with the Svix signing secret

Clerk is the single source of truth for authentication. Remove any remaining legacy credential flows before shipping new features.
