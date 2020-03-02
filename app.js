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

    // Creating router.
    const router = new Router();
    router.get("/", (request, response, next) => {
        console.log("Testing router.");
    });
    router.get("/index", handlers.sendIndex);

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
app.start(null);
