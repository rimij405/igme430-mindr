// Import statements.
const Server = require("./server/server.js");
const Router = require("./server/routes").Router;
const middleware = require("./server/middleware");
const handlers = require("./server/handlers");

// Create the application object.
const app = new Server();

// Execute when initializing the server.
app.onInit((server) => {
    console.log("Initializing server.");

    try{ handlers.getFile("index"); } catch(e) {}

    // Register error handlers.
    server.register((err, request, response, next) => {
        if(err){
            console.error(err);
        }
        handlers.sendCustomError(request, response, {
            status: "404",
            id: "Not Found",
            message: "Testing"
        });
    });

    // Registering middleware.
    server.use(middleware.parseUrl);
    server.use(middleware.parseParams);
    server.use(middleware.parseJSON);
    server.use(middleware.parseHeaders);
    server.use(middleware.parseMethod);
    server.use(middleware.logRequest);

    // Creating router.
    const router = new Router();
    router.get("/", (request, response, next) => {
        if(request.parsedUrl.pathname === "/"){
            return handlers.sendIndex(request, response);
        }
        next();
    });

    // Index page.
    router.get("/index", (request, response, next) => {
        handlers.sendIndex(request, response);
    });

    // Index page.
    router.get("/index.html", (request, response, next) => {
        handlers.sendIndex(request, response);
    });

    // Main style.
    router.get("/main.css", (request, response, next) => {
        handlers.sendFile(request, response, {
            mimetype: "text/css",
            content: handlers.getFile("main")
        });
    });
    
    // Style.
    router.get("/style.css", (request, response, next) => {
        handlers.sendFile(request, response, {
            mimetype: "text/css",
            content: handlers.getFile("style")
        });
    });

    // JS.
    router.get("/main.js", (request, response, next) => {
        console.dir(handlers.Files);
        handlers.sendFile(request, response, {
            mimetype: "text/javascript",
            content: handlers.getFile("entry")
        });
    });

    // Login
    router.get("/login", (request, response, next) => {
        console.dir(handlers.Files);
        handlers.sendFile(request, response, {
            mimetype: "text/html",
            content: handlers.getFile("loginForm")
        });
    });

    // Signup
    router.get("/signup", (request, response, next) => {
        console.dir(handlers.Files);
        handlers.sendFile(request, response, {
            mimetype: "text/html",
            content: handlers.getFile("signupForm")
        });
    });


    router.post("/", (request, response, next) => {
        handlers.sendNotImplemented(request, response);
    });

    // Registering routers.
    server.register(router);


});

// Start the server.
/* app.start((request, response) => {
    console.log(`Received '${request.method}' request.`);
    response.writeHead(200, { "Content-Type": "application/json" })
    response.write(JSON.stringify({ message: `Error 501: Server Issue on '${request.method}' request.` }));
    response.end();
});*/
app.start((err) => {
    console.log("Server shutting down...");    
});
