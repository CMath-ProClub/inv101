const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Article = require('../models/Article');

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

    res.json({ success: true, total, quarters, topSources });
  } catch (err) {
    console.error('Admin articles-summary failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;