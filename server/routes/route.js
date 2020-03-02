const { pathToRegexp } = require("path-to-regexp");

////////////////////
// Route CLASS
////////////////////

// The Route maintains reference to a regexp path pattern, method, and middleware function.
function Route(
  method = null,
  path = null,
  callback = (request, response, next) => {}
) {
  this.method = method;
  this.path = pathToRegexp(path || "*");
  this.callback = callback;
}

// Check if route is for specified HTTP Method.
Route.prototype.isMethod = function(method) {
  return this.method === HTTP_METHOD.ALL || this.method === method;
};

// Check if route matches specified path.
Route.prototype.isPath = function(path) {
  return path && this.path.match(path);
};

// Export class.
module.exports = Route;
