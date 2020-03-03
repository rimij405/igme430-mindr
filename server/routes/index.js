// /////////////////
// HELPER METHODS
// /////////////////
const routerMap = require('./router.js');

// Functions that get exported are required here.
module.exports = {
  Router: routerMap.Router,
  RouteHandler: routerMap.RouteHandler,
  Route: require('./route.js'),
};
