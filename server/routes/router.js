const { pathToRegexp, match, parse, compile } = require('path-to-regexp');
const HTTP_METHOD = require('./../utils').methods;


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

// The Router maintains a stack of middleware functions.

function Router() {

    // 

    // Represents the stack of handlers.
    this.handlers = {
        middleware: [],
        error: []
    };

}

// Register explicitly assigns a route to specified method.
Router.prototype.register(method = "*", path = "/", handler = (request, response) => {}) {

};
