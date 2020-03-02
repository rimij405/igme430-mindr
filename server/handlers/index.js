// Get all the handlers.
const responseHandler = require('./response.js');
const staticHandler = require('./static.js');
const errorHandlers = require('./errors.js');

// Export wrapper for all handlers.
module.exports = {
    sendResponse: responseHandler.sendResponse,
    sendFile: staticHandler.sendFile,
    sendIndex: staticHandler.sendIndex,
    sendError: errorHandlers.sendError,
    sendCustomError: errorHandlers.sendCustomError,
    sendNotFound: errorHandlers.sendNotFound,
    sendBadRequest: errorHandlers.sendBadRequest,
    sendNotImplemented: errorHandlers.sendNotImplemented
};
