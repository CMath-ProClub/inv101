// check_stockprices.js
// Small utility to report StockPrice collection counts and date range.
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const StockPrice = require('../models/StockPrice');

(async function(){
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set. Exiting.');
    process.exit(1);
  }
  try {
  await mongoose.connect(process.env.MONGODB_URI);
    const total = await StockPrice.countDocuments();
    const earliest = await StockPrice.findOne().sort({ date: 1 }).select('date symbol').lean();
    const latest = await StockPrice.findOne().sort({ date: -1 }).select('date symbol').lean();
    const bySymbol = await StockPrice.aggregate([
      { $group: { _id: '$symbol', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    console.log('StockPrice summary:');
    console.log('  total:', total);
    console.log('  earliest:', earliest ? `${earliest.symbol} @ ${earliest.date}` : 'n/a');
    console.log('  latest:', latest ? `${latest.symbol} @ ${latest.date}` : 'n/a');
    console.log('  top symbols:', bySymbol.map(b => `${b._id}(${b.count})`).join(', '));
  } catch (e) {
    console.error('check_stockprices failed:', e);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
