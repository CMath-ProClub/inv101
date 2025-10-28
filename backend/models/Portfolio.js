const mongoose = require('mongoose');

const HoldingSchema = new mongoose.Schema({
  symbol: { type: String, required: true, uppercase: true },
  purchasePrice: { type: Number, required: true },
  qty: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const AccountSchema = new mongoose.Schema({
  accountValue: { type: Number, default: 0 },
  buyingPower: { type: Number, default: 0 },
  cash: { type: Number, default: 0 },
  annualReturn: { type: Number, default: 0 }
}, { _id: false });

const PortfolioSchema = new mongoose.Schema({
  userId: { type: String, index: true, sparse: true },
  account: { type: AccountSchema, default: () => ({}) },
  holdings: { type: [HoldingSchema], default: [] },
  shorts: { type: [HoldingSchema], default: [] },
  updatedAt: { type: Date, default: Date.now }
});

PortfolioSchema.methods.recalculateAccountValue = function(currentPrices = {}) {
  let total = 0;
  this.holdings.forEach(h => {
    const symbol = h.symbol.toUpperCase();
    const price = Number(currentPrices[symbol] || h.purchasePrice || 0);
    total += price * Number(h.qty || 0);
  });
  // Subtract shorts (short positions reduce account value / represent liability)
  if (Array.isArray(this.shorts)) {
    this.shorts.forEach(s => {
      const symbol = s.symbol.toUpperCase();
      const price = Number(currentPrices[symbol] || s.purchasePrice || 0);
      total -= price * Number(s.qty || 0);
    });
  }
  this.account.accountValue = Number(total.toFixed(2));
  this.updatedAt = new Date();
};

module.exports = mongoose.models.Portfolio || mongoose.model('Portfolio', PortfolioSchema);
