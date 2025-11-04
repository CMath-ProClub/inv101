// migrate-prices-to-atlas.js
// Import daily price JSON (e.g., backend/data/SPY_daily.json) into MongoDB Atlas as StockPrice docs.

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load StockPrice model
const StockPrice = require('./models/StockPrice');

// Path to the JSON file (default: SPY_daily.json)
const dataFile = path.join(__dirname, 'data', process.env.PRICES_FILE || 'SPY_daily.json');


async function migrate() {
  const dryRun = String(process.env.DRY_RUN || process.env.dry_run || 'false').toLowerCase() === 'true';

  const uriIssue = (u => {
    if (!u) return 'MONGODB_URI is empty';
    if (u.includes('<') || u.includes('>')) return 'Connection string contains angle brackets (< >) — remove them';
    if (u.match(/\s/)) return 'Connection string contains whitespace';
    return null;
  })(process.env.MONGODB_URI);
  if (uriIssue) {
    console.warn('MONGODB_URI preflight warning:', uriIssue);
    if (!dryRun) {
      console.error('Aborting because MONGODB_URI looks invalid. Use DRY_RUN=true to inspect without connecting.');
      process.exit(1);
    }
  }

  const rawData = fs.readFileSync(dataFile, 'utf8');
  const prices = JSON.parse(rawData);

  const symbol = (process.env.MIGRATION_SYMBOL || 'SPY').toUpperCase();

  // Prepare bulk upsert operations
  const ops = [];
  for (const p of prices) {
    // Expected minimal shape: { date: 'YYYY-MM-DD', close: number }
    const doc = {
      symbol,
      date: p.date ? new Date(p.date) : null,
      close: typeof p.close === 'number' ? p.close : (p.Close || null),
      open: p.open || p.Open || null,
      high: p.high || p.High || null,
      low: p.low || p.Low || null,
      adjustedClose: p.adjClose || p.adjustedClose || p['adjusted close'] || null,
      volume: p.volume || p.Volume || null,
      source: 'local',
      raw: p
    };

    if (!doc.date || doc.close === null || doc.close === undefined) {
      console.warn('Skipping entry with missing date or close:', p);
      continue;
    }

    ops.push({
      updateOne: {
        filter: { symbol: doc.symbol, date: doc.date },
        update: { $set: doc },
        upsert: true
      }
    });
  }

  if (ops.length === 0) {
    console.log('No valid price entries found to insert.');
    return;
  }

  if (dryRun) {
    console.log(`DRY RUN: ${ops.length} upsert operations would be executed.`);
    console.log('Sample operation:', JSON.stringify(ops[0], null, 2));
    return;
  }

  // Connect to MongoDB Atlas
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const res = await StockPrice.bulkWrite(ops, { ordered: false });

  console.log('Migration bulkWrite result:', {
    insertedCount: res.insertedCount || 0,
    matchedCount: res.matchedCount || 0,
    modifiedCount: res.modifiedCount || 0,
    upsertedCount: res.upsertedCount || 0
  });

  await mongoose.disconnect();
  console.log('Price migration complete.');
}

migrate().catch(err => {
  console.error('Price migration failed:', err);
  process.exit(1);
});
