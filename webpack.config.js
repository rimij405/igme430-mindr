const path = require('path');

module.exports = {
    entry: {
        main: './client/src/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'client/dist'),
    },
    mode: "development",
    optimization: {
        minimize: false
    },
};