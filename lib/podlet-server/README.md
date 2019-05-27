# PodletServer

A dummy Podlet server with misc hooks to tap into manipulate the server on the
fly.

## Installation

```bash
$ npm install @podium/test-utils --save-dev
```

## Getting started

Start a Podlet server at any random available http port

```js

const { PodletServer } = require('@podium/test-utils');

const server = new PodletServer();
const service = await server.listen();

console.log(service) // addresses to server etc.

await server.close();
```


## Constructor

Create a new Podlet server.

```js
const server = new PodletServer(options);
```

### options

| option      | type      | default          | description                      |
| ----------- | --------- | ---------------- | -------------------------------- |
| name        | `string`  | `component`      | Name of the Podlet               |
| version     | `string`  | `1.0.0`          | Version number of the podlet     |
| pathname    | `string`  | `/`              | Pathname of the Podlet           |
| manifest    | `string`  | `/manifest.json` | Pathname to the Podlets manifest |
| content     | `string`  | `/index.html`    | Pathname to the Podlets content  |
| fallback    | `string`  | `/fallback.html` | Pathname to the Podlets fallback |
| assets      | `object`  | `{}`             |                                  |
| proxy       | `object`  | `{}`             |                                  |


## API methods

The podlet instance has the following API:

### .listen(host)

Starts the podlet server listening on a random available port. Returns a
`promise` which will resolve with a service object containing misc infomation
about the running instance.

```js
const server = new PodletServer();
const service = await server.listen();
console.log(service) // addresses to server etc.
```

#### host

Takes a `host` to start the instance listening on a given hostname and port.

```js
const server = new PodletServer();
const service = await server.listen('http://localhost:8080');
```

### .close()

Closes the running instance. Returns a `promise` which will resolve when all
open connections to the instance is closed and the server is properly closed.


## API properties

### .manifest

A `getter` for the manifest of the Podlet. Value is a `JSON`.

```js
const server = new PodletServer();
console.log(server.manifest);
```

### .version

A `getter` and `setter` for the version of the Podlet. Value is a `String`.

```js
const server = new PodletServer();
server.version = '2.0.0';
```

### .content

A `getter` for the content pathname of the Podlet. Value is a `String`.

```js
const server = new PodletServer();
console.log(server.content);
```

### .fallback

A `getter` for the fallback pathname of the Podlet. Value is a `String`.

```js
const server = new PodletServer();
console.log(server.fallback);
```

### .assets

A `getter` and `setter` for the assets pathname of the Podlet. Value is a
`Object`.

```js
const server = new PodletServer();
server.assets = { ... };
```

### .headersManifest

A `getter` and `setter` for additional http headers on the manifest route. Value
is a `Object`.

```js
const server = new PodletServer();
server.headersManifest = {
    foo: 'some-value'
};
```

### .headersContent

A `getter` and `setter` for additional http headers on the content route. Value
is a `Object`.

```js
const server = new PodletServer();
server.headersContent = {
    foo: 'some-value'
};
```

### .headersFallback

A `getter` and `setter` for additional http headers on the fallback route. Value
is a `Object`.

```js
const server = new PodletServer();
server.headersFallback = {
    foo: 'some-value'
};
```

### .manifestBody

A `getter` and `setter` for the body served by the manifest route. Value is a
`JSON`.

```js
const server = new PodletServer();
server.manifestBody = {
    name: 'foo-bar'
};
```

### .contentBody

A `getter` and `setter` for the body served by the content route. Value is a
`String`.

```js
const server = new PodletServer();
server.contentBody = '<div>Hello content</div>';
```

### .fallbackBody

A `getter` and `setter` for the fallback served by the content route. Value is a
`String`.

```js
const server = new PodletServer();
server.fallbackBody = '<div>Hello fallback</div>';
```