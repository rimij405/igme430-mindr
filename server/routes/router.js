const { pathToRegexp } = require("path-to-regexp");
const url = require("url");
const HTTP_METHOD = require("./../utils").methods;
const ArrayUtil = require("./../utils").array;

///////////////////
// HELPER METHODS
///////////////////

/*
const routes = {
    "/": sendIndex,
    "/index.html": sendIndex,
    "/main.js": (request, response) => { 
        sendFile(request, response, 'text/javascript', entry);
    },
    "/main.css": (request, response) => { 
        sendFile(request, response, 'text/css', main);
    },
    "/style.css": (request, response) => { 
        sendFile(request, response, 'text/css', style);
    },
};*/

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

// Create a request handler stack.
function RequestHandlerStack(collection = null) {
    if (collection && Array.isArray(collection)) {
        this.stack = ArrayUtil.copy(collection);
    if (collection instanceof RequestHandStack) {
        this.stack = ArrayUtil.copy(collection.stack);
    } else {
        this.stack = [];
    }
  }
}

////////////////////
// RequestHandlerStack CLASS
////////////////////

// Push element onto the stack.
RequestHandlerStack.prototype.push = function(element) {
    this.stack = this.stack || [];
    this.stack.push(element);
}

// Check if element in stack matches method.
RequestHandlerStack.prototype.verifyMethod = function(
  method = "*",
  index = -1
) {
  if (index >= 0 && index < this.stack.length) {
    let route = this.stack[index];
    return route && route.method && route.isMethod(method);
  } else {
    return false;
  }
};

// Check if element in stack matches path provided.
RequestHandlerStack.prototype.verifyPath = function(path = "/", index = -1) {
  if (index >= 0 && index < this.stack.length) {
    let route = this.stack[index];
    return route && route.path && route.isPath(path);
  } else {
    return false;
  }
};

////////////////////
// ROUTER CLASS
////////////////////

// The Router maintains a stack of middleware functions.
function Router(router = null) {
  // Represents the stack of middleware handlers.
  this.middleware = new RequestHandlerStack(
    router && router.middleware ? router.middleware : null
  );

  // Represents the stack of error handlers.
  this.errors = new RequestHandlerStack(
    router && router.errors ? router.errors : null
  );
}

// Retrieve request handler directly by index.
Router.prototype.getRequestHandlerAt = function(index) {
  return index >= 0 && index < this.middleware.stack.length
    ? this.middleware.stack[index]
    : null;
};

// Register callback to the stack.
Router.prototype.addRequestHandler = function(
  method = "*",
  path = "/",
  callback = (request, response, next) => {}
) {
  // Create the route object and then add it to the stack.
  this.middleware.push(new Route(method, path, callback));
};

// Retrieve error handler directly by index.
Router.prototype.getErrorHandlerAt = function(index) {
  return index >= 0 && index < this.errors.stack.length
    ? this.errors.stack[index]
    : null;
};

// Register callback to the error stack.
Router.prototype.addErrorHandler = function(
  method = "*",
  path = "/",
  callback = (err, request, response, next) => {}
) {
  // Create the route object and then add it to the stack.
  this.errors.push(new Route(method, push, callback));
};

// Register explicitly assigns a route to specified method.
Router.prototype.register = function(
  method = "*",
  path = "/",
  callback = (request, response, next) => {},
  ...callbacks
) {
  if (callback && typeof callback === "function") {
    // Validate callback as typeof function.

    if (callback.length === 3 || callback.length === 2) {
      // Function with arity of two or three is middleware (request, response, next).
      this.addRequestHandler(method, path, callback);
    }

    if (callback.length === 4) {
      // Function with arity of four is an error handler (err, request, response, next).
      this.addErrorHandler(method, path, callback);
    }
  } else if (callback && Array.isArray(callback)) {
    // If callback is an array, iterate.
    const router = this;
    callback.forEach(functor => {
      router.register(method, path, functor);
    });
  }

  if (callbacks && callbacks.length > 0) {
    // If rest parameters exist.
    this.register(method, path, callbacks);
  }
};

// Register under all HTTP methods.
Router.prototype.all = function(path = "/", callback = (request, response, next) => {}, ...callbacks) {
    this.register(HTTP_METHOD.ALL, path, callback, callbacks);
}

