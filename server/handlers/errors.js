// Import statements.
const fs = require('fs');
const responseHandler = require('./response.js');

// /////////////////
// Error Class
// /////////////////

// If there's an error reading the error codes.
function Error(status, id, message) {
  this.status = status,
  this.id = id,
  this.message = message;
}

// Service function for logging error.
Error.prototype.log = function () {
  console.error(`[Error] '${this.status} ${this.id}' - '${this.message}'`);
};

// /////////////////
// HELPER METHODS
// /////////////////

// Create a custom error.
const createError = (status = 500,
  id = 'Internal Server Error',
  message = 'An unexpected error occured on the server. Please notify the system administrator.') => new Error(status, id, message);

// Parse the error JSON file synchronously.
const defineErrors = (file) => {
  const defaultError = {
    default: createError(),
  };

  // Process the file.
  if (file) {
    try {
      const data = fs.readFileSync(file);
      const errs = JSON.parse(data).error;
      errs.default = defaultError.default;
      return errs;
    } catch (e) {
      return {
        default: createError(undefined, undefined, e),
      };
    }
  }

  // If no file, return default error alone.
  return defaultError;
};

// Prepare the error JSON.
const errors = defineErrors(`${__dirname}/../db/error.json`);

// /////////////////
// RESPONSE HANDLERS
// /////////////////

// Send a custom error.
const sendCustomError = (request, response, options = {
  status: 501,
  id: 'Custom error id',
  message: 'Custom error message.',
}) => {
  // Get the error for this response.
  const err = new Error(options.status, options.id, options.message);

  // Log the error.
  if (err && err.log) { err.log(); }

  // Send the response.
  responseHandler.sendResponse(request, response, {
    status: options.status || err.status,
    headers: options.headers || { 'Content-Type': 'application/json' },
    content: JSON.stringify({ id: err.id, message: err.message }),
  });
};

// Send error responses back to the client.
const sendError = (request, response, options = {
  status: 404,
}) => {
  // Get the error for this response.
  const err = errors[`${options.status || 404}`] || errors.default;

  // Log the error.
  if (err && err.log) { err.log(); }

  // Send the response.
  responseHandler.sendResponse(request, response, {
    status: options.status || err.status,
    headers: options.headers || { 'Content-Type': 'application/json' },
    content: JSON.stringify({ id: err.id, message: err.message }),
  });
};

// Send Not Implemented error.
const sendNotImplemented = (request, response) => {
  sendError(request, response, { status: 501 });
};

// Send Bad Request error.
const sendBadRequest = (request, response) => {
  sendError(request, response, { status: 400 });
};

// Send Not Found error.
const sendNotFound = (request, response) => {
  sendError(request, response, { status: 404 });
};

// Export the function.
module.exports = {
  Error,
  sendCustomError,
  sendError,
  sendNotFound,
  sendBadRequest,
  sendNotImplemented,
};
