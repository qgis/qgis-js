# Compatibility

## Features

qgis-js uses the following features which have to be supported by the JavaScript/WebAssembly runtime:

- ES modules with [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports)
- [SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)
- [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly)
  - [WebAssembly Threads](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)
  - [WebAssembly Exception Handling](https://developer.mozilla.org/en-US/docs/WebAssembly/Exception_handling)

## COOP/COEP

In order to use SharedArrayBuffer a secure cross-origin context is required. This means that the [Cross-Origin-Opener-Policy (COOP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cross-Origin-Opener-Policy) and [Cross-Origin-Embedder-Policy (COEP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cross-Origin-Embedder-Policy) headers have to be set by the server.

Alternativley one can use [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker) to set the headers through a service worker. This makes it possible to use qgis-js for example on GitHub pages.

## Supported Browsers

The [features listed above are supported by the following browsers](https://caniuse.com/es6-module-dynamic-import,wasm,sharedarraybuffer,mdn-javascript_builtins_webassembly_exception,webworkers):

- **Chromium based browsers (>= 95)**

- **Firefox (>= 100)**

- Safari (15.2, yet to be tested!)

### Mobile Browsers

> 🚧 At the moment we don't support mobile browsers

## Supported JavaScript Runtimes

> 🚧 At the moment only browsers are supported
