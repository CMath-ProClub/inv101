'use strict';

const nodemailer = require('nodemailer');

let cachedTransport = null;
let hasAttemptedInit = false;

function createConsoleTransport() {
  const transport = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  });
  console.log('📬 Email transport set to console mode. Messages will be logged, not delivered.');
  return transport;
}

function createSmtpTransport() {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  if (!host) {
    console.warn('⚠️  Email transport not configured (missing EMAIL_HOST).');
    return null;
  }

  const config = {
    host,
    port,
    secure: Number.isInteger(port) ? port === 465 : false
  };

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (user && pass) {
    config.auth = { user, pass };
  }

  console.log(`📬 Email transport configured for ${host}:${port}`);
  return nodemailer.createTransport(config);
}

function resolveTransport() {
  if (cachedTransport || hasAttemptedInit) {
    return cachedTransport;
  }

  hasAttemptedInit = true;
  const mode = String(process.env.EMAIL_TRANSPORT || 'smtp').toLowerCase();

  if (mode === 'disabled' || mode === 'off' || mode === 'none') {
    console.warn('📭 Email transport explicitly disabled via EMAIL_TRANSPORT.');
    return null;
  }

  if (mode === 'console' || mode === 'log') {
    cachedTransport = createConsoleTransport();
    return cachedTransport;
  }

  cachedTransport = createSmtpTransport();
  return cachedTransport;
}

function isConfigured() {
  return Boolean(resolveTransport());
}

async function sendMail(message) {
  const transport = resolveTransport();
  if (!transport) {
    throw new Error('Email transport is not configured. Unable to send message.');
  }

  const baseFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@invest101.local';
  const payload = Object.assign({}, message, { from: message.from || baseFrom });

  const info = await transport.sendMail(payload);

  if (transport.options && transport.options.streamTransport && info && info.message) {
    console.log(info.message.toString());
  }

  return info;
}

module.exports = {
  isConfigured,
  sendMail
};
