# qgis-js

**QGIS core ported to WebAssembly to run it on the web platform**

Version: `0.0.4` (based on QGIS 3.32.1)

[qgis-js Repository](https://github.com/qgis/qgis-js) | [qgis-js Website](https://qgis.github.io/qgis-js)

> ⚠️🧪 **Work in progress**! Currently this project is in public beta and only does very basic things like loading a QGIS project and rendering it to an image _(see [Features](#features) and [Limitations](#limitations))_

> 🌱👋 **Help wanted**! Please try out your QGIS projects and report [issues](https://github.com/qgis/qgis-js/issues) and [ideas](https://github.com/qgis/qgis-js/discussions/categories/ideas) on GitHub. We are also warmly welcoming contributions to this project _(see [Contributing](#contributing))_

## About

This project provides recipes to compile [QGIS](https://qgis.org/) core and its [dependencies](#libraries) to [WebAssembly](https://webassembly.org/) using [Emscripten](https://emscripten.org/), [CMake](https://cmake.org/) and [vcpkg](https://vcpkg.io).

qgis-js provides a JavaScript/TypeScript API to interact with QGIS, load projects and render beautiful QGIS-based maps on the web platform (see [Features](#features)).

Please note that our focus is currently on making the QGIS core usable. The project does not aim to bring the full QGIS desktop application, GUI library, or Python bindings (see [Limitations](#limitations)).

> 📚 See the [qgis-js Website](https://qgis.github.io/qgis-js) or [`./docs`](https://github.com/qgis/qgis-js/tree/main/docs) for more detailed information

## Packages

| Package                                                  | Description                                                           | npm                                                                                                                   |
| -------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **[qgis-js](./packages/qgis-js/README.md)**              | The qgis-js API (which also ships the `.wasm` binary)                 | [![qgis-js on npm](https://img.shields.io/npm/v/qgis-js)](https://www.npmjs.com/package/qgis-js)                      |
| **[@qgis-js/ol](./packages/qgis-js-ol/README.md)**       | [OpenLayers](https://openlayers.org/) sources to display qgis-js maps | [![@qgis-js/ol on npm](https://img.shields.io/npm/v/@qgis-js/ol)](https://www.npmjs.com/package/@qgis-js/ol)          |
| **[@qgis-js/utils](./packages/qgis-js-utils/README.md)** | Utilities to integrate qgis-js into web applications                  | [![@qgis-js/utils on npm](https://img.shields.io/npm/v/@qgis-js/utils)](https://www.npmjs.com/package/@qgis-js/utils) |

## Getting started

| Example                              | Source code                                                                | StackBlitz                                                                                                                                                                                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📐 **Using the qgis-js API example** | [`docs/examples/qgis-js-example-api`](./docs/examples/qgis-js-example-api) | [![Open the "Using the qgis-js API" example in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/qgis/qgis-js/tree/main/docs/examples/qgis-js-example-api?file=main.js&title=qgis-js-example-api) |
| 🗺️ **Minimal OpenLayers example**    | [`docs/examples/qgis-js-example-ol`](./docs/examples/qgis-js-example-ol)   | [![Open the "Minimal OpenLayers" example in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/qgis/qgis-js/tree/main/docs/examples/qgis-js-example-ol?file=main.js&title=qgis-js-example-ol)      |

## Compatibility

A modern desktop browser is needed. At the moment we only support/test **Chromium-based browsers (>= 95)** and **Firefox (>= 100)**

> 📚 See [docs/compatibility.md](docs/compatibility.md) for more details

## Features

This project is a work in progress. Currently it provides the following features:

- QGIS core (and its [dependencies](#libraries)) compiled to WebAssembly
  - JavaScript/TypeScript API to interact QGIS core
- Loading of QGIS projects
- Non-blocking rendering of QGIS maps/tiles to [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData?retiredLocale=de)
- Optional [OpenLayers](https://openlayers.org/) integration

## Limitations

Compared to the native build of QGIS, there are various limitations:

- The API surface is very limited at the moment
- Network-based layers (e.g. WMS, WFS, WMTS, XYZ, COG, Vector Tiles) are not supported at the moment
- No Python (PyQGIS) available
- No Qt GUI provided
- Some providers that need to communicate with a server using sockets will probably never work without proxies (e.g. PostgreSQL)

## How to build qgis-js

> 💡 NOTE: To just use qgis-js you don't need to build it yourself, you can install it from npm. See the provided [Packages](#packages).

### Install dependencies

#### Install the following **system packages** (on Ubuntu 22.04):

```
sudo apt-get install pkg-config ninja-build flex bison
```

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

### Compile qgis-js (and its [dependencies](#libraries)) with Emscripten

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

## Libraries

<!--NOTE: this can be generated with "./qgis-js.ts libs -o markdown"-->

| Library                                                                                                                                                                                                                                                     | License                 | Links                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **double-conversion** (3.3.0)<br /><div style="max-width:30em">_Efficient binary-decimal and decimal-binary conversion routines for IEEE doubles._                                                                                                          |                         | [Website](https://github.com/google/double-conversion) - [Source code](https://github.com/google/double-conversion)         |
| **egl-registry** (2022-09-20)<br /><div style="max-width:30em">_the EGL API and Extension Registry_                                                                                                                                                         |                         | [Website](https://github.com/KhronosGroup/EGL-Registry) - [Source code](https://github.com/KhronosGroup/EGL-Registry)       |
| **exiv2** (0.28.1)<br /><div style="max-width:30em">_Image metadata library and tools_                                                                                                                                                                      | GPL-2.0-or-later        | [Website](https://exiv2.org) - [Source code](https://github.com/Exiv2/exiv2)                                                |
| **expat** (2.6.0)<br /><div style="max-width:30em">_XML parser library written in C_                                                                                                                                                                        | MIT                     | [Website](https://github.com/libexpat/libexpat) - [Source code](https://github.com/libexpat/libexpat)                       |
| **freetype** (2.13.2)<br /><div style="max-width:30em">_A library to render fonts._                                                                                                                                                                         | FTL OR GPL-2.0-or-later | [Website](https://www.freetype.org/) - [Source code](https://sourceforge.com/p/freetype)                                    |
| **gdal** (3.7.1)<br /><div style="max-width:30em">_The Geographic Data Abstraction Library for reading and writing geospatial raster and vector data_                                                                                                       |                         | [Website](https://gdal.org) - [Source code](https://github.com/OSGeo/gdal)                                                  |
| **geos** (3.11.3)<br /><div style="max-width:30em">_Geometry Engine Open Source_                                                                                                                                                                            | LGPL-2.1-only           | [Website](https://libgeos.org/)                                                                                             |
| **gumbo** (0.10.1)<br /><div style="max-width:30em">_An HTML5 parsing library in pure C99_                                                                                                                                                                  | Apache-2.0              | [Website](https://github.com/google/gumbo-parser) - [Source code](https://github.com/google/gumbo-parser)                   |
| **inih** (57)<br /><div style="max-width:30em">_Simple .INI file parser_                                                                                                                                                                                    | BSD-3-Clause            | [Website](https://github.com/benhoyt/inih) - [Source code](https://github.com/benhoyt/inih)                                 |
| **json-c** (2023-08-12)<br /><div style="max-width:30em">_A JSON implementation in C_                                                                                                                                                                       | MIT                     | [Website](https://github.com/json-c/json-c) - [Source code](https://github.com/json-c/json-c)                               |
| **libgeotiff** (1.7.1)<br /><div style="max-width:30em">_Libgeotiff is an open source library on top of libtiff for reading and writing GeoTIFF information tags._                                                                                          | MIT                     | [Website](https://github.com/OSGeo/libgeotiff) - [Source code](https://github.com/OSGeo/libgeotiff)                         |
| **libiconv** (1.17)<br /><div style="max-width:30em">_GNU Unicode text conversion_                                                                                                                                                                          |                         | [Website](https://www.gnu.org/software/libiconv/)                                                                           |
| **libjpeg-turbo** (3.0.2)<br /><div style="max-width:30em">_libjpeg-turbo is a JPEG image codec that uses SIMD instructions (MMX, SSE2, NEON, AltiVec) to accelerate baseline JPEG compression and decompression on x86, x86-64, ARM, and PowerPC systems._ | BSD-3-Clause            | [Website](https://github.com/libjpeg-turbo/libjpeg-turbo) - [Source code](https://github.com/libjpeg-turbo/libjpeg-turbo)   |
| **liblzma** (5.4.4)<br /><div style="max-width:30em">_Compression library with an API similar to that of zlib._                                                                                                                                             |                         | [Website](https://tukaani.org/xz/) - [Source code](https://github.com/tukaani-project/xz)                                   |
| **libpng** (1.6.40)<br /><div style="max-width:30em">_libpng is a library implementing an interface for reading and writing PNG (Portable Network Graphics) format files_                                                                                   | libpng-2.0              | [Website](https://github.com/glennrp/libpng) - [Source code](https://github.com/glennrp/libpng)                             |
| **libspatialindex** (1.9.3)<br /><div style="max-width:30em">_C++ implementation of R\*-tree, an MVR-tree and a TPR-tree with C API._                                                                                                                       | MIT                     | [Website](http://libspatialindex.github.com) - [Source code](https://github.com/libspatialindex/libspatialindex)            |
| **libzip** (1.10.1)<br /><div style="max-width:30em">_A library for reading, creating, and modifying zip archives._                                                                                                                                         | BSD-3-Clause            | [Website](https://github.com/nih-at/libzip) - [Source code](https://github.com/nih-at/libzip)                               |
| **litehtml** (0.6.0)<br /><div style="max-width:30em">_litehtml is the lightweight HTML rendering engine with CSS2/CSS3 support._                                                                                                                           | BSD-3-Clause            | [Website](https://github.com/litehtml/litehtml) - [Source code](https://github.com/litehtml/litehtml)                       |
| **nlohmann-json** (3.11.3)<br /><div style="max-width:30em">_JSON for Modern C++_                                                                                                                                                                           | MIT                     | [Website](https://github.com/nlohmann/json) - [Source code](https://github.com/nlohmann/json)                               |
| **opengl-registry** (2022-09-29)<br /><div style="max-width:30em">_the API and Extension registries for the OpenGL family APIs_                                                                                                                             |                         | [Website](https://github.com/KhronosGroup/OpenGL-Registry) - [Source code](https://github.com/KhronosGroup/OpenGL-Registry) |
| **opengl** (2022-12-04)<br /><div style="max-width:30em">_Open Graphics Library (OpenGL)[3][4][5] is a cross-language, cross-platform application programming interface (API) for rendering 2D and 3D vector graphics._                                     |                         |                                                                                                                             |
| **pcre2** (10.42)<br /><div style="max-width:30em">_Regular Expression pattern matching using the same syntax and semantics as Perl 5._                                                                                                                     | BSD-3-Clause            | [Website](https://github.com/PCRE2Project/pcre2) - [Source code](https://github.com/PCRE2Project/pcre2)                     |
| **proj** (9.3.1)<br /><div style="max-width:30em">_PROJ library for cartographic projections_                                                                                                                                                               | MIT                     | [Website](https://proj.org/) - [Source code](https://github.com/OSGeo/PROJ)                                                 |
| **protobuf** (3.21.12)<br /><div style="max-width:30em">_Protocol Buffers - Google's data interchange format_                                                                                                                                               | BSD-3-Clause            | [Website](https://github.com/protocolbuffers/protobuf) - [Source code](https://github.com/protocolbuffers/protobuf)         |
| **qca** (2.3.7)<br /><div style="max-width:30em">_Qt Cryptographic Architecture (QCA)._                                                                                                                                                                     |                         | [Website](https://userbase.kde.org/QCA) - [Source code](https://github.com/KDE/qca)                                         |
| **qgis** (3.32.1)<br /><div style="max-width:30em">_QGIS is a free, open source, cross platform (lin/win/mac) geographical information system (GIS)_                                                                                                        | GPL-2.0                 | [Website](https://www.qgis.org/) - [Source code](https://github.com/qgis/QGIS)                                              |
| **qt5compat** (6.6.1)<br /><div style="max-width:30em">_The module contains unsupported Qt 5 APIs_                                                                                                                                                          |                         | [Website](https://www.qt.io/)                                                                                               |
| **qtbase** (6.6.1)<br /><div style="max-width:30em">_Qt Application Framework Base Module. Includes Core, GUI, Widgets, Networking, SQL, Concurrent and other essential qt components._                                                                     |                         | [Website](https://www.qt.io/)                                                                                               |
| **qtkeychain** (0.14.0)<br /><div style="max-width:30em">_(Unaffiliated with Qt) Platform-independent Qt5 API for storing passwords securely_                                                                                                               | BSD-3-Clause            | [Website](https://github.com/frankosterfeld/qtkeychain) - [Source code](https://github.com/frankosterfeld/qtkeychain)       |
| **qtsvg** (6.6.1)<br /><div style="max-width:30em">_Qt SVG_                                                                                                                                                                                                 |                         | [Website](https://www.qt.io/)                                                                                               |
| **qttools** (6.6.1)<br /><div style="max-width:30em">_Qt Tools_                                                                                                                                                                                             |                         | [Website](https://www.qt.io/)                                                                                               |
| **sqlite3** (3.45.0)<br /><div style="max-width:30em">_SQLite is a software library that implements a self-contained, serverless, zero-configuration, transactional SQL database engine._                                                                   | blessing                | [Website](https://sqlite.org/)                                                                                              |
| **tiff** (4.6.0)<br /><div style="max-width:30em">_A library that supports the manipulation of TIFF image files_                                                                                                                                            | libtiff                 | [Website](https://libtiff.gitlab.io/libtiff/) - [Source code](https://gitlab.com/libtiff/libtiff)                           |
| **zlib** (1.3.1)<br /><div style="max-width:30em">_A compression library_                                                                                                                                                                                   | Zlib                    | [Website](https://www.zlib.net/) - [Source code](https://github.com/madler/zlib)                                            |

## Build types

### `Dev` build type

- Optimized for **fast link times** during development
  - Symbols are present (e.g. meaningful stack traces)
  - Enables some Emscripten assertions
  - No DWARF debug info
- Empty `CMAKE_BUILD_TYPE` in CMake

### `Debug` build type

- Optimized for **debugging** with DWARF in Chromium-based browsers
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

Contributions welcome, see [CONTRIBUTING.md](CONTRIBUTING.md) for how to get started

## License

[GNU General Public License v2.0](LICENSE)
