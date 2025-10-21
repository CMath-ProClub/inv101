#!/usr/bin/env node

/**
 * Helper script to update .env with MongoDB Atlas connection string
 * Run this after getting your connection string from Atlas
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║   MongoDB Atlas Connection String Setup Helper      ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

console.log('📋 You need your connection string from MongoDB Atlas.\n');
console.log('It should look like:');
console.log('mongodb+srv://username:password@cluster.xxxxx.mongodb.net/...\n');

rl.question('Paste your MongoDB Atlas connection string here: ', (connectionString) => {
  
  if (!connectionString || !connectionString.trim()) {
    console.log('\n❌ No connection string provided. Exiting.');
    rl.close();
    return;
  }

  connectionString = connectionString.trim();

  // Validate it looks like a MongoDB connection string
  if (!connectionString.startsWith('mongodb+srv://') && !connectionString.startsWith('mongodb://')) {
    console.log('\n❌ Error: This doesn\'t look like a MongoDB connection string.');
    console.log('   It should start with "mongodb+srv://" or "mongodb://"');
    rl.close();
    return;
  }

  // Check if it has <password> placeholder
  if (connectionString.includes('<password>')) {
    console.log('\n⚠️  Warning: Your connection string has <password> placeholder!');
    rl.question('\nEnter your actual MongoDB password: ', (password) => {
      connectionString = connectionString.replace('<password>', password);
      updateEnvFile(connectionString);
      rl.close();
    });
  } else {
    // Add database name if not present
    if (!connectionString.includes('/investing101')) {
      if (connectionString.includes('/?')) {
        connectionString = connectionString.replace('/?', '/investing101?');
      } else if (connectionString.includes('?')) {
        connectionString = connectionString.replace('?', '/investing101?');
      } else {
        connectionString += '/investing101';
      }
      console.log('\n✅ Added database name: /investing101');
    }
    
    updateEnvFile(connectionString);
    rl.close();
  }
});

function updateEnvFile(connectionString) {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('\n❌ Error: .env file not found at:', envPath);
    return;
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if MONGODB_URI already exists
  if (envContent.includes('MONGODB_URI=mongodb+srv://')) {
    console.log('\n⚠️  MONGODB_URI already exists in .env');
    console.log('   Updating it with new value...');
    
    // Replace existing MongoDB Atlas URI
    envContent = envContent.replace(
      /MONGODB_URI=mongodb\+srv:\/\/[^\n]*/g,
      `MONGODB_URI=${connectionString}`
    );
  } else {
    // Add new MONGODB_URI at the top
    envContent = `MONGODB_URI=${connectionString}\n\n` + envContent;
  }

  // Write back to file
  fs.writeFileSync(envPath, envContent, 'utf8');
  
  console.log('\n✅ Updated backend/.env successfully!');
  console.log('\n📝 Connection string saved:');
  console.log('   ' + connectionString.replace(/:[^:@]*@/, ':****@')); // Hide password
  
  console.log('\n🧪 Next step: Test the connection');
  console.log('   Run: node backend/test-mongodb-connection.js');
  
  console.log('\n📦 Then populate the database:');
  console.log('   Run: node backend/run-all-scrapers.js');
  
  console.log('\n🚀 Finally, start your server:');
  console.log('   Run: node backend/index.js');
}
