const express = require('express');
const router = express.Router();
const Preference = require('../models/Preference');
const { authMiddleware } = require('../middleware/auth');

// Get a preference by key
router.get('/:key', authMiddleware, async (req, res) => {
  try {
    const key = req.params.key;
    const pref = await Preference.findOne({ userId: req.user.id, key }).lean();
    res.json({ success: true, preference: pref ? pref.value : null });
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

    const updated = await Preference.findOneAndUpdate(
      { userId: req.user.id, key },
      { $set: { value } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, preference: updated.value });
  } catch (err) {
    console.error('Set preference error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
