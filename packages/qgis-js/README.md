# qgis-js

**QGIS core ported to WebAssembly to run it on the web platform**

Version: `4.0.0` (based on QGIS 4.0.0)

[qgis-js Repository](https://github.com/qgis/qgis-js) | [qgis-js Website](https://qgis.github.io/qgis-js) | ["`qgis-js`" package source](https://github.com/qgis/qgis-js/tree/main/packages/qgis-js)

[![qgis-js on npm](https://img.shields.io/npm/v/qgis-js)](https://www.npmjs.com/package/qgis-js)

> ⚠️🧪 **Work in progress**! Currently this project is in public beta

## Description

QGIS core compiled to WebAssembly to run it on the web platform. This package provides the WebAssembly module and JavaScript/TypeScript API to load the runtime and interact with QGIS.

See the [qgis-js repository](https://github.com/qgis/qgis-js) for more information about the project.

## Installation

```bash
npm install -S qgis-js
```

## Usage

```js
import { qgis } from "qgis-js";

const { api } = await qgis();

const rect = new api.QgsRectangle(1, 2, 3, 4);
rect.scale(5);
const center = rect.center();
console.log(center.x, center.y);
```

> 💡 Have a look at the [Integration packages](#integration-packages) to load QGIS projects and display them on a map

> ⚠️ It must be ensured that...
>
> - the clients meets the [compatibility requirements](https://github.com/qgis/qgis-js/blob/main/docs/compatibility.md)
> - that the webserver is configured to [allow cross-origin requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
> - that if you are using a bundler, it is [configured to load the qgis-js assets](https://github.com/qgis/qgis-js/blob/main/docs/bundling.md)

## Integration packages

| Package                                                  | Description                                                           | npm                                                                                                                   |
| -------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **[@qgis-js/ol](./packages/qgis-js-ol/README.md)**       | [OpenLayers](https://openlayers.org/) sources to display qgis-js maps | [![@qgis-js/ol on npm](https://img.shields.io/npm/v/@qgis-js/ol)](https://www.npmjs.com/package/@qgis-js/ol)          |
| **[@qgis-js/utils](./packages/qgis-js-utils/README.md)** | Utilities to integrate qgis-js into web applications                  | [![@qgis-js/utils on npm](https://img.shields.io/npm/v/@qgis-js/utils)](https://www.npmjs.com/package/@qgis-js/utils) |

## WebAssembly module

### Size

<!--NOTE: this can be generated with "./qgis-js.ts size -o markdown"-->

The size of the package is **`77.06 MB`** (uncompressed) or `18.74 MB` Brotli compressed (76% space saving) / `22.08 MB` Gzip compressed (71% space saving)

It consists of the following files:

| File name                  | Size (uncompressed) | Size (Brotli compressed)      | Size (Gzip compressed)        |
| -------------------------- | ------------------- | ----------------------------- | ----------------------------- |
| `qgis.js`                  | `5.19 kB`           | `1.87 kB` (64% space saving)  | `1.97 kB` (62% space saving)  |
| `assets/wasm/qgis-js.js`   | `276.92 kB`         | `61.28 kB` (78% space saving) | `65.16 kB` (76% space saving) |
| `assets/wasm/qgis-js.data` | `13.4 MB`           | `2.01 MB` (85% space saving)  | `2.62 MB` (80% space saving)  |
| `assets/wasm/qgis-js.wasm` | `63.39 MB`          | `16.67 MB` (74% space saving) | `19.4 MB` (69% space saving)  |

### Libraries

<!--NOTE: this can be generated with "./qgis-js.ts libs -o markdown"-->

| Library                                                                                                                                                                                                                                                                                                                                                 | License                      | Links                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **abseil** (20260107.1)<br /><div style="max-width:30em">_Abseil is an open-source collection of C++ library code designed to augment the C++ standard library. The Abseil library code is collected from Google's own C++ code base, has been extensively tested and used in production, and is the same code we depend on in our daily coding lives._ | Apache-2.0                   | [Website](https://github.com/abseil/abseil-cpp) - [Source code](https://github.com/abseil/abseil-cpp)                       |
| **double-conversion** (3.4.0)<br /><div style="max-width:30em">_Efficient binary-decimal and decimal-binary conversion routines for IEEE doubles._                                                                                                                                                                                                      |                              | [Website](https://github.com/google/double-conversion) - [Source code](https://github.com/google/double-conversion)         |
| **egl-registry** (2025-05-27)<br /><div style="max-width:30em">_EGL API and Extension Registry_                                                                                                                                                                                                                                                         |                              | [Website](https://github.com/KhronosGroup/EGL-Registry) - [Source code](https://github.com/KhronosGroup/EGL-Registry)       |
| **exiv2** (0.28.8)<br /><div style="max-width:30em">_Image metadata library and tools_                                                                                                                                                                                                                                                                  | GPL-2.0-or-later             | [Website](https://exiv2.org) - [Source code](https://github.com/Exiv2/exiv2)                                                |
| **expat** (2.7.4)<br /><div style="max-width:30em">_XML parser library written in C_                                                                                                                                                                                                                                                                    | MIT                          | [Website](https://github.com/libexpat/libexpat) - [Source code](https://github.com/libexpat/libexpat)                       |
| **freetype** (2.13.3)<br /><div style="max-width:30em">_A library to render fonts._                                                                                                                                                                                                                                                                     | FTL OR GPL-2.0-or-later      | [Website](https://www.freetype.org/) - [Source code](https://gitlab.freedesktop.org/freetype/freetype)                      |
| **gdal** (3.12.2)<br /><div style="max-width:30em">_The Geographic Data Abstraction Library for reading and writing geospatial raster and vector data_                                                                                                                                                                                                  |                              | [Website](https://gdal.org) - [Source code](https://github.com/OSGeo/gdal)                                                  |
| **geos** (3.14.1)<br /><div style="max-width:30em">_Geometry Engine Open Source_                                                                                                                                                                                                                                                                        | LGPL-2.1-only                | [Website](https://libgeos.org/)                                                                                             |
| **inih** (62)<br /><div style="max-width:30em">_Simple .INI file parser_                                                                                                                                                                                                                                                                                | BSD-3-Clause                 | [Website](https://github.com/benhoyt/inih) - [Source code](https://github.com/benhoyt/inih)                                 |
| **json-c** (0.18-20240915)<br /><div style="max-width:30em">_A JSON implementation in C_                                                                                                                                                                                                                                                                | MIT                          | [Website](https://github.com/json-c/json-c) - [Source code](https://github.com/json-c/json-c)                               |
| **libb2** (0.98.1)<br /><div style="max-width:30em">_C library providing BLAKE2b, BLAKE2s, BLAKE2bp, BLAKE2sp_                                                                                                                                                                                                                                          |                              | [Website](https://github.com/BLAKE2/libb2) - [Source code](https://github.com/BLAKE2/libb2)                                 |
| **libgeotiff** (1.7.4)<br /><div style="max-width:30em">_Libgeotiff is an open source library on top of libtiff for reading and writing GeoTIFF information tags._                                                                                                                                                                                      | MIT                          | [Website](https://github.com/OSGeo/libgeotiff)                                                                              |
| **libiconv** (1.18)<br /><div style="max-width:30em">_iconv() text conversion._                                                                                                                                                                                                                                                                         |                              | [Website](https://www.gnu.org/software/libiconv/)                                                                           |
| **libjpeg-turbo** (3.1.3)<br /><div style="max-width:30em">_libjpeg-turbo is a JPEG image codec that uses SIMD instructions (MMX, SSE2, NEON, AltiVec) to accelerate baseline JPEG compression and decompression on x86, x86-64, ARM, and PowerPC systems._                                                                                             | BSD-3-Clause                 | [Website](https://github.com/libjpeg-turbo/libjpeg-turbo)                                                                   |
| **liblzma** (5.8.2)<br /><div style="max-width:30em">_Compression library with an API similar to that of zlib._                                                                                                                                                                                                                                         |                              | [Website](https://tukaani.org/xz/)                                                                                          |
| **libpng** (1.6.55)<br /><div style="max-width:30em">_libpng is a library implementing an interface for reading and writing PNG (Portable Network Graphics) format files_                                                                                                                                                                               | libpng-2.0                   | [Website](https://github.com/pnggroup/libpng)                                                                               |
| **libspatialindex** (2.0.0)<br /><div style="max-width:30em">_C++ implementation of R\*-tree, an MVR-tree and a TPR-tree with C API._                                                                                                                                                                                                                   | MIT                          | [Website](http://libspatialindex.github.com)                                                                                |
| **libzip** (1.11.4)<br /><div style="max-width:30em">_A C library for reading, creating, and modifying zip archives._                                                                                                                                                                                                                                   | BSD-3-Clause                 | [Website](https://github.com/nih-at/libzip)                                                                                 |
| **md4c** (0.5.2)<br /><div style="max-width:30em">_MD4C is a C library providing a Markdown parser._                                                                                                                                                                                                                                                    | MIT                          | [Website](https://github.com/mity/md4c) - [Source code](https://github.com/mity/md4c)                                       |
| **nlohmann-json** (3.12.0)<br /><div style="max-width:30em">_JSON for Modern C++_                                                                                                                                                                                                                                                                       | MIT                          | [Website](https://github.com/nlohmann/json) - [Source code](https://github.com/nlohmann/json)                               |
| **opengl-registry** (2026-01-26)<br /><div style="max-width:30em">_OpenGL, OpenGL ES, and OpenGL ES-SC API and Extension Registry_                                                                                                                                                                                                                      |                              | [Website](https://github.com/KhronosGroup/OpenGL-Registry) - [Source code](https://github.com/KhronosGroup/OpenGL-Registry) |
| **opengl** (2022-12-04)<br /><div style="max-width:30em">_Open Graphics Library (OpenGL)[3][4][5] is a cross-language, cross-platform application programming interface (API) for rendering 2D and 3D vector graphics._                                                                                                                                 |                              |                                                                                                                             |
| **pcre2** (10.47)<br /><div style="max-width:30em">_Regular Expression pattern matching using the same syntax and semantics as Perl 5._                                                                                                                                                                                                                 | BSD-3-Clause                 | [Website](https://github.com/PCRE2Project/pcre2)                                                                            |
| **proj** (9.7.1)<br /><div style="max-width:30em">_PROJ library for cartographic projections_                                                                                                                                                                                                                                                           | MIT                          | [Website](https://proj.org/) - [Source code](https://github.com/OSGeo/PROJ)                                                 |
| **protobuf** (6.33.4)<br /><div style="max-width:30em">_Google's language-neutral, platform-neutral, extensible mechanism for serializing structured data._                                                                                                                                                                                             | BSD-3-Clause                 | [Website](https://github.com/protocolbuffers/protobuf) - [Source code](https://github.com/protocolbuffers/protobuf)         |
| **qgis** (4.0.0)<br /><div style="max-width:30em">_QGIS is a free, open source, cross platform (lin/win/mac) geographical information system (GIS)_                                                                                                                                                                                                     | GPL-2.0                      | [Website](https://www.qgis.org/) - [Source code](https://github.com/qgis/QGIS)                                              |
| **qt5compat** (6.10.1)<br /><div style="max-width:30em">_The Qt 5 Core Compat module contains the Qt 5 Core APIs that were removed in Qt 6. The module facilitates the transition to Qt 6._                                                                                                                                                             |                              | [Website](https://www.qt.io/)                                                                                               |
| **qtbase** (6.10.1)<br /><div style="max-width:30em">_Qt Base (Core, Gui, Widgets, Network, ...)_                                                                                                                                                                                                                                                       |                              | [Website](https://www.qt.io/)                                                                                               |
| **qtkeychain** (0.14.3)<br /><div style="max-width:30em">_(Unaffiliated with Qt) Platform-independent Qt6 API for storing passwords securely_                                                                                                                                                                                                           | BSD-3-Clause                 | [Website](https://github.com/frankosterfeld/qtkeychain) - [Source code](https://github.com/frankosterfeld/qtkeychain)       |
| **qtmultimedia** (6.10.1)<br /><div style="max-width:30em">_Qt Multimedia is an add-on module that provides a rich set of QML types and C++ classes to handle multimedia content._                                                                                                                                                                      |                              | [Website](https://www.qt.io/)                                                                                               |
| **qtshadertools** (6.10.1)<br /><div style="max-width:30em">_The Qt Shader Tools module is designed to provide a set of tools and utilities to work with graphics shaders._                                                                                                                                                                             |                              | [Website](https://www.qt.io/)                                                                                               |
| **qtsvg** (6.10.1)<br /><div style="max-width:30em">_Qt SVG provides classes for rendering and displaying SVG drawings in widgets and on other paint devices._                                                                                                                                                                                          |                              | [Website](https://www.qt.io/)                                                                                               |
| **qttools** (6.10.1)<br /><div style="max-width:30em">_A collection of tools and utilities that come with the Qt framework to assist developers in the creation, management, and deployment of Qt applications._                                                                                                                                        |                              | [Website](https://www.qt.io/)                                                                                               |
| **sqlite3** (3.51.2)<br /><div style="max-width:30em">_SQLite is a software library that implements a self-contained, serverless, zero-configuration, transactional SQL database engine._                                                                                                                                                               | blessing                     | [Website](https://sqlite.org/)                                                                                              |
| **tiff** (4.7.1)<br /><div style="max-width:30em">_A library that supports the manipulation of TIFF image files_                                                                                                                                                                                                                                        | libtiff                      | [Website](https://libtiff.gitlab.io/libtiff/) - [Source code](https://gitlab.com/libtiff/libtiff)                           |
| **utf8-range** (6.33.4)<br /><div style="max-width:30em">_Fast UTF-8 validation with Range algorithm (NEON+SSE4+AVX2)_                                                                                                                                                                                                                                  | MIT                          | [Website](https://github.com/protocolbuffers/protobuf) - [Source code](https://github.com/protocolbuffers/protobuf)         |
| **zlib** (1.3.1)<br /><div style="max-width:30em">_A compression library_                                                                                                                                                                                                                                                                               | Zlib                         | [Website](https://www.zlib.net/) - [Source code](https://github.com/madler/zlib)                                            |
| **zstd** (1.5.7)<br /><div style="max-width:30em">_Zstandard - Fast real-time compression algorithm_                                                                                                                                                                                                                                                    | BSD-3-Clause OR GPL-2.0-only | [Website](https://facebook.github.io/zstd/) - [Source code](https://github.com/facebook/zstd)                               |

## Versioning

This package uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/qgis/qgis-js/tags).

## License

[GNU General Public License v2.0](https://github.com/qgis/qgis-js/blob/main/LICENSE)
