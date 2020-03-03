// Import statements.
const http = require('http');
const handlers = require('./handlers');
const { Router } = require('./routes');
const { RequestHandler, RequestHandlerChain } = require('./handlers');

// /////////////////
// HELPER METHODS
// /////////////////

const DEBUG_PORT = 3000;

// Create server instance.
const createServer = (server, done) => {
  // Debug messages.
  if (server.port === 3000) {
    // If the port is 3000, print this debug message.
    console.log('Creating server instance.');
  }

  // Create the server instance.
  server.instance = http.createServer((request, response) => {
    server.handle(request, response, done);
  });
};

// Start and listen to the server.
const listen = (server) => {
  // Debug messages.
  if (server.port === 3000) {
    // If the port is 3000, print this debug message.
    console.log(`Listening to server at 'http://127.0.0.1:${server.port}/'...`);
  }

  // Listen to the server.
  server.instance.listen(server.port);
};

// /////////////////
// Server CLASS
// /////////////////

// Server will 'handle' a request to 'serve' a response.
function Server(onInitCallback = (server) => {}) {
  this.init = onInitCallback || (() => {});
  this.port = process.env.PORT || process.env.NODE_PORT || DEBUG_PORT;
  this.instance = undefined;
  this.middleware = new RequestHandlerChain();
  this.errors = new RequestHandlerChain();
  this.router = new Router();
}

// Executed before the server is started.
Server.prototype.onInit = function (callback = (server) => {}) {
  this.init = () => {
    if (callback && typeof callback === 'function') {
      return callback(this);
    }
  };
};

// Start the server and listen to the set port.
Server.prototype.start = function (done) {
  this.init();
  createServer(this, done);
  listen(this);
};

// Register callbacks.
Server.prototype.register = function (
  handler = (request, response, next) => {},
) {
  if (handler && typeof handler === 'function') {
    if (handler.length === 4) {
      this.errors.register(new RequestHandler(handler));
    } else {
      this.middleware.register(new RequestHandler(handler));
    }
  } else if (handler && handler.register && handler.handle) {
    this.router = new Router(handler);
  }
};

// Register middleware.
Server.prototype.use = function (handler = (request, response, next) => {}) {
  this.register(handler);
};

// Handle the requests.
Server.prototype.handle = function (request, response, done = (err) => {}) {
  const errorHandlers = this.errors;
  const middlewareHandlers = this.middleware;
  const { router } = this;

  // Handle middleware.
  middlewareHandlers.handle(request, response, (err) => {
    if (err) {
      errorHandlers.handle(request, response, () => {
        done(err);
      });
    } else {
      router.handle(request, response, done);
    }
  });
};


// Export Server class.
module.exports = Server;

/*

// Register a router or error handler with the server.
Server.prototype.register = function(router) {
    if(router && router.handle){
        this.handlers.routers.push(router);
    } else if(router && router.length === 4){
        this.handlers.errors.push(router);
    }
};

// Register middleware to execute no matter what.
Server.prototype.use = function(handler = (request, response, next) => {}) {
    if(handler) {
        this.handlers.middleware.push(handler);
    }
};

// Retrieve middleware handler at specified location.
Server.prototype.getMiddleware = function(index) {
    if(this.handlers
        && this.handlers.middleware
        && index >= 0
        && index < this.handlers.middleware.length) {
        return this.handlers.middleware[index];
    }
};

// Retrieve router handler at specified location.
Server.prototype.getRouter = function(index) {
    if(this.handlers
        && this.handlers.routers
        && index >= 0
        && index < this.handlers.routers.length) {
            return this.handlers.routers[index];
    }
};

// Retrieve error handler at specified location.
Server.prototype.getErrorHandler = function(index) {
    if(this.handlers
        && this.handlers.errors
        && index >= 0
        && index < this.handlers.errors.length) {
            return this.handlers.errors[index];
    }
};
*/


