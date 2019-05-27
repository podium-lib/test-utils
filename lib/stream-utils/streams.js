'use strict';

const stream = require('readable-stream');

const destinationObjectStream = done => {
    const arr = [];

    const dStream = new stream.Writable({
        objectMode: true,
        write(chunk, encoding, callback) {
            arr.push(chunk);
            callback();
        },
    });

    dStream.on('finish', () => {
        done(arr);
    });

    return dStream;
};
module.exports.destinationObjectStream = destinationObjectStream;
