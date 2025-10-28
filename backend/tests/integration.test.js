const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const connectDB = require('../config/database');

let mongo;
let app;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  // connectDB will use MONGODB_URI
  await connectDB();
  // Import app after DB env set and DB connected
  ({ app } = require('../index'));
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

test('signup -> login -> protected portfolio endpoints work', async () => {
  const agent = request.agent(app);
  const email = `test+${Date.now()}@example.com`;
  const password = 'TestPass123!';

  // Signup
  const su = await agent.post('/api/auth/signup').send({ email, password });
  expect(su.statusCode).toBe(200);
  expect(su.body.success).toBe(true);

  // Me endpoint should return user when cookie present
  const me = await agent.get('/api/auth/me');
  expect(me.statusCode).toBe(200);
  expect(me.body.success).toBe(true);
  expect(me.body.user.email).toBe(email);

  // Attempt a buy on portfolio
  const buy = await agent.post('/api/portfolio/buy').send({ symbol: 'AAPL', qty: 1, price: 150 });
  expect(buy.statusCode).toBe(200);
  expect(buy.body.success).toBe(true);
  expect(buy.body.portfolio.holdings.length).toBeGreaterThan(0);

  // Logout
  const lo = await agent.post('/api/auth/logout');
  expect(lo.statusCode).toBe(200);
  expect(lo.body.success).toBe(true);

  // Now me should 401
  const me2 = await agent.get('/api/auth/me');
  expect(me2.statusCode).toBe(401);
});
