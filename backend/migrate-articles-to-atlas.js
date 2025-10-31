// migrate-articles-to-atlas.js
// This script migrates articles from backend/data/SPY_daily.json to MongoDB Atlas using your Article model.

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load Article model
const Article = require('./models/Article');

// Path to the JSON file
const dataFile = path.join(__dirname, 'data', 'SPY_daily.json');

async function migrate() {
  // Connect to MongoDB Atlas
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB Atlas');

  // Read articles from JSON file
  const rawData = fs.readFileSync(dataFile, 'utf8');
  const articles = JSON.parse(rawData);

  // Validate and filter articles
  const requiredFields = ['summary', 'publishDate', 'url', 'source', 'title'];
  const validArticles = [];
  const skippedArticles = [];

  for (const article of articles) {
    const hasAllFields = requiredFields.every(field => article[field] !== undefined && article[field] !== null && article[field] !== '');
    if (hasAllFields) {
      validArticles.push(article);
    } else {
      skippedArticles.push(article);
    }
  }

  // Insert only valid articles into MongoDB
  const result = await Article.insertMany(validArticles);
  console.log(`Inserted ${result.length} valid articles into MongoDB Atlas.`);
  console.log(`Skipped ${skippedArticles.length} articles due to missing required fields.`);

  // Optionally, write skipped articles to a file for review
  if (skippedArticles.length > 0) {
    fs.writeFileSync(path.join(__dirname, 'skipped_articles.json'), JSON.stringify(skippedArticles, null, 2));
    console.log('Skipped articles written to skipped_articles.json');
  }

  // Close connection
  await mongoose.disconnect();
  console.log('Migration complete.');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
