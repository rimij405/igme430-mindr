// Logger handling utility features.

// Prepare a titled message.
const createMessage = (title, message) => {
    return `${title}: ${message}`;
};

// Creates an error from a title and message.
const createError = (title, message) => {
    return new Error(createMessage(title, message));
}

// Export utility functions.
module.exports = {
    createMessage,
    createError
};