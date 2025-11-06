'use strict';

const path = require('path');
const Preference = require('../models/Preference');
const User = require('../models/User');
const stockMarketData = require('../stockMarketData');
const { buildStockRecommendations } = require('../lib/stockInsights');
const emailClient = require('../lib/emailClient');

const utils = require(path.resolve(__dirname, '../../prototype/newsletter-utils.js'));

const MAX_PERFORMERS = Math.max(parseInt(process.env.NEWSLETTER_MAX_PERFORMERS || '5', 10), 1);
const MAX_RECOMMENDATIONS = Math.max(parseInt(process.env.NEWSLETTER_MAX_RECOMMENDATIONS || '5', 10), 1);

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric'
});

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).replace(/[&<>"']/g, function (char) {
    switch (char) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return char;
    }
  });
}

async function listNewsletterSubscribers() {
  const preferences = await Preference.find({
    key: 'newsletter',
    'value.emailOptIn': true
  }).lean();

  if (!preferences.length) {
    return [];
  }

  const userIds = preferences.map((pref) => pref.userId).filter(Boolean);
  const users = await User.find({
    _id: { $in: userIds },
    email: { $exists: true, $ne: null }
  }).lean();

  const userMap = new Map(users.map((user) => [String(user._id), user]));
  const subscriberMap = new Map();

  preferences.forEach((pref) => {
    const user = userMap.get(String(pref.userId));
    if (!user || !user.email) {
      return;
    }

    const email = user.email.toLowerCase();
    const displayName = user.displayName || user.username || user.email.split('@')[0] || 'Investor';
    subscriberMap.set(email, {
      userId: String(user._id),
      email: user.email,
      displayName,
      preference: pref.value || {},
      subscribedAt: pref.value && pref.value.subscribedAt ? new Date(pref.value.subscribedAt) : pref.createdAt
    });
  });

  return Array.from(subscriberMap.values());
}

async function buildNewsletterSnapshot() {
  const generatedAt = new Date();
  let dataSource = 'live';
  let performerItems = [];
  let recommendationItems = [];

  try {
    const stockData = await stockMarketData.getStockData();
    performerItems = stockMarketData.getTopMovers(stockData, 'gainers', MAX_PERFORMERS);
  } catch (error) {
    console.error('newsletter_performers_error', error.message);
    dataSource = 'fallback';
  }

  try {
    recommendationItems = await buildStockRecommendations({ limit: MAX_RECOMMENDATIONS });
  } catch (error) {
    console.error('newsletter_recommendations_error', error.message);
    dataSource = dataSource === 'live' ? 'partial' : dataSource;
  }

  let performers = utils.transformPerformers(performerItems, MAX_PERFORMERS);
  let projections = utils.transformRecommendations(recommendationItems, MAX_RECOMMENDATIONS);

  if (!performers.length) {
    performers = utils.transformPerformers(utils.samples.performers, MAX_PERFORMERS);
    dataSource = 'fallback';
  }

  if (!projections.length) {
    projections = utils.transformRecommendations(utils.samples.recommendations, MAX_RECOMMENDATIONS);
    dataSource = dataSource === 'live' ? 'partial' : dataSource;
  }

  const context = utils.buildContextSummary(performers, projections);

  return {
    generatedAt,
    dateLabel: dateFormatter.format(generatedAt),
    performers,
    projections,
    context,
    dataSource
  };
}

