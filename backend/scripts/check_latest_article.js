const path = require('path');
const mongoose = require('mongoose');

// Ensure dotenv loads backend/.env if present
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/database');

async function main() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    const Article = require('../models/Article');

    // Wait briefly for connections
    await new Promise((res) => setTimeout(res, 500));

    const info = {
      mongoHost: mongoose.connection.host || '(unknown)',
      readyState: mongoose.connection.readyState
    };

    console.log('DB connection info:', info);

    const latest = await Article.findOne({}).sort({ publishDate: -1 }).lean().exec();

    if (!latest) {
      console.log('No articles found in the database.');
    } else {
      console.log('Most recent article:');
      console.log('  title :', latest.title || '(no title)');
      console.log('  source:', latest.source || '(no source)');
      console.log('  url   :', latest.url || '(no url)');
      console.log('  publishDate :', latest.publishDate ? new Date(latest.publishDate).toISOString() : '(no publishDate)');
      console.log('  _id   :', latest._id);
    }

    await mongoose.connection.close();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error while checking latest article:', err && err.message ? err.message : err);
    try { await mongoose.connection.close(); } catch (e) {}
    process.exit(2);
  }
}

main();
