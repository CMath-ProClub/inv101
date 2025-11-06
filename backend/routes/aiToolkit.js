const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data', 'aiToolkit', 'data.json');
let cachedData = null;

function loadToolkitData() {
  if (cachedData) {
    return cachedData;
  }

  try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    cachedData = JSON.parse(raw);
    return cachedData;
  } catch (err) {
    console.error('Failed to load AI Toolkit data file:', err.message);
    return null;
  }
}

function ensureData(req, res) {
  const data = loadToolkitData();
  if (!data) {
    res.status(500).json({ success: false, error: 'AI toolkit data is unavailable.' });
    return null;
  }
  return data;
}

router.get('/learning/tracks', (req, res) => {
  const data = ensureData(req, res);
  if (!data) return;
  res.json({ success: true, tracks: data.learningTracks || [] });
});

router.get('/labs/scenarios', (req, res) => {
  const data = ensureData(req, res);
  if (!data) return;
  res.json({ success: true, labs: data.practiceLabs || [] });
});

router.post('/coach/score', (req, res) => {
  const { headlineNotes = '', biasChecks = [] } = req.body || {};
  const trimmedNotes = String(headlineNotes || '').trim();

  if (!trimmedNotes) {
    return res.status(400).json({ success: false, error: 'headlineNotes is required.' });
  }

  const noteLengthScore = Math.min(trimmedNotes.length / 280, 1);
  const biasScore = Math.min(biasChecks.length / 3, 1);
  const clarityPenalty = /(moon|rocket|guaranteed|unstoppable)/i.test(trimmedNotes) ? 0.15 : 0;
  const composite = Math.max(0, Math.min(1, 0.5 * noteLengthScore + 0.4 * biasScore - clarityPenalty + 0.3));

  res.json({
    success: true,
    coachSummary: {
      score: Number(composite.toFixed(2)),
      strengths: biasChecks.length ? ['Logged bias checks'] : [],
      adjustments: clarityPenalty > 0 ? ['Remove hype language and restate factual support.'] : [],
      prompts: [
        'What is the source of the claim you noted?',
        'Which fundamental metric confirms or challenges the headline?',
        'What is your contingency if sentiment flips next week?'
      ]
    }
  });
});

router.get('/community/cases', (req, res) => {
  const data = ensureData(req, res);
  if (!data) return;
  res.json({ success: true, cases: data.communityCases || [] });
});

router.get('/fundamentals/snapshots', (req, res) => {
  const data = ensureData(req, res);
  if (!data) return;
  const { symbol } = req.query;
  const snapshots = data.fundamentalsSnapshots || [];

  if (symbol) {
    const match = snapshots.find((snap) => snap.symbol.toUpperCase() === String(symbol).toUpperCase());
    if (!match) {
      return res.status(404).json({ success: false, error: 'Snapshot not available for requested symbol.' });
    }
    return res.json({ success: true, snapshot: match });
  }

  res.json({ success: true, snapshots });
});

router.get('/simulator/branches', (req, res) => {
  const data = ensureData(req, res);
  if (!data) return;
  res.json({ success: true, branches: data.simulatorBranches || [] });
});

router.get('/mindful/dashboard', (req, res) => {
  const data = ensureData(req, res);
  if (!data) return;
  res.json({ success: true, dashboard: data.mindfulDashboard || {} });
});

router.get('/briefings/ai-literacy', (req, res) => {
  const data = ensureData(req, res);
  if (!data) return;
  res.json({ success: true, briefings: data.aiLiteracyBriefings || [] });
});

router.get('/earnings/notebook', (req, res) => {
  const data = ensureData(req, res);
  if (!data) return;
  res.json({ success: true, notebook: data.earningsNotebook || {} });
});

router.get('/tools/unlocks', (req, res) => {
  const data = ensureData(req, res);
  if (!data) return;
  res.json({ success: true, tiers: data.toolsUnlocks?.tiers || [] });
});

router.get('/audit/logs', (req, res) => {
  const data = ensureData(req, res);
  if (!data) return;
  res.json({ success: true, logs: data.aiAuditLog || [] });
});

router.get('/mentor/personas', (req, res) => {
  const data = ensureData(req, res);
  if (!data) return;
  res.json({ success: true, mentors: data.mentorPersonas || [] });
});

router.post('/onboarding/intent', (req, res) => {
  const { goal = 'general' } = req.body || {};
  const normalized = String(goal).toLowerCase();

  const recommendations = {
    income: ['dividend-dna', 'case-tilted-portfolio', 'coach-avery'],
    growth: ['news-to-notes', 'branch-sentiment-upside', 'prof-lin'],
    education: ['foundations', 'myths-vs-reality', 'ai-literacy-briefing']
  };

  const selected = recommendations[normalized] || recommendations.general || ['foundations'];

  res.json({
    success: true,
    recommended: selected,
    message: 'Modules have been tailored to your focus area. Progress tracking will adapt after you complete onboarding.'
  });
});

router.get('/myths', (req, res) => {
  const data = ensureData(req, res);
  if (!data) return;
  res.json({ success: true, myths: data.mythsReality || [] });
});

router.get('/brokerage/blueprint', (req, res) => {
  const data = ensureData(req, res);
  if (!data) return;
  res.json({ success: true, blueprint: data.brokerageSync || {} });
});

module.exports = router;