// Register under specified HTTP method.
Router.prototype.get = function(path = "/", callback = (request, response, next) => {}, ...callbacks) {
    this.register(HTTP_METHOD.GET, path, callback, callbacks);
}

// Register under specified HTTP method.
Router.prototype.head = function(path = "/", callback = (request, response, next) => {}, ...callbacks) {
    this.register(HTTP_METHOD.HEAD, path, callback, callbacks);
}

// Register under specified HTTP method.
Router.prototype.post = function(path = "/", callback = (request, response, next) => {}, ...callbacks) {
    this.register(HTTP_METHOD.POST, path, callback, callbacks);
}

// Register under specified HTTP method.
Router.prototype.put = function(path = "/", callback = (request, response, next) => {}, ...callbacks) {
    this.register(HTTP_METHOD.PUT, path, callback, callbacks);
}

// Register under specified HTTP method.
Router.prototype.delete = function(path = "/", callback = (request, response, next) => {}, ...callbacks) {
    this.register(HTTP_METHOD.DELETE, path, callback, callbacks);
}

// Handle a user request. Done is called when router completes middleware stack execution.
Router.prototype.handle = function(request, response, done = (err) => {
  if(err) { console.error(err); }
}) {
  if (!request || !response) {
    // If missing data, call to function was malformed.
    done(new Error("Function called improperly. Fatal server error."));
  } else {

    // Add parsed URL to the request object.
    request.parsedUrl = url.parse(request.url);
    const router = request.router;

    // Reset the indices to -1.
    let index = -1;
    let errorIndex = -1;

    // Dispatch will retrieve a handler and prepare the next call.
    const dispatch = function(
      err = null,
      stackPosition = -1,
      errorPosition = -1
    ) {        

        console.dir(router);

      const requestHandler = router.getRequestHandlerAt(stackPosition);
      const errorHandler = router.getErrorHandlerAt(errorPosition);
      index = stackPosition;
      errorIndex = errorPosition;

      if (err && errorIndex === router.errors.stack.length) {
        // If error position has reached the end, and error is not null,
        // return done.
        return done(err);
      }

      if (!err && index === router.middleware.stack.length) {
        // If stack position has reached the end, return done.
        return done(err);
      }

      // Increment request handler reference.
      function nextRequestHandler(err = null) {
        return dispatch(err, stackPosition + 1, errorPosition);
      }

      // Increment error handler reference.
      function nextErrorHandler(err = null) {
        return dispatch(err, stackPosition, errorPosition + 1);
      }

      // Closure function that will return request
      // for the next handler in the stack.
      function next(err = null) {
        if (stackPosition < index || errorPosition < errorIndex) {
          throw new Error(`next() called multiple times.`);
        }

        // Remember, dispatch returns a handler,
        // so the handler doesn't get executed on return here.

        if (err) {
          return nextErrorHandler(err);
        } else {
          return nextRequestHandler(err);
        }
      }

      try {
        if (err && errorHandler.length === 4) {
          if (
            errorHandler.verifyMethod(request.method) &&
            errorHandler.verifyPath(request.parsedUrl.pathname)
          ) {
            // If handler does not match request method or path, skip.
            return errorHandler(err, request, response, next);
          } else {
            return nextErrorHandler(err);
          }
        }

        if (
          !err &&
          (requestHandler.length === 3 || requestHandler.length === 2)
        ) {
          if (
            requestHandler.verifyMethod(request.method) &&
            requestHandler.verifyPath(request.parsedUrl.pathname)
          ) {
            // If handler does not match request method or path, skip.
            return requestHandler(request, response, next);
          } else {
            return nextRequestHandler(err);
          }
        }
      } catch (e) {
        // If stack doesn't match with stack position,
        // throw the error so it doesn't propogate.
        if (index > stackPosition) {
          throw e;
        }

        // Log the error.
        console.error(`Caught error during dispatch. ${e}`);

        // Pass the error with the next call.
        return next(e);
      }

      // End of dispatch();
      // Dispatch returns the next in the series.
      return next(err);
    };

    // End of handle().
    return dispatch(null, 0); // Begin stack at position 0, no err.
  }
};

module.exports = Router;