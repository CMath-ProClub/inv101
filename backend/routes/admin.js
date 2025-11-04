const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Article = require('../models/Article');
let StockPrice;
try { StockPrice = require('../models/StockPrice'); } catch (e) { /* ignore if model not present */ }
const { spawn } = require('child_process');
const path = require('path');

// Simple in-process lock to prevent concurrent migration runs
let migrationInProgress = false;

// Simple header-token auth to avoid exposing this publicly.
// Set ADMIN_TOKEN in your environment to enable access.
function requireAdminToken(req, res, next) {
  const token = req.headers['x-admin-token'] || req.headers['authorization'];
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return res.status(503).json({ success: false, error: 'Admin token not configured on this server' });
  if (!token) return res.status(401).json({ success: false, error: 'Missing admin token' });
  // Allow Bearer token in Authorization header
  const normalized = token.startsWith('Bearer ') ? token.slice(7) : token;
  if (normalized !== expected) return res.status(403).json({ success: false, error: 'Invalid admin token' });
  next();
}

// GET /api/admin/articles-summary
// Returns total article count, distribution by quarter, and top sources
router.get('/articles-summary', requireAdminToken, async (req, res) => {
  try {
    const total = await Article.countDocuments({ isActive: true });

    // Distribution by quarter (based on publishDate)
    const quarters = await Article.aggregate([
      { $match: { isActive: true, publishDate: { $exists: true } } },
      { $project: { year: { $year: '$publishDate' }, month: { $month: '$publishDate' } } },
      { $project: { year: 1, quarter: { $ceil: { $divide: ['$month', 3] } } } },
      { $group: { _id: { year: '$year', quarter: '$quarter' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.quarter': 1 } }
    ]).exec();

    // Top sources
    const topSources = await Article.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]).exec();

    const payload = { success: true, total, quarters, topSources };

    // If StockPrice model available, add simple stats
    if (StockPrice) {
      try {
        const spTotal = await StockPrice.countDocuments();
        const first = await StockPrice.findOne().sort({ date: 1 }).select('date symbol').lean();
        const last = await StockPrice.findOne().sort({ date: -1 }).select('date symbol').lean();

        // sample top symbols (group by symbol)
        const topSymbols = await StockPrice.aggregate([
          { $group: { _id: '$symbol', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]);

        payload.stockPrices = {
          total: spTotal,
          earliest: first ? first.date : null,
          latest: last ? last.date : null,
          sampleTopSymbols: topSymbols.map(s => ({ symbol: s._id, count: s.count }))
        };
      } catch (e) {
        console.warn('Failed to gather StockPrice stats:', e.message);
      }
    }

    res.json(payload);
  } catch (err) {
    console.error('Admin articles-summary failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/run-migration
// body: { migration_file?, migration_symbol?, dryRun?: boolean }
router.post('/run-migration', requireAdminToken, async (req, res) => {
  const { migration_file, migration_symbol } = req.body || {};
  const dryRun = req.body && (req.body.dryRun === true || String(req.body.dryRun).toLowerCase() === 'true');

  if (migrationInProgress) return res.status(409).json({ success: false, error: 'Migration already in progress' });

  // Build env for child process
  const env = Object.assign({}, process.env, {
    MIGRATION_FILE: migration_file || process.env.MIGRATION_FILE || 'SPY_daily.json',
    MIGRATION_SYMBOL: migration_symbol || process.env.MIGRATION_SYMBOL || 'SPY',
    DRY_RUN: dryRun ? 'true' : 'false',
    MONGODB_URI: process.env.MONGODB_URI || ''
  });

  const scriptPath = path.join(__dirname, '..', 'migrate-articles-to-atlas.js');

  migrationInProgress = true;

  const child = spawn(process.execPath, [scriptPath], { env });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', d => { stdout += d.toString(); });
  child.stderr.on('data', d => { stderr += d.toString(); });

  child.on('error', err => {
    migrationInProgress = false;
    console.error('Migration child error:', err);
    return res.status(500).json({ success: false, error: err.message });
  });

  child.on('close', code => {
    migrationInProgress = false;
    const result = { success: code === 0, code, stdout, stderr };
    res.json(result);
  });
});

module.exports = router;