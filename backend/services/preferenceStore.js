const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Preference = require('../models/Preference');

const fallbackPath = path.join(__dirname, '..', 'data', 'preferences-fallback.json');
let fallbackStore = Object.create(null);
let pendingWrite = null;

(function bootstrapFallback() {
  try {
    if (fs.existsSync(fallbackPath)) {
      const raw = fs.readFileSync(fallbackPath, 'utf8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          fallbackStore = parsed;
        }
      }
    }
  } catch (err) {
    console.warn('⚠️  Failed to load preference fallback cache:', err.message);
  }
})();

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

function getFallbackValue(userId, key) {
  const userPrefs = fallbackStore[userId];
  if (!userPrefs) return null;
  return Object.prototype.hasOwnProperty.call(userPrefs, key) ? userPrefs[key] : null;
}

function setFallbackValue(userId, key, value) {
  if (!fallbackStore[userId]) {
    fallbackStore[userId] = {};
  }
  fallbackStore[userId][key] = value;
  schedulePersist();
  return value;
}

function schedulePersist() {
  if (pendingWrite) return pendingWrite;
  pendingWrite = fs.promises.mkdir(path.dirname(fallbackPath), { recursive: true })
    .then(() => fs.promises.writeFile(fallbackPath, JSON.stringify(fallbackStore, null, 2)))
    .catch(err => {
      console.warn('⚠️  Failed to persist preference fallback cache:', err.message);
    })
    .finally(() => {
      pendingWrite = null;
    });
  return pendingWrite;
}

async function getPreference(userId, key) {
  const safeUserId = String(userId);
  if (isDbConnected()) {
    try {
      const pref = await Preference.findOne({ userId: safeUserId, key }).lean();
      if (pref && typeof pref.value !== 'undefined') {
        return { value: pref.value, source: 'mongo' };
      }
      return { value: null, source: 'mongo' };
    } catch (err) {
      console.warn('⚠️  Preference lookup fell back to cache:', err.message);
    }
  }
  return { value: getFallbackValue(safeUserId, key), source: 'fallback' };
}

async function setPreference(userId, key, value) {
  const safeUserId = String(userId);
  if (isDbConnected()) {
    try {
      const updated = await Preference.findOneAndUpdate(
        { userId: safeUserId, key },
        { $set: { value } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();
      return { value: updated?.value ?? null, source: 'mongo' };
    } catch (err) {
      console.warn('⚠️  Preference write fell back to cache:', err.message);
    }
  }
  return { value: setFallbackValue(safeUserId, key, value), source: 'fallback' };
}

module.exports = {
  getPreference,
  setPreference,
  isDbConnected
};
