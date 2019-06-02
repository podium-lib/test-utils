# HttpServer

A dummy http server.

## Installation

```bash
$ npm install @podium/test-utils --save-dev
```

## Getting started

Start a http server at any random available http port

```js
const { HttpServer } = require('@podium/test-utils');

const server = new HttpServer();
server.request = (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
};

const service = await server.listen();

console.log(service) // addresses to server etc.

await server.close();
```

## Constructor

Create a new http server.

```js
const server = new HttpServer();
```


## API methods

The http server instance has the following API:

### .listen(host)

Starts the http server listening on a random available port. Returns a
`promise` which will resolve with the address of the running instance.

```js
const server = new HttpServer();
const service = await server.listen();
console.log(service) // addresses to server etc.
```

#### host

Takes a `host` to start the instance listening on a given hostname and port.

```js
const server = new HttpServer();
const service = await server.listen('http://localhost:8080');
```

### .close()

Closes the running instance. Returns a `promise` which will resolve when all
open connections to the instance is closed and the server is properly closed.


## API properties

### .request

A `setter` for a function to be run on each request. Function will be called
with `request` and `response` object.

```js
const server = new HttpServer();
server.request = (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok' }));
}
```
