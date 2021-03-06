# Test Utils

A set of misc test utilities used by tests in the different podium modules.

## Installation

```bash
$ npm install @podium/test-utils --save-dev
```

This module contain the following utils:

 * [PodletServer](/lib/podlet-server) - A dummy Podlet server with misc hooks to tap into manipulate the server on the fly.
 * [HttpsServer](/lib/https-server) - A simple https server with a request hook to insert a simple response.
 * [HttpServer](/lib/http-server) - A simple http server with a request hook to insert a simple response.
 * [request](/lib/http-request) - A simple http request client.
 * [destinationObjectStream](/lib/stream-utils) - A stream util to pipe Objects into. Calls a callback with all Objects streamed into it when done.
 * [destinationBufferStream](/lib/stream-utils) - A stream util to pipe Buffer chunks into. Calls a callback with a String of all buffer chunks when done.

 ## License

Copyright (c) 2019 FINN.no

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.