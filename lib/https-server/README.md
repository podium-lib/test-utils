# HttpsServer

A dummy https server. The server is signed with a temporary, in memory, self signed certificate.

When requesting a server signed with a self signed certificate from node.js do set `rejectUnauthorized` to `false` when doing the request to ignore the self signed certificate warning.

## Installation

```bash
$ npm install @podium/test-utils --save-dev
```

## Getting started

Start a https server at any random available http port

```js
const { HttpsServer } = require('@podium/test-utils');

const server = new HttpsServer();
server.request = (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
};

const service = await server.listen();

console.log(service) // addresses to server.

await server.close();
```

## Constructor

Create a new https server.

```js
const server = new HttpsServer();
```


## API methods

The https server instance has the following API:

### .listen()

Starts the https server listening on a random available port. Returns a
`promise` which will resolve with the address of the running instance.

```js
const server = new HttpsServer();
const service = await server.listen();
console.log(service) // addresses to server etc.
```

### .close()

Closes the running instance. Returns a `promise` which will resolve when all
open connections to the instance is closed and the server is properly closed.

### .get(options)

Helpe method to request any path on the server instance. Returns a `promise` 
which will resolve with the data of the request.

Example: 

```js
const server = new HttpsServer();
server.request = (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(JSON.stringify({ data: 'hello world' }));
};

await server.listen();

const data = await server.get({ pathname: '/foo' });
console.log(data);

await server.close();
```

#### options

The method takes the following options:
 
  * `pathname` - `String` - A pathname on the server to request. Defaults to `/`.

## API properties

### .request

A `setter` for a function to be run on each request. Function will be called
with `request` and `response` object.

```js
const server = new HttpsServer();
server.request = (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok' }));
}
```
