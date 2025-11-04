const mongoose = require('mongoose');

const StockPriceSchema = new mongoose.Schema({
  symbol: { type: String, required: true, uppercase: true, index: true },
  date: { type: Date, required: true, index: true },
  open: { type: Number },
  high: { type: Number },
  low: { type: Number },
  close: { type: Number, required: true },
  adjustedClose: { type: Number },
  volume: { type: Number },
  source: { type: String, default: 'local' },
  raw: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

// Ensure uniqueness per symbol+date to avoid duplicates during re-runs
StockPriceSchema.index({ symbol: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.StockPrice || mongoose.model('StockPrice', StockPriceSchema);
