const RouteFactory = require('./route.js');
const HttpMethod = require('./method.js');
const url = require('url');

///////////////////////
// Helper functions.
///////////////////////

// Aid router by adding a new entry to the router's routes collection.
const registerRoute = (router, method = null, route = null, callback = (request, response, next) => {}) => {
    if(!router){ return; }
    
    // Ensure collection exists for middleware.
    router.routes = router.routes || [];

    // Add the route to the stack.
    if(callback && Array.isArray(callback) && callback.length > 0) {
        // Recurse if callback is actually set of arrays.
        callback.forEach((functor) => {
            registerRoute(router, method, route, callback);
        });
        return;
    } else if(callback && typeof callback === 'function'){

        // If callback is definitely a function, determine if it's an error function.
        if(callback.length >= 4){
            // More than 4 named parameters is assumed to be an error handler.
            registerHandler(router, method, route, callback);
            return;
        } else if(callback.length === 3 || callback.length === 2){
            // 3 named parameters mean the function is (req, res, next).
            // 2 named parameters mean the function is (req, res). (For legacy purposes).
            // Reject functions that don't have at least two named functions.
            
            // If valid, add the function.
            router.routes.push({ method, route, callback });            
            return;
        }

    }

    // Error registering route.
    console.error(`Error registering route handler: Method: '${method}', Route: '${route}'.`);
}

// Wrapper for middleware that is added to the stack without a route. Route is set to null.
const registerMiddleware = (router, method = null, callback = (request, response, next) => {}) => {
    try{
        this.registerRoute(router, method, null, callback);
    } catch(e){
        // Error registering middleware.
        console.error(`Error registering middleware: Method: '${method}'.`);
    }
}

// Register error handlers.
const registerHandler = (router, method = null, route = null, callback = (err, request, response, next) => {}) => {
    if(!router) { return; }

    // Ensure collection exists for errors.
    router.handlers = router.handlers || [];

    if(callback && Array.isArray(callback) && callback.length > 0){
        // Recurse if callback is actually a part of a set of arrays.
        callback.forEach((functor) => {
            registerHandler(router, method, functor);
        });
        return;
    } else if(callback && typeof callback === 'function' && callback.length >= 4){
        // Add function if it exists, is a function, and contains four (or more) named parameters.
        router.handlers.push({ method, route, callback });
        return;
    }

    // Error registering handlers.
    console.error(`Error registering error handler: Method: '${method}', Route: '${route}'.`);
}

// Helper method for retrieving middleware at specified location.

/////////////////////////
// CLASS DECLARATION
/////////////////////////

// Generalized router class.
// Map of routes to their specified callback.
class Router {

    // Initialize the router.
    constructor(){

        // When the router is handling middleware (returning with the next) it will step through this sequentially.
        this.routes = [];

        // Error middleware results when a callback has four parameters.
        this.handlers = [];

        // Progress flags. (Adds flags property.)
        this.flags = {};

    }

    // Register a route to occur with a particular request method.
    register(method, route, callback = (request, response, next) => {}){
        if(HttpMethod[method]){
            registerMethod(this, method, route, callback);
        } else {
            // If no method exists, ignore after throwing an error.
            console.error(`Route registration error. Cannot register route ${route} for HTTP method '${method}'.`);
            return;
        }
    }

    // Register callback to always execute, regardless of route.
    use(method, callback) {        
        if(HttpMethod[method]){
            registerMethod(this, method, route, callback);
        } else {
            // If no method exists, ignore after throwing an error.
            console.error(`Middleware registration error. Cannot register callback for HTTP method '${method}'.`);
            return;
        }
    }

    // Register callback for all HTTP methods on specified route.
    all(route, callback) {
        this.register(HttpMethod.ALL, route, callback);
    }

    // Register route for matching GET requests.
    get(route, callback) {
        this.register(HttpMethod.GET, route, callback);
    }

    // Register route for matching HEAD requests.
    head(route, callback) {
        this.register(HttpMethod.HEAD, route, callback);
    }

    // Register route for matching POST requests.
    post(route, callback) {
        this.register(HttpMethod.POST, route, callback);
    }

    // Register route for matching PUT requests.
    put(route, callback) {
        this.register(HttpMethod.PUT, route, callback);
    }

}

// Create a stack context from the router.
const createRouterStack = (router) => {
    if(!router) { return; }
    return new RouterStack(router);
};

// Resets route stack flags.
const resetRouterStackFlags = (stack) => {
    if(!stack || !stack.router) { return; }

    // Ensure router flags have object.
    stack.flags = stack.flags || {};
    stack.flags.stackIndex = -1;  // Where is the router in the stack context?
    stack.flags.errorIndex = -1; // Where is the router in the stack context?
};

// Check if router has next middleware function available in the stack.
const hasNext = (stack) => {
    if(!stack || !stack.router) { return; }

    // Check stack index against the stack length.
    return (stack.router.routes.length > 0 && stack.flags.stackIndex < stack.router.routes.length);
};

// Check if the router has next error function available in the stack.
const hasNextError = (stack) => {
    if(!stack || !stack.router) { return; }

    // Check error index against the stack length.
    return (stack.router.handlers.length > 0 && stack.flags.errorIndex < stack.router.handlers.length);
};

// Closure wrapped function for getting the next method in a stack.
const prepareNext = (stack, request, response) => {
    const context = stack;
    if(!context || !context.router) { return; }
    const next = (err) => {
        if(err && hasNextError(context)){
            // Pass to error handlers.
            context.errorIndex++; // Increment the error index.
            context.handle(request, response);
        } else if(!err && hasNext(context)) {
            // Pass to the next handler in the stack.
            context.stackIndex++; // Increment the stack index.
            context.handle(request, response);
        }
        return; // End the next methods if there are no next ones to run.
    };
    return next;
};


// A route stack is a context that can run through the set of routes in the collection of a router.
class RouterStack {

    // Construct the router stack. Requires reference to the actual router data.
    constructor(router) {
        // Reset the flags.
        this.flags = {};
        resetRouterStackFlags(this);
    }

    // Reset the router stack.
    reset() {
        resetRouterStackFlags(this);
    }

    // Handle the request, essentially starting a new stack context. Returns a promise.
    handle(request, response) {
        // If request or response is null, return null immediately. Cannot resolve if either is missing.
        if(!request || !response) { return null; }

        let handler = undefined;

        if(this.flags.errorIndex > -1) {
            // If error index is greater than -1, we are handling the error stack.
            handler = this.router.handlers[this.flags.errorIndex];
            return;
        }

        if(this.flags.stackIndex === -1 && hasNext(this)){
            // Trigger next function in the stack, based on index value.

        }

        if(handler && handler)


    }

}

// Determine if HttpMethod matches the request signature.
const isHttpMethod = (request, method = null) => {
    return (!request) && (method === request.method || method === null);
};

// Determine if route matches the request signature.
const isRoute = (request, route = null) => {
    const pathname = url.parse(request.url).pathname;
    return (!request) && (route === pathname || route === null);
};