// Logger handling utility features.

// Prepare a titled message.
const createMessage = (title, message) => `${title}: ${message}`;

// Creates an error from a title and message.
const createError = (title, message) => new Error(createMessage(title, message));

// Export utility functions.
module.exports = {
  createMessage,
  createError,
};