function renderHtmlBody(snapshot, recipient) {
  const greeting = recipient && recipient.displayName ? `Hi ${escapeHtml(recipient.displayName)},` : 'Hi there,';

  const performerRows = snapshot.performers.map((item) => (
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e6e6e6;">
        <strong>${escapeHtml(item.ticker)}</strong><div style="font-size:13px;color:#555;">${escapeHtml(item.name)}</div>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #e6e6e6;white-space:nowrap;">${escapeHtml(item.moveLabel)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e6e6e6;white-space:nowrap;">${escapeHtml(item.priceLabel)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e6e6e6;">${escapeHtml(item.driver)}</td>
    </tr>`
  )).join('');

  const projectionRows = snapshot.projections.map((item) => (
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e6e6e6;">
        <strong>${escapeHtml(item.ticker)}</strong><div style="font-size:13px;color:#555;">${escapeHtml(item.name)}</div>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #e6e6e6;white-space:nowrap;">${escapeHtml(item.projectedLabel)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e6e6e6;white-space:nowrap;">${escapeHtml(item.priceLabel)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e6e6e6;">${escapeHtml(item.catalyst)}</td>
    </tr>`
  )).join('');

  const dataBadge = snapshot.dataSource === 'live'
    ? 'Live market feed'
    : snapshot.dataSource === 'partial'
      ? 'Mixed feed (live + curated)'
      : 'Curated snapshot';

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f1f1f;line-height:1.55;">
      <p style="margin:0 0 16px 0;">${greeting}</p>
      <p style="margin:0 0 16px 0;">Here is your Investing101 Daily Market Pulse for <strong>${escapeHtml(snapshot.dateLabel)}</strong>.</p>
      <p style="margin:0 0 24px 0;color:#444;">${escapeHtml(snapshot.context)}</p>

      <div style="margin-bottom:24px;">
        <h3 style="margin:0 0 12px 0;color:#0a3d62;">Top Performers</h3>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:#fafafa;border-radius:12px;overflow:hidden;">
          <thead>
            <tr style="background:#edf2f7;color:#1f1f1f;">
              <th align="left" style="padding:10px 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Name</th>
              <th align="left" style="padding:10px 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Move</th>
              <th align="left" style="padding:10px 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Close</th>
              <th align="left" style="padding:10px 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Driver</th>
            </tr>
          </thead>
          <tbody>${performerRows}</tbody>
        </table>
      </div>

      <div style="margin-bottom:24px;">
        <h3 style="margin:0 0 12px 0;color:#0a3d62;">Momentum Setups</h3>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:#fafafa;border-radius:12px;overflow:hidden;">
          <thead>
            <tr style="background:#edf2f7;color:#1f1f1f;">
              <th align="left" style="padding:10px 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Name</th>
              <th align="left" style="padding:10px 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Projected</th>
              <th align="left" style="padding:10px 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Spot</th>
              <th align="left" style="padding:10px 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Catalyst</th>
            </tr>
          </thead>
          <tbody>${projectionRows}</tbody>
        </table>
      </div>

      <p style="margin:16px 0 8px 0;font-size:13px;color:#666;">Data source: ${escapeHtml(dataBadge)} · Generated at ${escapeHtml(snapshot.generatedAt.toISOString())}</p>
      <p style="margin:0;font-size:12px;color:#8c8c8c;">You are receiving this because you opted into the Investing101 newsletter. Update your notification preferences in your profile to unsubscribe.</p>
    </div>
  `;
}

function renderTextBody(snapshot, recipient) {
  const greeting = recipient && recipient.displayName ? `Hi ${recipient.displayName},` : 'Hi there,';
  const lines = [];
  lines.push(greeting);
  lines.push('');
  lines.push(`Investing101 Daily Market Pulse for ${snapshot.dateLabel}`);
  lines.push('');
  lines.push(snapshot.context);
  lines.push('');
  lines.push('Top Performers:');
  snapshot.performers.forEach((item) => {
    lines.push(` - ${item.ticker}: ${item.moveLabel} (close ${item.priceLabel}) — ${item.driver}`);
  });
  lines.push('');
  lines.push('Momentum Setups:');
  snapshot.projections.forEach((item) => {
    lines.push(` - ${item.ticker}: ${item.projectedLabel} (spot ${item.priceLabel}) — ${item.catalyst}`);
  });
  lines.push('');
  lines.push(`Data source: ${snapshot.dataSource}`);
  lines.push('You are receiving this because you opted into the Investing101 newsletter. Update your notification preferences to unsubscribe.');
  lines.push('');
  lines.push('Stay sharp,');
  lines.push('The Investing101 Team');
  return lines.join('\n');
}

async function sendDailyNewsletter() {
  const snapshot = await buildNewsletterSnapshot();
  const recipients = await listNewsletterSubscribers();

  if (!recipients.length) {
    console.log('newsletter_send_skipped', 'no-subscribers');
    return {
      totalRecipients: 0,
      emailsSent: 0,
      skippedReason: 'no-subscribers',
      snapshot
    };
  }

  if (!emailClient.isConfigured()) {
    console.warn('newsletter_send_skipped', 'email-transport-not-configured');
    return {
      totalRecipients: recipients.length,
      emailsSent: 0,
      skippedReason: 'email-transport-not-configured',
      snapshot
    };
  }

  const subject = `Investing101 Daily Market Pulse — ${snapshot.dateLabel}`;
  const results = [];

  for (const recipient of recipients) {
    try {
      await emailClient.sendMail({
        to: recipient.email,
        subject,
        html: renderHtmlBody(snapshot, recipient),
        text: renderTextBody(snapshot, recipient)
      });
      results.push({ status: 'sent', email: recipient.email });
    } catch (error) {
      console.error('newsletter_send_error', recipient.email, error.message);
      results.push({ status: 'failed', email: recipient.email, error: error.message });
    }
  }

  const sentCount = results.filter((entry) => entry.status === 'sent').length;
  const failed = results.filter((entry) => entry.status === 'failed');

  return {
    totalRecipients: recipients.length,
    emailsSent: sentCount,
    failures: failed,
    snapshot
  };
}

module.exports = {
  listNewsletterSubscribers,
  buildNewsletterSnapshot,
  sendDailyNewsletter
};
