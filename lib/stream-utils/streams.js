import stream from 'readable-stream';

/**
 * @param {(result: any[]) => void} done
 * @returns
 */
export const destinationObjectStream = (done) => {
    const arr = [];

    const dStream = new stream.Writable({
        objectMode: true,
        /**
         * @param {any} chunk
         * @param {string} encoding
         * @param {() => void} callback
         */
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

/**
 * @param {(result: string) => void} done
 * @returns
 */
export const destinationBufferStream = (done) => {
    /** @type {string[]} */
    const buffer = [];

    const dStream = new stream.Writable({
        objectMode: false,
        /**
         * @param {string} chunk
         * @param {string} encoding
         * @param {() => void} callback
         */
        write(chunk, encoding, callback) {
            buffer.push(chunk);
            callback();
        },
    });

    dStream.on('finish', () => {
        done(buffer.join().toString());
    });

    return dStream;
};
