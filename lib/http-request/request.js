import { URL } from 'url';
import http from 'http';

/**
 * @typedef {object} RequestOptions
 * @property {string} [pathname="/"]
 * @property {string} [address=""]
 * @property {Record<string, string>} [headers={}]
 * @property {string} [method="GET"]
 * @property {boolean} [json=false]
 */

/**
 * @template T
 * @param {RequestOptions} options
 * @param {T} payload
 * @returns {Promise<{ headers: import('http').IncomingHttpHeaders, body: T}>}
 */
export const request = (
    {
        pathname = '/',
        address = '',
        headers = {},
        method = 'GET',
        json = false,
    } = {},
    payload,
) =>
    new Promise((resolve, reject) => {
        const url = new URL(pathname, address);

        if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
            headers = Object.assign(headers, {
                'Content-Type': 'application/x-www-form-urlencoded',
                // @ts-expect-error It's fine
                'Content-Length': Buffer.byteLength(payload),
            });
        }

        // This is done to support node 8. From node 10 .request can take
        // both an URL object and options object as arguments
        const options = {
            protocol: url.protocol,
            host: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers,
            method,
        };

        const req = http
            .request(options, (res) => {
                const chunks = [];
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    const body = json
                        ? JSON.parse(chunks.join(''))
                        : chunks.join('');
                    resolve({
                        headers: res.headers,
                        body,
                    });
                });
            })
            .on('error', (error) => {
                reject(error);
            });

        if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
            req.write(payload);
        }

        req.end();
    });
