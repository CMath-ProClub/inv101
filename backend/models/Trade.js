const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  portfolioId: {
    type: Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true,
    index: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  companyName: String,
  type: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  orderType: {
    type: String,
    enum: ['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'],
    default: 'MARKET'
  },
  shares: {
    type: Number,
    required: true,
    min: 1
  },
  requestedPrice: {
    type: Number,
    min: 0
  },
  executedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalCost: {
    type: Number,
    required: true
  },
  commission: {
    type: Number,
    default: 0 // Commission-free trading
  },
  realizedPL: {
    type: Number,
    default: 0 // Only applicable for SELL orders
  },
  status: {
    type: String,
    enum: ['PENDING', 'EXECUTED', 'CANCELLED', 'REJECTED'],
    default: 'EXECUTED',
    index: true
  },
  notes: String,
  executedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient trade history queries
tradeSchema.index({ userId: 1, createdAt: -1 });
tradeSchema.index({ portfolioId: 1, symbol: 1, createdAt: -1 });

// Static method to record a buy trade
tradeSchema.statics.recordBuy = async function(userId, portfolioId, symbol, companyName, shares, price) {
  const totalCost = shares * price;
  
  const trade = new this({
    userId,
    portfolioId,
    symbol,
    companyName,
    type: 'BUY',
    orderType: 'MARKET',
    shares,
    requestedPrice: price,
    executedPrice: price,
    totalCost,
    status: 'EXECUTED'
  });
  
  return await trade.save();
};

// Static method to record a sell trade
tradeSchema.statics.recordSell = async function(userId, portfolioId, symbol, companyName, shares, price, realizedPL) {
  const totalProceeds = shares * price;
  
  const trade = new this({
    userId,
    portfolioId,
    symbol,
    companyName,
    type: 'SELL',
    orderType: 'MARKET',
    shares,
    requestedPrice: price,
    executedPrice: price,
    totalCost: totalProceeds, // For SELL, this is the proceeds
    realizedPL,
    status: 'EXECUTED'
  });
  
  return await trade.save();
};

// Static method to get trade history for a user
tradeSchema.statics.getHistory = async function(userId, options = {}) {
  const {
    portfolioId,
    symbol,
    limit = 50,
    skip = 0,
    startDate,
    endDate
  } = options;
  
  const query = { userId };
  
  if (portfolioId) {
    query.portfolioId = portfolioId;
  }
  
  if (symbol) {
    query.symbol = symbol.toUpperCase();
  }
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  const trades = await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'username displayName')
    .lean();
  
  const total = await this.countDocuments(query);
  
  return {
    trades,
    total,
    page: Math.floor(skip / limit) + 1,
    pages: Math.ceil(total / limit)
  };
};

// Static method to get trade statistics
tradeSchema.statics.getStats = async function(userId, portfolioId) {
  const query = { userId, status: 'EXECUTED' };
  if (portfolioId) query.portfolioId = portfolioId;
  
  const trades = await this.find(query);
  
  const stats = {
    totalTrades: trades.length,
    buyTrades: trades.filter(t => t.type === 'BUY').length,
    sellTrades: trades.filter(t => t.type === 'SELL').length,
    totalRealizedPL: trades.reduce((sum, t) => sum + (t.realizedPL || 0), 0),
    winningTrades: trades.filter(t => t.realizedPL > 0).length,
    losingTrades: trades.filter(t => t.realizedPL < 0).length,
    totalVolume: trades.reduce((sum, t) => sum + t.totalCost, 0),
    averageTradeSize: trades.length > 0 ? trades.reduce((sum, t) => sum + t.totalCost, 0) / trades.length : 0
  };
  
  stats.winRate = stats.sellTrades > 0 ? (stats.winningTrades / stats.sellTrades) * 100 : 0;
  
  return stats;
};

// Static method to get recent activity (last N trades)
tradeSchema.statics.getRecentActivity = async function(limit = 20) {
  return await this.find({ status: 'EXECUTED' })
    .sort({ executedAt: -1 })
    .limit(limit)
    .populate('userId', 'username displayName avatar')
    .select('userId symbol type shares executedPrice totalCost realizedPL executedAt')
    .lean();
};

const Trade = mongoose.model('Trade', tradeSchema);

module.exports = Trade;
