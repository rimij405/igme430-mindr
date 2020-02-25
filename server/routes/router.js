const { pathToRegexp, match, parse, compile } = require('path-to-regexp');
const HTTP_METHOD = require('./../utils').methods;
const ArrayUtil = require('./../utils').array;


///////////////////
// HELPER METHODS
///////////////////

// Router method map.
const methods = {
    all: (path = '/', handler = (request, response) => {}) => {


    },
    get: (path = '/', handler = (request, response) => {}) => {

    },
    head: (path = '/', handler = (request, response) => {}) => {

    },
    post: (path = '/', handler = (request, response) => {}) => {

    },
    put: (path = '/', handler = (request, response) => {}) => {

    },
    delete: (path = '/', handler = (request, response) => {}) => {

    },
};

// Decorator functions will add functionality to a JS object.
const decorate(router) {
    if(!router){
        console.error(`Cannot decorate ${router} router.`);
    }



    return target;
}



////////////////////
// ROUTER CLASS
////////////////////

// The Route maintains reference to a regexp path pattern, method, and middleware function. 
function Route(method = null, path = null, callback = (request, response, next) => {}) {
    this.method = method;
    this.path = pathToRegexp(path || '*');
    this.callback = callback;
}

// Check if route is for specified HTTP Method.
Route.prototype.isMethod(method) {
    return (this.method === null) || (this.method === method);
}

// Check if route matches specified path.
Route.prototype.isPath(path) {
    if(this.path.match(path))
}

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

// Create a request handler stack.
function RequestHandlerStack(collection = null) {
    if(collection && Array.isArray(collection)) {
        this.stack = ArrayUtil.copy(collection);
    if(collection instanceof RequestHandStack){ 
        this.stack = ArrayUtil.copy(collection.stack);
    } else {
        this.stack = [];
    }

    // Additional stack methods.
    this.push = this.stack.push;
    this.pop = this.stack.pop;
    this.clear = this.stack.clear;
};

// The Router maintains a stack of middleware functions.
function Router(router = null) {

    // Represents the stack of middleware handlers.
    this.middleware = new RequestHandlerStack((router && router.middleware) ? router.middleware : null);

    // Represents the stack of error handlers.
    this.errors = new RequestHandlerStack((router && router.errors) ? router.errors : null);

};

// Retrieve request handler directly by index.
Router.prototype.getRequestHandler = function(index) {
    return (index >= 0 && index < this.middleware.stack.length) ? this.middleware.stack[index] : null;
};

// Register callback to the stack.
Router.prototype.addRequestHandler(method = "*", path = "/", callback = (request, response, next) => {}){
    // Create the route object and then add it to the stack.
    this.middleware.push(new Route(method, path, callback));
}

// Retrieve error handler directly by index.
Router.prototype.getErrorHandler = function(index) { 
    return (index >= 0 && index < this.errors.stack.length) ? this.errors.stack[index] : null;
};

// Register callback to the error stack.
Router.prototype.addErrorHandler(method = "*", path = "/", callback = (err, request, response, next) => {}){
    // Create the route object and then add it to the stack.
    this.errors.push(new Route(method, push, callback));
}

// Register explicitly assigns a route to specified method.
Router.prototype.register = function(method = "*", path = "/", callback = (request, response, next) => {}, ...callbacks) {
    if(callback && typeof callback === 'function') {       
        // Validate callback as typeof function.

        if(callback.length === 3 || callback.length === 2) {
            // Function with arity of two or three is middleware (request, response, next).
            this.addRequestHandler(method, path, callback);
        }

        if(callback.length === 4) {
            // Function with arity of four is an error handler (err, request, response, next).
            this.addErrorHandler(method, path, callback);            
        }

    } else if(callback && Array.isArray(callback)){

        // If callback is an array, iterate.
        const router = this;
        callback.forEach((functor) => {
            router.register(method, path, callback);
        });

    }

    if(callbacks && callbacks.length > 0) {
        // If rest parameters exist.
        this.register(method, path, callbacks);
    }
};

// Reset the router index to prepare for the next request.
Router.prototype.reset = function(){
    this.middleware.reset();
    this.errors.reset();
};

// Handle a user request. Done is called when router completes middleware stack execution.
Router.prototype.handle = function(request, response, done) {
    if(!request || !response) {
        // If missing data, call to function was malformed.
        throw new Error('Function called improperly. Fatal server error.');
    } else {
        
        // Reset the indices to -1.
        this.reset();

        // Dispatch will retrieve a handler and prepare the next call.
        const dispatch = (stackPosition, err = null) {
            const requestHandler = this.getRequestHandler(stackPosition);
            index = stackPosition;
            // line 71 in the @blakeembrey post.



            const handler = ArrayUtil.getElement(this.middleware, this.middleware.index).then();



        }




    }
};