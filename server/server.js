// Import statements.
const http = require('http');
const handlers = require('./handlers');
const Router = require('./routes').router;

///////////////////
// HELPER METHODS
///////////////////

const DEBUG_PORT = 3000;

// Create server instance.
const createServer = (server, handler = (request, response) => {}) => {
    // Debug messages.
    if (server.port === 3000){
        // If the port is 3000, print this debug message.
        console.log("Creating server instance.");
    }

    // Create the server instance.
    server.instance = http.createServer(handler);
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

///////////////////
// Server CLASS
///////////////////

// Server will 'handle' a request to 'serve' a response.
function Server(onInitCallback = (server) => {}) {
    this.init = onInitCallback || (() => {});
    this.port = process.env.PORT || process.env.NODE_PORT || DEBUG_PORT;
    this.instance = undefined;
    this.handlers = {
        middleware: [],
        routers: [],
        errors: [],
    };
};

// Executed before the server is started.
Server.prototype.onInit = function(callback = (server) => {}) {
    this.init = () => {
        if(callback && typeof callback === 'function'){
            return callback(this);
        }
    };
};

// Start the server and listen to the set port.
Server.prototype.start = function(done = (err) => {}) {
    this.init();
    createServer(this, (request, response) => { this.handle(request, response, done); });
    listen(this);
};

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

// Execute all middleware and routers.
Server.prototype.handle = function(
    request, 
    response, 
    done = err => {
        // console.log(request.server.handlers);
        if(err) {
            console.error(err);
            handlers.sendBadRequest(request, response);
        } else {
            if(!response.writableEnded){
                console.log(request.parsedUrl.pathname);
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
        
        // Create indice tracker for route handlers.
        let index = {
            middleware: -1,
            errors: -1,
            routers: -1
        };

        // Dispatch will retrieve the handler to prepare for the next call.
        const dispatch = function(
            err = null,
            middlewareIndex = -1,
            routerIndex = -1,
            errorIndex = -1
        ) {

            // Handler reference for specified position.
            const handler = {
                middleware: request.server.getMiddleware(middlewareIndex),
                router: request.server.getRouter(routerIndex),
                error: request.server.getErrorHandler(errorIndex) 
            };

            // Assign index values.
            index.middleware = middlewareIndex;
            index.routers = routerIndex;
            index.errors = errorIndex;

            // console.log(`Errors Length: ${request.server.handlers.errors.length}`);
            // console.log(`Middleware Length: ${request.server.handlers.middleware.length}`);
            // console.log(`Routers Length: ${request.server.handlers.routers.length}`);

            // Handle and pass error.
            if(err && index.errors === request.server.handlers.errors.length
                || (err && request.server.handlers.errors.length === 0)){
                return done(err);
            }

            // Handle routers if middleware is complete.
            if(!err && index.middleware === request.server.handlers.middleware.length 
                || (!err && request.server.handlers.middleware.length === 0)) {
                if(!err && index.routers === request.server.handlers.routers.length
                    || (!err && request.server.handlers.routers.length === 0)){
                    // Stack has reached end. Resolve.
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
                    || routerIndex < index.routers
                    || errorIndex < index.errors) {
                        throw new Error(`next() called multiple times.`);
                }

                if(err) {
                    return nextErrorHandler(err);
                } else if(index.middleware < request.server.handlers.middleware.length){
                    return nextMiddleware(err);
                } else {
                    return nextRouter(err);
                }
            }
            
            ////////////////////////////////
            // Determine next handler.
            ////////////////////////////////

            try {
                
                // If error, handle and pass along.
                if(err && handler.error && handler.error.length === 4) {
                    // Global handler runs on server.
                    return handler.error(err, request, response, next);
                }

                // If middleware, run middleware and pass along.
                if(!err && handler.middleware && handler.middleware.length === 3){
                    // Run middleware.
                    return handler.middleware(request, response, next);
                } else {
                    if(!err && handler.router && handler.router.handle && handler.router.handle.length === 3) {
                        return handler.router.handle(request, response, next);
                    }
                }

            } catch(e) {

                // Stack doesn't match with stack position.
                if(index.middleware > middlewareIndex
                    || index.routers > routerIndex){
                    throw e;
                }

                // Log the error.
                console.error(`Caught error during dispatch. ${e}`);
        
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

// Export Server class.
module.exports = Server;