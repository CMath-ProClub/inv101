const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const preferenceStore = require('../services/preferenceStore');

// Get a preference by key
router.get('/:key', authMiddleware, async (req, res) => {
  try {
    const key = req.params.key;
    const result = await preferenceStore.getPreference(req.user.id, key);
    if (result.source) {
      res.set('X-Preference-Store', result.source);
    }
    res.json({ success: true, preference: typeof result.value === 'undefined' ? null : result.value });
  } catch (err) {
    console.error('Get preference error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Set a preference by key
router.post('/:key', authMiddleware, async (req, res) => {
  try {
    const key = req.params.key;
    const value = req.body && typeof req.body === 'object' ? req.body : { value: req.body };

    const result = await preferenceStore.setPreference(req.user.id, key, value);
    if (result.source) {
      res.set('X-Preference-Store', result.source);
    }
    res.json({ success: true, preference: typeof result.value === 'undefined' ? null : result.value });
  } catch (err) {
    console.error('Set preference error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
