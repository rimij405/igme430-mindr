const app = require("./server/server.js");

// Create the application and start it.
const server = app.createServer();
server.listen(app.port);