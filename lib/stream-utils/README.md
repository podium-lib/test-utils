# Stream Utils

Misc stream utils for testing streams

## Installation

```bash
$ npm install @podium/test-utils --save-dev
```

## destinationObjectStream(done)

A detinations stream to pipe objects into. Will collect all objects piped into
it and call the `done` callback with an `Array` with all the objects in.

```js
const { destinationObjectStream } = require('@podium/test-utils');

const dest = destinationObjectStream(arr => {
    console.log(arr);
});

someSourceStream.pipe(dest);
```
