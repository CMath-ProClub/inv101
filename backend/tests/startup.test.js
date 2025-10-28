const { assertJwtSecretValid } = require('../middleware/auth');

test('assertJwtSecretValid throws when in production without JWT_SECRET', () => {
  const prev = process.env.JWT_SECRET;
  try {
    delete process.env.JWT_SECRET;
    expect(() => assertJwtSecretValid(true)).toThrow();
  } finally {
    if (typeof prev !== 'undefined') process.env.JWT_SECRET = prev;
  }
});
