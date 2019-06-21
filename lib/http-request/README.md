# Request

Simple HTTP client.

## Installation

```bash
$ npm install @podium/test-utils --save-dev
```

## Getting started

Do a GET:

```js
const result = await request({
    address: 'http://localhost:8080',
    pathname: '/foo'
});

console.log(result);
```

## API

### request(options, payload)

Do a HTTP request.

```js
const result = await request({
    address: 'http://localhost:8080',
    pathname: '/foo'
});
```

Return an object with the http headers and rsponse body:

```js
{
    headers: {
        'max-age': '60000',
    },
    body: '<div>some content</div>'
}
```

#### options

| option      | type      | default | description                                                 |
| ----------- | --------- | --------| ----------------------------------------------------------- |
| address     | `string`  |         | Address to the http server                                  |
| pathname    | `string`  |         | The pathname to request                                     |
| method      | `string`  | `GET`   | What method the request is                                  |
| json        | `boolean` | `false` | If the body response should be parsed from json to a object |

#### payload

If the option method is `POST` or `PUT` the payload to send to the server. The
payload should be a string value.

```js
const result = await request({
    address: 'http://localhost:8080',
    pathname: '/foo',
    method: 'POST',
}, 'Payload as a string');

console.log(result);
```
