// Usage: set MONGODB_URI in environment then run:
// node backend/scripts/check_atlas_articles.js

const mongoose = require('mongoose');
const Article = require('../models/Article');
require('dotenv').config();

async function main(){
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in environment. Set it and retry.');
    process.exit(2);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  try {
    const total = await Article.countDocuments({ isActive: true });

    const quarters = await Article.aggregate([
      { $match: { isActive: true, publishDate: { $exists: true } } },
      { $project: { year: { $year: '$publishDate' }, month: { $month: '$publishDate' } } },
      { $project: { year: 1, quarter: { $ceil: { $divide: ['$month', 3] } } } },
      { $group: { _id: { year: '$year', quarter: '$quarter' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.quarter': 1 } }
    ]).exec();

    const topSources = await Article.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]).exec();

    console.log(JSON.stringify({ total, quarters, topSources }, null, 2));
  } catch (err) {
    console.error('Error querying articles:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
