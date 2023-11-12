# Debugging

## Setup

- Make sure that you have compiled qgis-js with the [`Debug` build type](../README.md#build-types)

- DWARF debug info is only supported in Chromium based browsers (Chrome, Edge, Brave, ...)

  - Make sure that you have enabled the "Experimental WebAssembly features" flag in your browser (see [Debugging WebAssembly with modern tools](https://developer.chrome.com/blog/wasm-debugging-2020/))

  - Install the [C/C++ DevTools Support (DWARF)](https://chrome.google.com/webstore/detail/pdcpmagijalfljmkmjngeonclgbbannb) extension

## Links

- [Debugging WebAssembly with modern tools](https://developer.chrome.com/blog/wasm-debugging-2020/), Chrome for Developers Blog, 2020

  - [Debugging WebAssembly Faster](https://developer.chrome.com/blog/faster-wasm-debugging/), Chrome for Developers Blog, 2022

- [WASM Debugging with Emscripten and VSCode](https://floooh.github.io/2023/11/11/emscripten-ide.html),
  The Brain Dump, 2023
