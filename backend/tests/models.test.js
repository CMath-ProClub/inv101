const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

test('User password hashing and verification works', async () => {
  const User = require('../models/User');
  const email = `u${Date.now()}@example.com`;
  const password = 'S3curePa$$';
  const user = await User.createWithPassword(email, password);
  expect(user).toBeDefined();
  const ok = await user.verifyPassword(password);
  expect(ok).toBe(true);
  const bad = await user.verifyPassword('wrong');
  expect(bad).toBe(false);
});

test('Refresh tokens are stored hashed with id and not in plaintext', async () => {
  const User = require('../models/User');
  const email = `u${Date.now()}@example.com`;
  const password = 'S3curePa$$';
  const user = await User.createWithPassword(email, password);
  const refreshPlain = 'refresh-test-' + Date.now();
  const id = await user.addRefreshToken(refreshPlain);
  expect(id).toBeDefined();

  // Reload user from DB to ensure persistence
  const reloaded = await User.findOne({ email }).lean();
  expect(reloaded).toBeTruthy();
  expect(Array.isArray(reloaded.refreshTokens)).toBe(true);
  const tokenEntry = reloaded.refreshTokens.find(t => t.id === id);
  expect(tokenEntry).toBeDefined();
  expect(tokenEntry.tokenHash).toBeDefined();
  // Stored hash must not equal plaintext
  expect(tokenEntry.tokenHash).not.toBe(refreshPlain);

  // bcrypt compare should succeed when using model helper path
  const found = await User.findByRefreshTokenCookie(`${id}.${refreshPlain}`);
  expect(found).toBeTruthy();
  expect(found.user.email).toBe(email);
});

test('Portfolio recalculateAccountValue handles holdings and shorts', async () => {
  const Portfolio = require('../models/Portfolio');
  const p = new Portfolio({ account: {}, holdings: [], shorts: [] });
  p.holdings.push({ symbol: 'AAPL', purchasePrice: 120, qty: 10 }); // market price 150 -> 1500
  p.holdings.push({ symbol: 'TSLA', purchasePrice: 190, qty: 5 }); // market price 200 -> 1000
  p.shorts.push({ symbol: 'NFLX', purchasePrice: 300, qty: 2 }); // market price 250 -> -500

  p.recalculateAccountValue({ AAPL: 150, TSLA: 200, NFLX: 250 });
  // 1500 + 1000 - 500 = 2000
  expect(p.account.accountValue).toBeCloseTo(2000, 2);
});