/*


// Execute all middleware and routers.
Server.prototype.handle = function(
    request,
    response,
    done = function(err) {
        if(err) {
            console.error(err);
            handlers.sendBadRequest(request, response);
        } else {
            if(!response.writableEnded){
                console.dir(request.parsedUrl);
                handlers.sendNotFound(request, response);
                // handlers.sendNotImplemented(request, response);
            }
        }
    }
){
    if(!request || !response) {
        throw new Error("Function called improperly. Fatal server error.");
    } else {

        // Add the server to the request object.
        request.server = this;

        console.log(`Lengths: ${
            request.server.handlers.middleware.length
        } ${
            request.server.handlers.routers.length
        } ${
            request.server.handlers.errors.length
        }`);

        // Create indice tracker for route handlers.
        const index = {
            middleware: -1,
            error: -1,
            router: -1
        };

        // Dispatch will retrieve the handler to prepare for the next call.
        const dispatch = function(
            err = null,
            middlewareIndex = -1,
            routerIndex = -1,
            errorIndex = -1
        ) {

            // console.log(`Last Index: ${index.middleware} ${index.router} ${index.error}`);

            // Update index values.
            index.middleware = middlewareIndex;
            index.router = routerIndex;
            index.error = errorIndex;

            // Log the indice trackers.
            // console.log(`Current Index: ${index.middleware} ${index.router} ${index.error}`);
            // console.log(`Current Position: ${middlewareIndex} ${routerIndex} ${errorIndex}`);

            if(err && index.error >= request.server.handlers.errors.length) {
                // If all errors processed, and error is not null, return done.
                return done(err);
            } else if(!err){
                // If no error,
                if(index.middleware >= request.server.handlers.middleware.length
                    && index.router >= request.server.handlers.routers.length){
                        // If all middleware processed AND all routers processed, return done.
                        return done(err);
                    }
            }

            ////////////////////////////////
            // Increment wrapper methods.
            ////////////////////////////////

            // Next middleware.
            function nextMiddleware(err = null) {
                return dispatch(err,
                    middlewareIndex + 1,
                    routerIndex,
                    errorIndex);
            };

            // Next router.
            function nextRouter(err = null) {
                return dispatch(err,
                    middlewareIndex,
                    routerIndex + 1,
                    errorIndex);
            };

            // Next error handler.
            function nextErrorHandler(err = null) {
                return dispatch(err,
                    middlewareIndex,
                    routerIndex,
                    errorIndex + 1);
            };

            ////////////////////////////////
            // Closure function for request handler stack.
            ////////////////////////////////

            // Returns the next handler in the stack.
            function next(err = null) {
                if(middlewareIndex < index.middleware
                    || routerIndex < index.router
                    || errorIndex < index.error) {
                        throw new Error(`next() called multiple times.`);
                }

                if(err && index.error < request.server.handlers.errors.length) {
                    return nextErrorHandler(err);
                } else {
                    if(index.middleware < request.server.handlers.middleware.length){
                        return nextMiddleware(err);
                    } else {
                        return nextRouter(err);
                    }
                }
            }

            ////////////////////////////////
            // Determine next handler.
            ////////////////////////////////

            try {

                // Handler reference for specified position.
                const handler = {
                    middleware: request.server.getMiddleware(index.middleware),
                    router: request.server.getRouter(index.router),
                    error: request.server.getErrorHandler(index.error)
                };

                if(err){
                    // Return error handler if error has occured.
                    if(index.error < request.server.handlers.errors.length && handler.error){
                        // If not complete, return the current error handler.
                        return handler.error(err, request, response, next);
                    }
                } else {
                    // If no error, determine if middleware or router.
                    if(index.middleware < request.server.handlers.middleware.length && handler.middleware){
                        // If not complete with middleware, return the current middleware handler.
                        return handler.middleware(request, response, next);
                    } else if(index.router < request.server.handlers.routers.length && handler.router && handler.router.handle){
                        // If not complete with routers, return the current router handler.
                        request.router = handler.router;
                        return handler.router.handle(request, response, next);
                    }
                }

            } catch(e) {

                // Stack doesn't match with stack position.
                if(index.middleware > middlewareIndex
                    || index.router > routerIndex){
                    throw e;
                }

                // Log the error.
                // console.error(`Caught error during dispatch. ${e}`);
                console.error(e);

                // Pass the error with the next call.
                return next(e);
            }

            // End of dispatch(). Return the next in the series.
            next(err);
        };

        // End of handle(). Start at index-zero middleware.
        return dispatch(null, 0, -1, -1);
    }
};
*/
