// Import statements.
const contentParser = require('./parse.js');
const contentLogger = require('./logger.js');

// Export middleware.
module.exports = {
    parseMethod: contentParser.parseMethod,
    parseUrl: contentParser.parseUrl,
    parseBody: contentParser.parseBody,
    parseJSON: contentParser.parseJSON,
    parseParams: contentParser.parseParams,
    parseHeaders: contentParser.parseHeaders,
    logRequest: contentLogger.logRequest
};