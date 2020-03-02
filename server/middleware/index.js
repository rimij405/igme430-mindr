// Import statements.
const contentParser = require('./parse.js');

// Export middleware.
module.exports = {
    parseMethod: contentParser.parseMethod,
    parseUrl: contentParser.parseUrl,
    parseBody: contentParser.parseBody,
    parseJSON: contentParser.parseJSON,
    parseParams: contentParser.parseParams,
    parseHeaders: contentParser.parseHeaders
};