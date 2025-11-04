// migrate-articles-to-atlas.js
// This script migrates articles or routes time-series JSON into the proper MongoDB collections.
// If the input JSON looks like time-series price data (has 'date' and 'close'), it will import into
// the StockPrice collection. Otherwise it will import into the Article collection.

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Models
const Article = require('./models/Article');
let StockPrice;
try { StockPrice = require('./models/StockPrice'); } catch (e) { /* may not exist yet */ }

// Path to the JSON file (default: SPY_daily.json)
const dataFile = path.join(__dirname, 'data', process.env.MIGRATION_FILE || 'SPY_daily.json');

function uriLooksSuspicious(uri) {
  if (!uri) return 'MONGODB_URI is empty';
  if (uri.includes('<') || uri.includes('>')) return 'Connection string contains angle brackets (< >) — remove them and paste the raw credentials';
  if (uri.match(/\s/)) return 'Connection string contains whitespace — ensure you pasted it correctly';
  return null;
}

async function migrate() {
  const dryRun = String(process.env.DRY_RUN || process.env.dry_run || 'false').toLowerCase() === 'true';

  const uriIssue = uriLooksSuspicious(process.env.MONGODB_URI);
  if (uriIssue) {
    console.warn('MONGODB_URI preflight warning:', uriIssue);
    if (!dryRun) {
      console.error('Aborting because MONGODB_URI looks invalid. To run anyway set DRY_RUN=true to inspect without connecting.');
      process.exit(1);
    }
  }

  // Read data from JSON file
  const rawData = fs.readFileSync(dataFile, 'utf8');
  const items = JSON.parse(rawData);

  if (!Array.isArray(items) || items.length === 0) {
    console.error('Input JSON is empty or not an array. Aborting.');
    return;
  }
  // Heuristic: if objects have `date` and `close` keys, treat as price/time-series
  const sample = items.find(Boolean);
  const looksLikePrices = sample && (('date' in sample) || ('Date' in sample)) && (('close' in sample) || ('Close' in sample) || ('closePrice' in sample));

  if (looksLikePrices && StockPrice) {
    console.log('Detected time-series price JSON. Routing to StockPrice collection.');

    const symbol = (process.env.MIGRATION_SYMBOL || 'SPY').toUpperCase();
    const ops = [];
    for (const p of items) {
      const dateVal = p.date || p.Date || null;
      const closeVal = (typeof p.close === 'number') ? p.close : (p.Close || p.closePrice || null);
      if (!dateVal || closeVal === null || closeVal === undefined) {
        console.warn('Skipping price entry due to missing date or close:', p);
        continue;
      }
      const doc = {
        symbol,
        date: new Date(dateVal),
        close: Number(closeVal),
        open: p.open || p.Open || null,
        high: p.high || p.High || null,
        low: p.low || p.Low || null,
        adjustedClose: p.adjClose || p.adjustedClose || null,
        volume: p.volume || p.Volume || null,
        source: p.source || 'local',
        raw: p
      };

      ops.push({
        updateOne: {
          filter: { symbol: doc.symbol, date: doc.date },
          update: { $set: doc },
          upsert: true
        }
      });
    }

    if (ops.length === 0) {
      console.log('No valid price entries to upsert.');
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
    console.log('StockPrice migration result:', res.result || res);

    await mongoose.disconnect();
    console.log('Price migration complete.');
    return;
  }

  // Otherwise assume article-shaped JSON and insert into Article
  console.log('Treating input as articles — inserting into Article collection.');

  const requiredFields = ['summary', 'publishDate', 'url', 'source', 'title'];
  const validArticles = [];
  const skippedArticles = [];

  for (const article of items) {
    const hasAllFields = requiredFields.every(field => article[field] !== undefined && article[field] !== null && article[field] !== '');
    if (hasAllFields) {
      validArticles.push(article);
    } else {
      skippedArticles.push(article);
    }
  }

  if (validArticles.length > 0) {
    if (dryRun) {
      console.log(`DRY RUN: ${validArticles.length} articles would be inserted.`);
      console.log('Sample article:', JSON.stringify(validArticles[0], null, 2));
    } else {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB Atlas');
      const result = await Article.insertMany(validArticles);
      console.log(`Inserted ${result.length} valid articles into MongoDB Atlas.`);
      await mongoose.disconnect();
    }
  } else {
    console.log('No valid articles to insert.');
  }

  console.log(`Skipped ${skippedArticles.length} articles due to missing required fields.`);
  if (skippedArticles.length > 0) {
    fs.writeFileSync(path.join(__dirname, 'skipped_articles.json'), JSON.stringify(skippedArticles, null, 2));
    console.log('Skipped articles written to skipped_articles.json');
  }

  console.log('Migration complete.');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
