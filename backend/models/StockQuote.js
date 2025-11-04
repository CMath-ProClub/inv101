const mongoose = require('mongoose');

const ttlDays = parseInt(process.env.STOCK_QUOTE_TTL_DAYS || '395', 10);
const ttlSeconds = Math.max(ttlDays, 1) * 24 * 60 * 60;

const StockQuoteSchema = new mongoose.Schema({
  symbol: { type: String, required: true, uppercase: true, index: true },
  price: { type: Number, required: true },
  change: { type: Number },
  changePercent: { type: Number },
  volume: { type: Number },
  marketCap: { type: Number },
  previousClose: { type: Number },
  open: { type: Number },
  dayHigh: { type: Number },
  dayLow: { type: Number },
  fetchedAt: { type: Date, default: Date.now, index: true },
  bucket: { type: Date, required: true, index: true },
  source: { type: String, default: 'yahoo-finance' },
  currency: { type: String, default: 'USD' },
  exchange: { type: String },
  raw: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true,
  minimize: false
});

StockQuoteSchema.index({ symbol: 1, bucket: 1 }, { unique: true });
StockQuoteSchema.index({ createdAt: 1 }, { expireAfterSeconds: ttlSeconds });

module.exports = mongoose.models.StockQuote || mongoose.model('StockQuote', StockQuoteSchema);
