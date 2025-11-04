// backup_stockprices.js
// Exports StockPrice documents to backend/data/stockprice-backup-<timestamp>.json
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const StockPrice = require('../models/StockPrice');

(async function(){
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set. Exiting.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const docs = await StockPrice.find({}).lean();
    const ts = new Date().toISOString().replace(/[:.]/g,'-');
    const outDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `stockprice-backup-${ts}.json`);
    fs.writeFileSync(outPath, JSON.stringify(docs, null, 2));
    console.log(`Exported ${docs.length} documents to ${outPath}`);
  } catch (e) {
    console.error('backup failed:', e);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
