# fetchy

fetchy is a very opinionated minimal wrapper around `window.fetch`.

## Goals

1. Fetchy is meant for side-projects where `window.fetch` feels low-level. Instead of always writing the same abstractions over `window.fetch`, this library can be used.
2. The surface area of the library is intentionally very small. This is not meant for huge projects with many developers.

## Installation

**npm**

```
npm install @alivenotions/fetchy
```

**yarn**

```
yarn add @alivenotions/fetchy
```

## Examples

**HTTP methods**

```javascript
import fetchy from '@alivenotions/fetchy'

const url = `http://localhost/home`
const response = await fetchy.get(url).json()

await fetchy.post(url, { user: { id: 2 } }, { credentials: include })
```

**Global configuration**

```javascript
import { createFetchyConfiguration } from '@alivenotions/fetchy'

const fetchy = createFetchyConfiguration({
  baseResource: 'http://localhost/',
  interceptors: (url, init) => {
    console.log(`sent a request to ${url} at ${Date.now}`)
  },
  init: {
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'same-origin',
  },
})

const response = await fetchy.get('home')
```

## Design decisions

1. All the HTTP request methods are available on the top level.
2. Non 2xx status codes error out.
3. JSON body can be passed as the second argument for `post`, `put`, `delete` and `patch`. It will automatically be passed through `JSON.stringify`. I mostly find myself working with JSON hence the preference. `get` and `head` don't have this argument.
4. Regular [init](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) can be passed as the third argument to `post`, `put`, `delete` and `head` methods.
5. Helper methods to transform body data like `json`, `text` etc. are available on the top-level promise to save another `.then()` chain or another `await`.
6. The first argument for all methods is `resource`/`url`. Currently it's always a string. In the future, we can probably accomodate the `Request` object too.
7. A central configuration object is also available that allows for configuring http call interceptions, base urls, and option defaults.

## API

### 1. fetchy.get(url [, initOptions])

### 2. fetchy.post(url, [, body, initOptions])

### 3. fetchy.put(url, [, body, initOptions])

### 4. fetchy.delete(url, [, body, initOptions])

### 5. fetchy.patch(url, [, body, initOptions])

### 6. fetchy.head(url [, initOptions])

### 7. createFetchyConfiguration({ baseResource?, interceptors?, initOptions? })

## Future scope

1. Add timeout
2. Add retries

Will probably stop after this (probably will be 1.2.0), as there are already many libraries that fulfill many more requirements and are far less opinionated.
