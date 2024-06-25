import enableDestroy from 'server-destroy';
import http from 'http';
import url from 'url';

export class HttpServer {
    address = '';
    /** @type {import('http').RequestListener | undefined} */
    request = undefined;
    /** @type {import('http').Server | undefined} */
    server = undefined;

    constructor() {
        this.app = http.createServer((req, res) => {
            if (this.request) {
                this.request(req, res);
                return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('ok');
        });
    }

    listen() {
        return new Promise((resolve) => {
            this.server = this.app.listen(0, '0.0.0.0', () => {
                let address = /** @type {import('net').AddressInfo} */ (
                    this.server.address()
                );
                this.address = `http://${address.address}:${address.port}`;
                resolve(this.address);
            });
            enableDestroy(this.server);
        });
    }

    close() {
        if (this.server) {
            return new Promise((resolve, reject) => {
                this.server.destroy((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
        return Promise.resolve();
    }

    get(options = {}) {
        return new Promise((resolve, reject) => {
            let opts = {};
            if (options.pathname) {
                opts = url.parse(`${this.address}${options.pathname}`);
            } else {
                opts = url.parse(this.address);
            }

            http.get(opts, (res) => {
                const chunks = [];
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    resolve({
                        headers: res.headers,
                        response: options.raw
                            ? chunks.join('')
                            : JSON.parse(chunks.join('')),
                    });
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }
}
