# qgis-js

**QGIS core ported to WebAssembly to run it on the web platform**

Version: `0.0.4` (based on QGIS 3.32.1)

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

const rect = new api.Rectangle(1, 2, 3, 4);
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

The size of the package is **`54.2 MB`** (uncompressed) or `14.57 MB` Brotli compressed (73% space saving) / `16.88 MB` Gzip compressed (69% space saving)

It consists of the following files:

| File name                  | Size (uncompressed) | Size (Brotli compressed)      | Size (Gzip compressed)        |
| -------------------------- | ------------------- | ----------------------------- | ----------------------------- |
| `qgis.js`                  | `5.93 kB`           | `2.12 kB` (64% space saving)  | `2.22 kB` (62% space saving)  |
| `assets/wasm/qgis-js.js`   | `315.36 kB`         | `69.97 kB` (78% space saving) | `74.38 kB` (76% space saving) |
| `assets/wasm/qgis-js.data` | `11.09 MB`          | `1.75 MB` (84% space saving)  | `2.28 MB` (79% space saving)  |
| `assets/wasm/qgis-js.wasm` | `42.8 MB`           | `12.75 MB` (70% space saving) | `14.53 MB` (66% space saving) |

### Libraries

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

## Versioning

This package uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/qgis/qgis-js/tags).

## License

[GNU General Public License v2.0](https://github.com/qgis/qgis-js/blob/main/LICENSE)
