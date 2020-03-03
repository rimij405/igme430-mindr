// Send response back to the client.
const sendResponse = (
  request,
  response,
  options = {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
    content: JSON.stringify({
      id: 404,
      message: 'Error: Content not found on request.',
    }),
  },
) => {
  // Write response headers using input options. Defaults to error.
  response.writeHead(
    options.status || 404,
    options.headers || { 'Content-Type': 'application/json' },
  );

  // If a HEAD method, skip content. Otherwise, write the content.
  if (request.method != 'HEAD') {
    response.write(
      options.content
          || JSON.stringify({
            id: 404,
            message: 'Error: Content not found on request.',
          }),
    );
  }

  // End the response.
  response.end();
};

// Export the function.
module.exports = {
  sendResponse,
};
