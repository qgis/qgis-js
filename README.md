# qgis-js

**QGIS core ported to WebAssembly to run it on the web platform**

> ⚠️🧪 **Work in progress**! Currently this project is in public beta and only does very basic things like loading a QGIS project and rendering it to a canvas _(see [Limitations](#limitations))_

> **Help wanted**! TODO

## About

This project proviedes recipies to compile [QGIS](https://qgis.org/) core and all its dependencies to [WebAssembly](https://webassembly.org/) using [Emscripten](https://emscripten.org/), and there are JavaScript bindings on top of that to use QGIS core APIs.

Currently we are only focused on having QGIS core library working. It is out of scope to bring the full QGIS desktop app, GUI library or Python bindings.

## Packages

| Package                                                  | Description                                                           | npm                                                                                                                   |
| -------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **[qgis-js](./packages/qgis-js/README.md)**              | The qgis-js API (which also ships the `.wasm` binary)                 | [![qgis-js on npm](https://img.shields.io/npm/v/qgis-js)](https://www.npmjs.com/package/qgis-js)                      |
| **[@qgis-js/ol](./packages/qgis-js-ol/README.md)**       | [OpenLayers](https://openlayers.org/) sources to display qgis-js maps | [![@qgis-js/ol on npm](https://img.shields.io/npm/v/@qgis-js/ol)](https://www.npmjs.com/package/@qgis-js/ol)          |
| **[@qgis-js/utils](./packages/qgis-js-utils/README.md)** | Utilties to integrate qgis-js into web applications                   | [![@qgis-js/utils on npm](https://img.shields.io/npm/v/@qgis-js/utils)](https://www.npmjs.com/package/@qgis-js/utils) |

## Getting started

| Example                           | Source code                                                      | StackBlitz                                                                                                                                                                                        |
| --------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Using the qgis-js API example** | [`docs/examples/qgis-js-example-api`](./docs/examples/qgis-js-example-api) | [![Open the "Using the qgis-js API" example in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/qgis/qgis-js/docs/examples/qgis-js-example-api) |
| **Minimal OpenLayers example**    | [`docs/examples/qgis-js-example-ol`](./docs/examples/qgis-js-example-ol)   | [![Open the "Minimal OpenLayers" example in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/qgis/qgis-js/docs/examples/qgis-js-example-ol)     |

## Compatibility

A modern web browser is needed (e.g. Chrome >= 95, Firefox >= 100) because the package needs some more recent WebAssembly features: threads and exception handling.

## Limitations

Compared to the native build of QGIS, there are various limitations of running in the web browser:

- Network requests to other hosts (WMS, WMTS, raster/vector tiles, ...) may not work if not allowed by those hosts because of [CORS mechanism](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) in browsers
- Some providers that need to do communication with a server using sockets will not work (e.g. PostgreSQL)

## How to build qgis-js

> 💡 NOTE: To just use qgis-js you don't need to build it yourself, you can install it from npm. See the provided [Packages](#packages).

### Install dependencies

#### Install the following **system packages** (on Ubuntu 22.04):

```
sudo apt-get install pkg-config ninja-build flex bison
```

#### Install **Qt6**:

- **Download** the [Qt Online Installer](https://www.qt.io/download-qt-installer-oss)

  - You need a free Qt account to use the installer

- **Install** at least the following **6.5.2** packages:

  - WebAssembly (multi-threaded)
    - Qt 5 Compatibility Module

> Alternativly you can use [Another Qt installer (aqt)](https://github.com/miurahr/aqtinstall) with Python

- **Patch** Qt installation
  - Run `build/scripts/qt-patches.sh` to patch the Qt installation
    - Set `QGIS_JS_QT` env var if you're not using `~/Qt/6.5.2`

#### Install dependencies with pnpm:

```
npx pnpm install
```

> This will also invoke `./qgis-js.ts -v install` on "postinstall" which
>
> - downloads and installs emsdk in `build/emdsk`
> - downloads and installs vcpkg in `build/vcpkg`
> - boostraps vcpkg and downlaod the ports sources
>
> see also [`build/scripts/install.sh`](./build/scripts/install.sh) for manual installation

### Compile qgis-js (and it's dependencies) with Emscripten

```
npm run compile
```

> - Can also be ivoked with `compile:debug` or `compile:release`, see [Build types](#Build-types)
> - Will take about 30 minutes on a modern machine to compile all the vcpkg ports during the first run... ☕
> - see also [`build/scripts/compile.sh`](./build/scripts/compile.sh) for manual compiltion

### Build `qgis-js` packages

You want to compile with a `Release` [build type](#build-types) first

```
npm run compile:release
```

After successful compilation, you can build the packages with Vite:

```
npm run build
```

> see the [packages listed at the beginning of this README](#packages)

### Development

You probably want to compile with a `Dev` or `Debug` [build type](#build-types) first

```
npm run compile:dev
```

Start a Vite development server:

```
npm run dev
```

Open your browser at http://localhost:5173

## Build types

### `Dev` build type

- Optimized for **fast link times** during development
  - Symbols are present (e.g. meaningful stacktraces)
  - Enables some Emscripten assertions
  - No DWARF debug info
- Empty `CMAKE_BUILD_TYPE` in CMake

### `Debug` build type

- Optimized for **debugging** with DWARF in Chromium based browsers
  - Includes symbols and DWARF debug info
  - Enables most Emscripten assertions
- see [docs/debugging.md](docs/debugging.md) on how to get started
- Will take much longer to build than the default `Dev` build type
- `CMAKE_BUILD_TYPE=Debug` in CMake

### `Release` build type

- Optimized for **performance and minimal package size**
  - No symbols, assertions or DWARF debug info
  - Minified JavaScript files
- Will take much longer to build than the default `Dev` build type
- `CMAKE_BUILD_TYPE=Release` in CMake

## Contributing

Contributions welcome, see [CONTRIBUTING.md](CONTRIBUTING.md) on how to get started

## License

[GNU General Public License v2.0](LICENSE)
