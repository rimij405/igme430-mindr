// Import statements.
const url = require('url');
const handlers = require('./../handlers');

// Parse the method and add it back to the request object.
const parseMethod = (request, response, next) => {
    // Determine if request method is valid.
    if(request && request.method){
        request.method = request.method.toUpperCase();
        const acceptMethods = [
            'GET', 'HEAD', 'POST', 'DELETE', 'CREATE'
        ];
        if(acceptMethods.includes(request.method)){
            return next();
        }
    }
    
    // Send a bad request error if no methods are accepted or none provided.
    handlers.sendBadRequest(request, response);
};

// Parse url and add it to the request object.
const parseUrl = (request, response, next) => {
    if(request && request.url){
        request.parsedUrl = request.parsedUrl || url.parse(request.url, true);
        return next();
    }

    // Send a bad request error.
    handlers.sendBadRequest(request, response);
};

// Parse the request body and add it back to the request object.
const parseBody = (request, response, next) => {

    // If body is already parsed, run next.
    if(request && request.body){
        return next();
    }

    // Parse body on POST or PUT requests.
    if(request && request.method === "POST"){
        const body = [];
        request.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
        }).on('error', (err) => {
            handlers.sendCustomError(request, response, {
                status: 500,
                id: "Internal Server Error",
                message: "Could not parse request body."
            });
        });
    } else {
        // Simply pass by without creating the body.
        return next();
    }
};

// Parse the request body as JSON and add it back to the request object.
const parseJSON = (request, response, next) => {

    // If body is already parsed, run next.
    if(request && request.body){
        return next();
    }

    // Parse body on POST or PUT requests.
    if(request && request.method === "POST"){
        const body = [];
        request.on('error', (err) => {
            handlers.sendCustomError(request, response, {
                status: 500,
                id: "Internal Server Error",
                message: "Could not parse request body as JSON."
            });
        }).on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = JSON.parse(Buffer.concat(body).toString());
        });
    } else {
        // Simply pass by without creating the body.
        return next();
    }
};

// Parse the url params and add it back to the request object.
const parseParams = (request, response, next) => {
    if(request) {
        request.parsedUrl = request.parsedUrl || url.parse(request.url, true);
        request.query = request.query || request.parsedUrl.query;
        return next();
    }

    // Send a bad request error.
    handlers.sendBadRequest(request, response);
};

// Parse the headers and add it back to the request object.
const parseHeaders = (request, response, next) => {
    if(request && request.headers){
        request.userAgent = request.headers["user-agent"];
        request.acceptHeaders = request.headers["accept"];
        return next();
    }

    // Send a bad request error.
    handlers.sendBadRequest(request, response);
};

// Export functions.
module.exports = {
    parseMethod,
    parseUrl,
    parseBody,
    parseJSON,
    parseParams,
    parseHeaders
};