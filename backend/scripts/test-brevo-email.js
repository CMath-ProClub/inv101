'use strict';

// Quick test script to validate Brevo SMTP configuration via nodemailer
// Usage (from backend folder):
//   node scripts/test-brevo-email.js you@example.com
// Requires EMAIL_* env vars to be configured.

const emailClient = require('../lib/emailClient');

async function main() {
  const to = process.argv[2] || process.env.TEST_EMAIL_TO;
  if (!to) {
    console.error('Usage: node scripts/test-brevo-email.js <toEmail>');
    process.exit(1);
  }

  if (!emailClient.isConfigured()) {
    console.error('Email transport is not configured. Check EMAIL_TRANSPORT, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS.');
    process.exit(2);
  }

  const subject = 'Brevo SMTP Test — Investing101';
  const html = '<p>Hello! This is a test email sent via Brevo SMTP from Investing101.</p>' +
               '<p>If you received this, SMTP settings are working.</p>';
  const text = 'Hello! This is a test email sent via Brevo SMTP from Investing101.\n' +
               'If you received this, SMTP settings are working.';

  try {
    const info = await emailClient.sendMail({ to, subject, html, text });
    console.log('✅ Test email sent. Nodemailer info:', info && (info.messageId || info.response || info.envelope));
  } catch (err) {
    console.error('❌ Failed to send test email:', err.message);
    process.exit(3);
  }
}

main();
