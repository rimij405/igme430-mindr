// Handle static files.
const fs = require('fs');
const responseHandler = require('./response.js');
const errorHandlers = require('./errors.js');

// Prepare the files JSON.
const fileMap = {};

// Load the file map.
const loadFileMap = () => {
  fs.readFile(`${__dirname}/../db/files.json`, (err, data) => {
    if (!err) {
      try {
        fileMap.files = JSON.parse(data).files;
      } catch (e) {
        fileMap.files = {};
      }
    }
  });
};

// Get file.
const getFile = (id) => {
  if (!fileMap || !fileMap.files) {
    loadFileMap();
  }
  return fileMap.files[id];
};

// Send file.
const sendFile = (
  request,
  response,
  options = {
    mimetype: 'text/html',
    content: undefined,
  },
) => {
  // Get object reference that we can manipulate.
  const file = options.content || {};
  const mimetype = options.mimetype || 'text/html';

  // On successful retrieval of file data, return it.
  const onSuccess = (data) => {
    console.log(`${request.method}: Get '${mimetype}' resource: ${file.name}`);
    options.status = 200;
    options.headers = { 'Content-Type': mimetype };
    options.content = data;
    responseHandler.sendResponse(request, response, options);
  };

  // If the file wasn't retrieved, send not found request.
  const onError = () => {
    console.error(`Resource '${file.name}' (${mimetype}) not implemented.`);
    errorHandlers.sendNotImplemented(request, response);
  };

  // If the filepath and data exists, we can pass it along.
  if (file && file.data) {
    // If the data already exists, pass it along immediately.
    onSuccess(file, file.data);
  } else if (file && file.dir && file.name) {
    // If data does not exist but filename does:
    file.path = `${__dirname}/../..${file.dir}${file.name}`;
    fs.readFile(file.path, (err, data) => {
      if (!err) { onSuccess(data); } else { onError(); }
    });
  } else if (file && file.name) {
    sendFile(request, response, {
      mimetype,
      content: { dir: '', name: file.name },
    });
  } else {
    console.error(`Resource '${file.name}' (${mimetype}) not found.`);
    errorHandlers.sendNotFound(request, response);
  }
};

// Send the index.
const sendIndex = (request, response) => {
  sendFile(request, response, {
    mimetype: 'text/html',
    content: getFile('index'),
  });
};

// Export functions.
module.exports = {
  sendFile,
  sendIndex,
  getFile,
};
