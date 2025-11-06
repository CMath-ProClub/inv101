'use strict';

const assert = require('assert');
const utils = require('../newsletter-utils.js');

function run() {
  const performers = utils.transformPerformers(utils.samples.performers);
  assert.strictEqual(performers.length, 5, 'expected five sample performers');
  assert.strictEqual(performers[0].ticker, 'NVDA');
  assert.ok(performers[0].moveLabel.endsWith('%'), 'performer move label should include percent');
  assert.strictEqual(performers[0].moveClass, 'move--up');

  const projections = utils.transformRecommendations(utils.samples.recommendations);
  assert.strictEqual(projections.length, 5, 'expected five sample projections');
  assert.strictEqual(projections[0].ticker, 'MSFT');
  assert.ok(/%/.test(projections[0].projectedLabel), 'projection label should include percent');
  assert.ok(projections[0].confidenceLabel.toLowerCase().includes('confidence'));

  const summary = utils.buildContextSummary(performers, projections);
  assert.ok(summary.includes('MSFT'), 'summary should highlight top recommendation');
  assert.ok(summary.includes('NVDA'), 'summary should highlight leading performer');
  assert.ok(summary.length > 50, 'summary should provide meaningful narrative');

  console.log('✅ newsletter-utils tests passed');
}

try {
  run();
} catch (error) {
  console.error('❌ newsletter-utils tests failed');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
}
