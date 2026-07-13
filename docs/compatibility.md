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

## Content Security Policy (CSP)

qgis-js runs under a strict [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src) which does **not** allow `unsafe-eval`:

```
Content-Security-Policy: script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'
```

`wasm-unsafe-eval` is required and expected: it is what allows WebAssembly to be compiled and instantiated. Unlike `unsafe-eval` it does **not** permit JavaScript `eval()`.

`worker-src` has to allow the runtime as well, because qgis-js runs its threads in Web Workers which are created from the runtime script (only relevant if the CSP has a `default-src` which would otherwise apply to them). Note that a Worker is governed by the CSP of **its own** response, so the header has to be set on the runtime files too, not only on the document.

To achieve this, the runtime is built with [`DYNAMIC_EXECUTION=0`](https://emscripten.org/docs/tools_reference/settings_reference.html#dynamic-execution), so that Emscripten emits no `eval()`/`new Function()` in its glue code. Because embind would otherwise generate its JavaScript invokers at runtime with `new Function()`, [`EMBIND_AOT`](https://emscripten.org/docs/tools_reference/settings_reference.html#embind-aot) is enabled to generate them at compile time instead (which also avoids the performance penalty that `DYNAMIC_EXECUTION=0` would incur).

The [dev site](../sites/dev) is served with this CSP (see [`ContentSecurityPolicyPlugin`](../build/vite/ContentSecurityPolicyPlugin.ts)), so that a regression is caught immediately. Note that it additionally allows `unsafe-inline`, which is needed for the inline scripts of the demo pages themselves (and by the Vite dev server), but not by qgis-js.

Additionally the [`ContentSecurityPolicyCheckPlugin`](../build/vite/ContentSecurityPolicyPlugin.ts) fails the build of the `qgis-js` package if the runtime or the loader would use `eval()`/`new Function()`.

## Supported Browsers

The [features listed above are supported by the following browsers](https://caniuse.com/es6-module-dynamic-import,wasm,sharedarraybuffer,mdn-javascript_builtins_webassembly_exception,webworkers):

- **Chromium based browsers (>= 95)**

- **Firefox (>= 100)**

- Safari (15.2, yet to be tested!)

### Mobile Browsers

> 🚧 At the moment we don't support mobile browsers

## Supported JavaScript Runtimes

> 🚧 At the moment only browsers are supported
