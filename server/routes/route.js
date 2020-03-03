const { pathToRegexp } = require('path-to-regexp');
const HTTP_METHOD = require('./../utils').methods;

// //////////////////
// Route CLASS
// //////////////////

// The Route maintains reference to a regexp path pattern, method, and middleware function.
function Route(
  method = null,
  path = null,
) {
  this.method = method;
  this.path = pathToRegexp(path || '*');
}

// Check if route is for specified HTTP Method.
Route.prototype.isMethod = function (method) {
  return this.method === HTTP_METHOD.ALL || this.method === method;
};

// Check if route matches specified path.
Route.prototype.isPath = function (path) {
  return path && this.path.exec(path);
};

// Export class.
module.exports = Route;
