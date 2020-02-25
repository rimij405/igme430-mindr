// Server.js 
const fs = require('fs');
const http = require('http');
const url = require('url');
const Router = require('./routes/router.js');

const index = { name: "index", data: fs.readFileSync(`${__dirname}/../client/public/index.html`) };
const main = { dir: `${__dirname}/../client/public/css/`, name: `main.css` };
const style = { dir: `${__dirname}/../client/public/css/`, name: `style.css` };
const entry = { dir: `${__dirname}/../client/dist/`, name: `main.js` };

// Port.
const port = process.env.PORT || process.env.NODE_PORT || 3000;

const sendResponse = (request, response, status, headers, content, method) => {
    response.writeHead(status, headers);
    if(method != "HEAD") { response.write(content); }
    response.end();
};

const sendFile = (request, response, mimetype, content) => {    
    // Get object reference we can manipulate.
    const file = content;

    // On successful retrieval of file data, run this method.
    const onSuccess = (data) => {
        console.log(`${request.method}: Get '${mimetype}' resource: '${file.name}'.`);    
        sendResponse(request, response, 200, { 'Content-Type': mimetype }, data, request.method);
    };

    // If the file wasn't retrieved, send not found request.
    const onError = () => {
        console.error(`Resource '${file.name}' (${mimetype}) not implemented.`);
        sendNotImplemented(request, response);
    };

    if(file && file.data) {
        // If data exists already, we can immediately pass it along.
        onSuccess(file.data);
    } else if(file && file.dir && file.name){
        // If data does not exist, but filename         
        file.path = `${file.dir}${file.name}`;
        fs.readFile(file.path, (err, data) => {
            if(!err){
                onSuccess(data);
            } else {          
                onError();  
            }
        });
    } else {
        // Not enough information was supplied to find this resource. Not a server error.
        sendNotFound(request, response);
    }
};

const sendIndex = (request, response) => {
    sendFile(request, response, 'text/html', index);
    // sendResponse(request, response, 200, { 'Content-Type': 'text/html' }, index, "GET");
};

const sendNotImplemented = (request, response) => {
    console.error(`"${request.method}": (501) Server Resource Not Implemented.`);
    response.writeHead(501, {'Content-Type': 'text/json'});
    response.write(JSON.stringify({ id: "Not Implemented", message: "Server has not implemented this resource. Check back again later." }));
    response.end();
};

const sendNotFound = (request, response) => {
    console.error(`"${request.method}": (404) Resource Not Found.`);
    response.writeHead(404, {'Content-Type': 'text/json'});
    response.write(JSON.stringify({ id: "Resource Not Found", message: "Missing resource." }));
    response.end();
};

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
};

// On request to the server, process the route.
const onRequest = (request, response) => {
    const parsedUrl = url.parse(request.url);
    const handleRequest = http.router.handle || routes[parsedUrl.pathname];

    if(!handleRequest){
        sendNotFound(request, response);
    } else {
        handleRequest(request, response);
    }
};

// Create the server.
const createServer = () => {
    
    // Create and listen to the server.
    http.router = new Router();
    http.router.all("/", (request, response, next) => {
        console.log("Request sent. Testing.");
    });
    
    return http.createServer(onRequest);
};

// Debug messages.
if (port === 3000) {
  // If the port is 3000, print this debug message.
  console.log(`Listening to server at 'http://127.0.0.1:${port}/'`);
}

// Export functions.
module.exports = {
    createServer,
    port
}