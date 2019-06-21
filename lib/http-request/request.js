'use strict';

const { URL } = require('url');
const http = require('http');

const request = (
    { pathname = '/', address = '', headers = {}, method = 'GET', json = false } = {},
    payload,
) => {
    return new Promise((resolve, reject) => {
        const url = new URL(pathname, address);

        if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
            headers = Object.assign(headers, {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(payload),
            });
        }

        // This is done to support node 8. From node 10 .request can take
        // both an URL object and options object as arguments
        const options = {
            protocol: url.protocol,
            host: url.hostname,
            port: url.port,
            path: url.pathname,
            headers,
            method,
        };

        const req = http
            .request(options, res => {
                const chunks = [];
                res.on('data', chunk => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    const body = json ? JSON.parse(chunks.join('')) : chunks.join('');
                    resolve({
                        headers: res.headers,
                        body,
                    });
                });
            })
            .on('error', error => {
                reject(error);
            });

        if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
            req.write(payload);
        }

        req.end();
    });
};
module.exports = request;
