# Features

## Above and Beyond

Webpack is used in this project to bundle the client-side code into a single `main.js`. It allows for a component-based approach to developing the frontend.

The `main.js` file in `/dist` is actually a bundle of the files in the `/client/src` directory. Webpack creates a dependency graph starting at the specified entry point - in this case `/client/src/index.js` - and includes only the used resources in the final version.

## Structure

The client essentially has access to anything in the `/dist` and `/public` folders, as long as the server provides access to those resources. Resources created for the client in this application are broken down into these areas:

```md
/client
    |- /dist
        |- index.html
        |- main.js
    |- /public
        |- /css
            |- main.css
            |- styles.css
        |- /img
    |- /src
        |- /components
        |- index.js
```

An end user of the client would only see:

```md
/client
    |- /dist
        |- index.html
        |- main.js
    |- /public
        |- /css
        |- /img
```

The backend has code broken with separations of concern.

```md
/server
    |- /db
    |- /models
    |- /routes
    |- /utils
    |- server.js
```

The server itself is contained within this directory; there is an `app.js` class in the superceding directory, one level above `/server`. This root directory class serves as the entry point for the server side of things - the idea here is to separate creation of the server from running it and any relevant building tasks.
