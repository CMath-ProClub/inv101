<<<<<<< HEAD
const path = require('path');
let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch (err) {
  // Fallback to bcryptjs when native bcrypt isn't available
  bcrypt = require('bcryptjs');
  // normalize API to return promises for hash/compare
  const origHash = bcrypt.hash;
  const origCompare = bcrypt.compare;
  if (origHash.length !== 3) {
    bcrypt.hash = (data, saltOrRounds) => {
      return new Promise((resolve, reject) => {
        try {
          origHash(data, saltOrRounds, (err, res) => (err ? reject(err) : resolve(res)));
        } catch (e) {
          reject(e);
        }
      });
    };
  }
  if (origCompare.length !== 3) {
    bcrypt.compare = (data, hash) => {
      return new Promise((resolve, reject) => {
        try {
          origCompare(data, hash, (err, res) => (err ? reject(err) : resolve(res)));
        } catch (e) {
          reject(e);
        }
      });
    };
  }
}
=======
let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch (err) {
  // Fallback to bcryptjs when native bcrypt isn't available
  bcrypt = require('bcryptjs');
  // normalize API to return promises for hash/compare
  const origHash = bcrypt.hash;
  const origCompare = bcrypt.compare;
  if (origHash.length !== 3) {
    bcrypt.hash = (data, saltOrRounds) => {
      return new Promise((resolve, reject) => {
        try {
          origHash(data, saltOrRounds, (err, res) => (err ? reject(err) : resolve(res)));
        } catch (e) {
          reject(e);
        }
      });
    };
  }
  if (origCompare.length !== 3) {
    bcrypt.compare = (data, hash) => {
      return new Promise((resolve, reject) => {
        try {
          origCompare(data, hash, (err, res) => (err ? reject(err) : resolve(res)));
        } catch (e) {
          reject(e);
        }
      });
    };
  }
}
>>>>>>> 21f29f3d8a487cca9e2269d21a36819b803bd57b

const path = require('path');
let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch (err) {
  // Fallback to bcryptjs when native bcrypt isn't available
  bcrypt = require('bcryptjs');
  // normalize API to return promises for hash/compare
  const origHash = bcrypt.hash;
  const origCompare = bcrypt.compare;
  if (origHash.length !== 3) {
    bcrypt.hash = (data, saltOrRounds) => {
      return new Promise((resolve, reject) => {
        try {
          origHash(data, saltOrRounds, (err, res) => (err ? reject(err) : resolve(res)));
        } catch (e) {
          reject(e);
        }
      });
    };
  }
  if (origCompare.length !== 3) {
    bcrypt.compare = (data, hash) => {
      return new Promise((resolve, reject) => {
        try {
          origCompare(data, hash, (err, res) => (err ? reject(err) : resolve(res)));
        } catch (e) {
          reject(e);
        }
      });
    };
  }
}
