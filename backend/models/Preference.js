const mongoose = require('mongoose');

const PreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  key: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

PreferenceSchema.index({ userId: 1, key: 1 }, { unique: true });

module.exports = mongoose.models.Preference || mongoose.model('Preference', PreferenceSchema);
