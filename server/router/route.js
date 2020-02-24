const regex = require('./../utils').regex;

// Generalized route.
// Contains a pattern that gets matched.
class Route {

    // Construct a route with a path.
    constructor(path = '/'){
        // Initialze the containers.
        this.paths = []; // Route paths.                    
        // Register input values.
        this.registerPath(path);
    }

    // Regsiter the route path pattern.
    registerPath(path = '/'){
        // Check if array.
        if(path && Array.isArray(path)){
            // Recurse if top-level is an array.
            path.forEach((pattern) => {
                this.registerPath(pattern);
            });
        } else if(path && path instanceof RegExp || typeof path === 'string' || path instanceof String) {
            // Create and register pattern if it is a native RegExp or a string.
            this.paths.push(regex.createPattern(path));
        } else if(path && path instanceof Regex){
            // Register directly if a node Regex type.
            this.paths.push(path);        
        }
    }
    
    // Return true or false if the input path matches any of the registered path patterns.
    match(path) {
        for(let i = 0; i < this.paths.length; i++){
            let regexp = this.paths[i];
            if(regexp.test(path)){
                return true;
            }
        }
        return false;
    }

}

// Export
module.exports = Route;

