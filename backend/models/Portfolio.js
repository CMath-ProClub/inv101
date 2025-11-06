const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const positionSchema = new Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  companyName: String,
  shares: {
    type: Number,
    required: true,
    min: 0
  },
  averageCost: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    required: true
  },
  unrealizedPL: {
    type: Number,
    default: 0
  },
  unrealizedPLPercent: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const portfolioSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    default: 'My Portfolio'
  },
  cash: {
    type: Number,
    required: true,
    default: 100000 // Starting cash: $100,000
  },
  positions: [positionSchema],
  totalValue: {
    type: Number,
    default: 100000
  },
  totalPL: {
    type: Number,
    default: 0
  },
  totalPLPercent: {
    type: Number,
    default: 0
  },
  dayPL: {
    type: Number,
    default: 0
  },
  dayPLPercent: {
    type: Number,
    default: 0
  },
  totalTrades: {
    type: Number,
    default: 0
  },
  winningTrades: {
    type: Number,
    default: 0
  },
  losingTrades: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
portfolioSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add or update a position
portfolioSchema.methods.updatePosition = function(symbol, shares, price, companyName) {
  const existingPosition = this.positions.find(p => p.symbol === symbol);
  
  if (existingPosition) {
    // Update existing position with new average cost
    const totalShares = existingPosition.shares + shares;
    const totalCost = (existingPosition.shares * existingPosition.averageCost) + (shares * price);
    existingPosition.shares = totalShares;
    existingPosition.averageCost = totalCost / totalShares;
    existingPosition.totalCost = totalCost;
    existingPosition.currentPrice = price;
    existingPosition.totalValue = totalShares * price;
    existingPosition.unrealizedPL = existingPosition.totalValue - totalCost;
    existingPosition.unrealizedPLPercent = (existingPosition.unrealizedPL / totalCost) * 100;
    existingPosition.lastUpdated = Date.now();
  } else {
    // Add new position
    this.positions.push({
      symbol,
      companyName,
      shares,
      averageCost: price,
      currentPrice: price,
      totalCost: shares * price,
      totalValue: shares * price,
      unrealizedPL: 0,
      unrealizedPLPercent: 0,
      lastUpdated: Date.now()
    });
  }
};

// Method to reduce a position (sell shares)
portfolioSchema.methods.reducePosition = function(symbol, shares, price) {
  const position = this.positions.find(p => p.symbol === symbol);
  
  if (!position) {
    throw new Error(`Position ${symbol} not found`);
  }
  
  if (position.shares < shares) {
    throw new Error(`Insufficient shares. You have ${position.shares} shares of ${symbol}`);
  }
  
  // Calculate realized P&L for the shares being sold
  const realizedPL = (price - position.averageCost) * shares;
  
  // Update position
  position.shares -= shares;
  position.totalCost = position.shares * position.averageCost;
  position.currentPrice = price;
  position.totalValue = position.shares * price;
  position.unrealizedPL = position.totalValue - position.totalCost;
  position.unrealizedPLPercent = position.totalCost > 0 ? (position.unrealizedPL / position.totalCost) * 100 : 0;
  position.lastUpdated = Date.now();
  
  // Remove position if no shares left
  if (position.shares === 0) {
    this.positions = this.positions.filter(p => p.symbol !== symbol);
  }
  
  return realizedPL;
};

// Method to update all position prices
portfolioSchema.methods.updatePositionPrices = function(priceMap) {
  this.positions.forEach(position => {
    const newPrice = priceMap[position.symbol];
    if (newPrice !== undefined) {
      position.currentPrice = newPrice;
      position.totalValue = position.shares * newPrice;
      position.unrealizedPL = position.totalValue - position.totalCost;
      position.unrealizedPLPercent = (position.unrealizedPL / position.totalCost) * 100;
      position.lastUpdated = Date.now();
    }
  });
};

// Method to calculate total portfolio value
portfolioSchema.methods.calculateTotalValue = function() {
  const positionsValue = this.positions.reduce((sum, pos) => sum + pos.totalValue, 0);
  this.totalValue = this.cash + positionsValue;
  
  // Calculate total P&L (current value - starting value of 100000)
  const startingValue = 100000;
  this.totalPL = this.totalValue - startingValue;
  this.totalPLPercent = ((this.totalValue - startingValue) / startingValue) * 100;
  
  return this.totalValue;
};

// Static method to create a new portfolio for a user
portfolioSchema.statics.createForUser = async function(userId, startingCash = 100000) {
  const portfolio = new this({
    userId,
    cash: startingCash,
    totalValue: startingCash
  });
  return await portfolio.save();
};

// Static method to get portfolio with current prices
portfolioSchema.statics.getWithCurrentPrices = async function(userId) {
  const portfolio = await this.findOne({ userId, isActive: true }).populate('userId', 'username displayName');
  if (!portfolio) return null;
  
  // Note: In production, you'd fetch real-time prices here
  // For now, we'll return the portfolio as-is and update prices via the aggregator service
  portfolio.calculateTotalValue();
  return portfolio;
};

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;
