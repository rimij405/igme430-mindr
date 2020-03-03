const RegexFactory = require('regex');

// Creation of a route pattern.
const createPattern = (path = '/') => new RegexFactory(path);

// Check if a pattern matches.
const testPattern = (expected = '/', actual = undefined) => {
  if (expected != null && expected != undefined) {
    const regexp = createPattern(expected);
    if (actual != null && actual != undefined) {
      regexp.test(actual);
    }
    return false;
  }
};

// Export utility functions.
module.exports = {
  createPattern,
  testPattern,
};
