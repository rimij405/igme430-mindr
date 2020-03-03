// Get all the handlers.
const responseHandler = require('./response.js');
const requestHandler = require('./request.js');
const staticHandler = require('./static.js');
const errorHandlers = require('./errors.js');

// Export wrapper for all handlers.
module.exports = {
  RequestHandler: requestHandler.RequestHandler,
  RequestHandlerChain: requestHandler.RequestHandlerChain,
  sendResponse: responseHandler.sendResponse,
  sendFile: staticHandler.sendFile,
  sendIndex: staticHandler.sendIndex,
  sendError: errorHandlers.sendError,
  sendCustomError: errorHandlers.sendCustomError,
  sendNotFound: errorHandlers.sendNotFound,
  sendBadRequest: errorHandlers.sendBadRequest,
  sendNotImplemented: errorHandlers.sendNotImplemented,
  getFile: staticHandler.getFile,
};
