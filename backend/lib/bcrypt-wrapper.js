const util = require('util');

let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch (err) {
  bcrypt = require('bcryptjs');
}

if (bcrypt && typeof bcrypt.hash === 'function') {
  bcrypt.hash = util.promisify(bcrypt.hash);
}

if (bcrypt && typeof bcrypt.compare === 'function') {
  bcrypt.compare = util.promisify(bcrypt.compare);
}

module.exports = bcrypt;
