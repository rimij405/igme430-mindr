// Import statements.
const errorHandler = require('./errors.js');

// /////////////////
// HELPER METHODS
// /////////////////

// Valid request?
const verifyRequest = (request) => (request && request.method && request.url);

// Valid response object?
const verifyResponse = (response) => (response && response.writeHead && response.write && response.end);

// /////////////////
// RequestHandler CLASS
// /////////////////

// Register collection of handlers in order to consume a request and send a response.
function RequestHandler(callback = (request, response) => {}) {
  this.callback = callback;
  this.verifyRequest = verifyRequest;
  this.verifyResponse = verifyResponse;
}

// Handle a request and possibly send a response.
RequestHandler.prototype.handle = function (request, response, next) {
  // Prepare promise to consume the request.
  const consumeRequest = (requestHandler) => new Promise((resolve, reject) => {
    if (!verifyRequest(request)) {
      // Response object missing. Cannot handle.
      return reject(new Error('No response object provided. Cannot send response.'));
    }

    if (!verifyResponse(response)) {
      return resolve(errorHandler.sendBadRequest);
    }

    // If request can be consumed, return the callback.
    return resolve(requestHandler.callback);
  });

  // Consume the request.
  consumeRequest(this).then((handler) => {
    handler(request, response, next);
  }).catch((err) => {
    next(err);
  });
};

// /////////////////
// RequestHandlerChain CLASS
// /////////////////

// Collection of request handlers.
function RequestHandlerChain(handlers = []) {
  this.handlers = [];
  this.register(handlers);
}

// Get the length of a chain.
RequestHandlerChain.prototype.getChainLength = function () {
  return (this.handlers) ? this.handlers.length : 0;
};

// Register a single handler, RequestHandler, or a collection of handlers.
RequestHandlerChain.prototype.register = function (handler = (request, response, next) => {}) {
  if (handler && Array.isArray(handler) && handler.length > 0) {
    handler.forEach((callback) => {
      // Push each individual handler onto the stack.
      this.register(callback);
    });
  } else if (handler && typeof handler === 'function' && handler.length >= 2) {
    // Push a new RequestHandler onto the stack,
    // as long as it is a function with minimum arity of 2.
    this.handlers.push(new RequestHandler(handler));
  } else if (handler && handler.handle) {
    // Push RequestHandler onto the stack.
    this.handlers.push(handler);
  }
};

// Handle stack.
RequestHandlerChain.prototype.handle = function (request, response, done = (err) => {}) {
  // Track index and length of stack.
  let index = -1;
  const length = this.getChainLength();

  // Dispatch the next method.
  const dispatch = (err, currentIndex) => {
    // console.log(`Index, CurrentIndex, Length: ${index}, ${currentIndex}, ${length}`);

    // Prepare method for getting the next handler.
    const next = (err) => {
      if (err) {
        return errorHandler.sendCustomError(request, response, {
          status: 500,
          id: 'Internal Server Error',
          message: `Unexpected error. '${err}'.`,
        });
      }
      // Get the next handler.
      return dispatch(err, currentIndex + 1);
    };

    // If we reach the end of the stack, we are done.
    if (currentIndex >= length) {
      // console.log("Done 4");
      return done(err);
    }

    // If we are not at the end of the stack, update index.
    index = currentIndex;

    // Ensure index is within bounds.
    if (index >= 0 && index < length) {
      const handler = this.handlers[index];
      if (handler) {
        // console.log(handler.handle.toString());
        return handler.handle(request, response, next);
      }
      // console.log("Error.");
      return dispatch(new Error(`Could not retrieve handler at specified index ${index}.`), currentIndex + 1);
    }
    // console.log("Done.");
    // If out of bounds, end run.
    return done(err);
  };

  // On initial run, dispatch at index zero.
  return dispatch(undefined, 0);
};

// Export classes.
module.exports = {
  RequestHandler,
  RequestHandlerChain,
};
