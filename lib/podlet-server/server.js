import { HttpIncoming } from '@podium/utils';
import Podlet from '@podium/podlet';
import enableDestroy from 'server-destroy';
import { EventEmitter } from 'node:events';
import http from 'node:http';
import url from 'node:url';

/**
 * @typedef {object} PodletServerOptions
 * @property {string} [manifest="/manifest.json"]
 * @property {string} [fallback="/fallback.html"]
 * @property {string} [content="/index.html"]
 * @property {string} [version="1.0.0"]
 * @property {string} [pathname="/"]
 * @property {string} [name="component"]
 * @property {{ js?: string; css?: string; }} [assets]
 * @property {Record<string, string>} [proxy]
 */

export class PodletServer extends EventEmitter {
    /**
     * @constructor
     * @param {PodletServerOptions} options
     */
    constructor({
        manifest = '/manifest.json',
        fallback = '/fallback.html',
        content = '/index.html',
        version = '1.0.0',
        pathname = '/',
        name = 'component',
        assets = {},
        proxy = {},
    } = {}) {
        super();

        // Private
        this._server = undefined;
        /** @type {Record<string, any>} */
        this._manifest = {};

        this._podlet = new Podlet({
            manifest,
            fallback,
            content,
            pathname,
            version,
            name,
        });

        // TODO: Make it so that "assets" is not set through constructor
        if (assets.js) {
            this._podlet.js({ value: assets.js });
        }

        if (assets.css) {
            this._podlet.css({ value: assets.css });
        }

        // TODO: Make it so that "proxy" is not set through constructor
        Object.keys(proxy).forEach((key) => {
            this._podlet.proxy({ target: proxy[key], name: key });
        });

        // /podium-resource/component/localApi
        this._podlet.proxy({ target: '/public', name: 'localApi' });

        this._routeManifest = this._podlet.manifest();
        this._routeContent = this._podlet.content();
        this._routeFallback = this._podlet.fallback();
        this._routeError = '/error';

        /** @type {Record<string, any>} */
        this._headersManifest = {};
        /** @type {Record<string, any>} */
        this._headersContent = {};
        this._statusCode = 200;
        /** @type {Record<string, any>} */
        this._headersFallback = {};

        this._bodyManifest = JSON.stringify(this._podlet);
        this._bodyContent = `<p>content ${this._podlet.name}</p>`;
        this._bodyFallback = `<p>fallback ${this._podlet.name}</p>`;

        this._metrics = {
            manifest: 0,
            fallback: 0,
            content: 0,
            error: 0,
        };

        // Public
        Object.defineProperty(this, 'metrics', {
            get: () => this._metrics,
            set: () => {
                throw new Error('Cannot set read-only property.');
            },
        });

        Object.defineProperty(this, 'manifest', {
            get: () => JSON.parse(this._bodyManifest),
            set: () => {
                throw new Error('Cannot set read-only property.');
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(this, 'version', {
            get: () => this._podlet.version,
            set: (value) => {
                this._manifest.version = value;
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(this, 'content', {
            get: () => this._podlet.content(),
            set: () => {
                throw new Error('Cannot set read-only property.');
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(this, 'fallback', {
            get: () => this._podlet.fallback(),
            set: () => {
                throw new Error('Cannot set read-only property.');
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(this, 'assets', {
            get: () =>
                // TODO: remove workaround
                ({
                    css: this._podlet.css([]),
                    js: this._podlet.js([]),
                }),
            set: (value) => {
                // TODO: does probably not work as is (not in use since no tests break)
                if (!this._manifest.assets) {
                    this._manifest.assets = {};
                }
                Object.assign(this._manifest.assets, value);
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(this, 'headersManifest', {
            get: () => this._headersManifest,
            set: (value) => {
                this._headersManifest = value;
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(this, 'headersContent', {
            get: () => this._headersContent,
            set: (value) => {
                this._headersContent = value;
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(this, 'statusCode', {
            get: () => this._statusCode,
            set: (value) => {
                this._statusCode = value;
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(this, 'headersFallback', {
            get: () => this._headersFallback,
            set: (value) => {
                this._headersFallback = value;
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(this, 'manifestBody', {
            get: () => this._bodyManifest,
            set: (value) => {
                this._bodyManifest = value;
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(this, 'contentBody', {
            get: () => this._bodyContent,
            set: (value) => {
                this._bodyContent = value;
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(this, 'fallbackBody', {
            get: () => this._bodyFallback,
            set: (value) => {
                this._bodyFallback = value;
            },
            configurable: true,
            enumerable: true,
        });

        this._app = http.createServer(async (req, res) => {
            const incoming = new HttpIncoming(req, res);
            const inc = await this._podlet.process(incoming);

            // Error route
            if (inc.url.pathname.startsWith(this._routeError)) {
                this._metrics.error++;
                this.emit('req:error', this._metrics.error, req);

                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('podlet-version', this._podlet.version);
                res.end('Internal server error');

                return;
            }

            // Content route
            if (inc.url.pathname.startsWith(this._podlet.content())) {
                this._metrics.content++;
                this.emit('req:content', this._metrics.content, req);

                res.statusCode = this._statusCode || 200;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('podlet-version', this._podlet.version);
                Object.keys(this._headersContent).forEach((key) => {
                    res.setHeader(key, this._headersContent[key]);
                });
                res.end(this._podlet.render(inc, this._bodyContent));

                return;
            }

            // Fallback route
            if (inc.url.pathname.startsWith(this._podlet.fallback())) {
                this._metrics.fallback++;
                this.emit('req:fallback', this._metrics.fallback, req);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('podlet-version', this._podlet.version);
                Object.keys(this._headersFallback).forEach((key) => {
                    res.setHeader(key, this._headersFallback[key]);
                });
                res.end(this._podlet.render(inc, this._bodyFallback));

                return;
            }

            // Manifest route
            if (inc.url.pathname.startsWith(this._podlet.manifest())) {
                this._metrics.manifest++;
                this.emit('req:manifest', this._metrics.manifest, req);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('podlet-version', this._podlet.version);
                Object.keys(this._headersManifest).forEach((key) => {
                    res.setHeader(key, this._headersManifest[key]);
                });
                res.end(this._bodyManifest);

                return;
            }

            // Dummy endpoints for proxying
            if (
                inc.url.pathname.startsWith('/public') &&
                req.method === 'GET'
            ) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('podlet-version', this._podlet.version);
                res.end(
                    JSON.stringify({
                        status: 200,
                        body: 'GET proxy target',
                    }),
                );

                return;
            }

            if (
                inc.url.pathname.startsWith('/public') &&
                req.method === 'POST'
            ) {
                /** @type {any[]} */
                const payload = [];
                req.on('data', (chunk) => {
                    payload.push(chunk);
                }).on('end', () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('podlet-version', this._podlet.version);
                    res.end(
                        JSON.stringify({
                            payload: Buffer.concat(payload).toString(),
                            status: 200,
                            body: 'POST proxy target',
                        }),
                    );
                });

                return;
            }

            if (
                inc.url.pathname.startsWith('/public') &&
                req.method === 'PUT'
            ) {
                /** @type {any[]} */
                const payload = [];
                req.on('data', (chunk) => {
                    payload.push(chunk);
                }).on('end', () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('podlet-version', this._podlet.version);
                    res.end(
                        JSON.stringify({
                            payload: Buffer.concat(payload).toString(),
                            status: 200,
                            body: 'PUT proxy target',
                        }),
                    );
                });

                return;
            }

            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Not found XXX');
        });
    }

    listen(host = 'http://0.0.0.0:0') {
        const addr = url.parse(host);
        return new Promise((resolve) => {
            this._server = this._app.listen(
                { host: addr.hostname, port: parseInt(addr.port || '', 10) },
                () => {
                    const address = `http://${this._server.address().address}:${
                        this._server.address().port
                    }`;
                    const manifest = `${address}${this._routeManifest}`;
                    const content = `${address}${this._routeContent}`;
                    const error = `${address}${this._routeError}`;
                    const options = {
                        uri: manifest,
                        name: this._podlet.name,
                    };
                    resolve({
                        manifest,
                        content,
                        error,
                        address,
                        options,
                    });
                },
            );
            enableDestroy(this._server);
        });
    }

    close() {
        if (this._server) {
            return new Promise((resolve, reject) => {
                this._server.destroy((/** @type {any} */ err) => {
                    if (err) {
                        reject(err);
                    } else {
                        // @ts-expect-error resolve can be called with no argumnents
                        resolve();
                    }
                });
            });
        }
        return Promise.resolve();
    }

    static makeVersion(index = 1) {
        return `1.0.0-beta.${index.toString()}`;
    }
}
