// Migration script: convert older refresh token storage to id + tokenHash pattern
// Run this once against your MongoDB (node migrate-refresh-tokens.js)
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function migrate() {
  await connectDB();
  console.log('Connected to DB — starting migration');
  const users = await User.find({ 'refreshTokens.0': { $exists: true } });
  console.log(`Found ${users.length} users with refresh tokens`);
  for (const user of users) {
    let changed = false;
    const newTokens = [];
    for (const t of user.refreshTokens || []) {
      // If token already has id and tokenHash, keep as-is
      if (t.id && t.tokenHash) {
        newTokens.push(t);
        continue;
      }
      // If old shape: { token: 'plaintext' } or { token: 'bcrypt-hash' }
      const tokenPlainOrHash = t.token;
      if (!tokenPlainOrHash) continue;
      // If it looks like a bcrypt hash (starts with $2), we can't recover plaintext.
      // We'll keep as tokenHash and generate an id.
      const id = crypto.randomBytes(12).toString('hex');
      if (tokenPlainOrHash.startsWith('$2')) {
        newTokens.push({ id, tokenHash: tokenPlainOrHash, createdAt: t.createdAt || new Date() });
        changed = true;
      } else {
        // Plaintext token: hash it and store
        const hash = await bcrypt.hash(tokenPlainOrHash, 12);
        newTokens.push({ id, tokenHash: hash, createdAt: t.createdAt || new Date() });
        changed = true;
      }
    }
    if (changed) {
      user.refreshTokens = newTokens;
      await user.save();
      console.log(`Migrated user ${user.email}`);
    }
  }
  console.log('Migration complete');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
