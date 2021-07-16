'use strict';

const enableDestroy = require('server-destroy');
const selfsigned = require('selfsigned');
const { URL } = require('url');
const https = require('https');

const attrs = [{ name: 'commonName', value: 'podium-lib.io' }];
const PEMS = selfsigned.generate(attrs, { days: 365 });

class HttpsServer {
    constructor() {
        this.address = '';
        this.request = undefined;
        this.server = undefined;
        this.app = https.createServer(
            {
                key: PEMS.private,
                cert: PEMS.cert,
            },
            (req, res) => {
                if (this.request) {
                    this.request(req, res);
                    return;
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('ok');
            },
        );
    }

    listen() {
        return new Promise((resolve) => {
            this.server = this.app.listen(0, 'localhost', () => {
                this.address = `https://${this.server.address().address}:${
                    this.server.address().port
                }`;
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

    get(
        options = {
            pathname: '/',
        },
    ) {
        return new Promise((resolve, reject) => {
            const url = new URL(options.pathname, this.address);

            const opts = {
                rejectUnauthorized: false,
                protocol: url.protocol,
                pathname: url.pathname,
                hostname: url.hostname,
                port: url.port,
            };

            https
                .get(opts, (res) => {
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
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }
}

module.exports = HttpsServer;
