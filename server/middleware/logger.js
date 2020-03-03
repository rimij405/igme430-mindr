// Import statements.

// Log the path.
const logPath = (request, response, next) => {
  if (request.parsedUrl) {
    console.log(request.parsedUrl.path);
  }
  next();
};

// Log the request method on path.
const logRequest = (request, response, next) => {
  if (request.parsedUrl) {
    console.log(`'${request.method}' on '${request.parsedUrl.path}'`);
  }
  next();
};

// Export function.
module.exports = {
  logPath,
  logRequest,
};
