# Send The Daily Market Pulse Emails

Hi! Here is a super simple guide so anyone can follow it. Take your time and do one step at a time.

## Part 1: Check The Switch On The Website

1. Open the Investing101 website in your web browser.
2. Log in with your normal username and password.
3. After you are logged in, go to the **Settings** page.
4. Look for the switch called **Daily Market Pulse Email**.
5. Flip the switch to **ON**.
6. A tiny message under the switch should say that emails are turned on. If you refresh the page, the switch should still stay **ON**.
7. Flip the switch to **OFF** and back to **ON** if you want to double-check everything is working.

## Part 2: Tell The Computer How To Send Emails

You need to fill in a few secret codes (they are just long words the mail server gives you). You might get these from your email host or an adult who knows the account details.

1. Open your hosting dashboard (for example Render, Railway, or wherever the backend is running).
2. Find the place where you can set **Environment Variables**. This is usually in the settings panel of the backend service.
3. Add these items (use your real values instead of the example words):
   - `EMAIL_TRANSPORT = smtp`
   - `EMAIL_HOST = smtp-relay.brevo.com` (for Brevo / Sendinblue)
   - `EMAIL_PORT = 587` (use 465 if you prefer SSL)
   - `EMAIL_USER = your-brevo-smtp-username` (often your Brevo login)
   - `EMAIL_PASS = your-brevo-smtp-key` (generate in Brevo: SMTP & API > SMTP)
   - `EMAIL_FROM = "Investing101 Newsletter" <newsletter@your-verified-domain.com>`
   - If you want the email to send at a different time, change `NEWSLETTER_DAILY_CRON` (leave it alone if you are not sure).
4. Save the settings. The dashboard will make sure the new values are stored.

## Part 3: Restart The Backend App

1. In the same hosting dashboard, look for a button that says **Restart**, **Redeploy**, or **Deploy now**.
2. Click that button to restart the backend so it can read the new email settings.
3. Watch the logs (the live text output). You should see a line that says something like `Email transport configured`. That means the server is ready to send emails.

## Part 4: (Optional) Send A Test Email Right Now

1. If the dashboard has a way to run a command, run one of these:
   - Quick test to a single address: `node scripts/test-brevo-email.js you@example.com`
   - Or run the full daily newsletter once: `node -e "require('./services/newsletterService').sendDailyNewsletter().then(console.log).catch(console.error)"`
2. Check the logs. If you see messages about emails being sent, the test worked.
3. If the test fails, read the error message. Most of the time it means the username or password was typed wrong, or the mail server blocked the request.

## Part 5: You Are Done!

- The newsletter job will now run every weekday morning.
- Anyone who turned on the switch will get the email.
- You can come back later and change the schedule or the mail settings whenever you want.

Great job! 🎉

---

### Brevo (Sendinblue) Quick Notes

- Host: `smtp-relay.brevo.com`
- Port: `587` (TLS) or `465` (SSL)
- Username: your Brevo login (or SMTP user)
- Password: your SMTP key (generate under SMTP & API > SMTP)
- Make sure your `EMAIL_FROM` matches a verified sender or domain in Brevo (Senders & Domains), otherwise messages may be rejected or land in spam.