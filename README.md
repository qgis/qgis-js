# qgis-js

QGIS core library made into a JavaScript package that can be run in web browsers!

QGIS code and all its dependencies get compiled to WebAssembly using Emscripten, and there are JavaScript bindings on top of that to use QGIS core APIs.

A modern web browser is needed (e.g. Chrome >= 95, Firefox >= 100) because the package needs some more recent WebAssembly features: threads and exception handling.

⚠️ Work in progress! Currently this package only does basic things like loading a QGIS project and map rendering (to an image).

Currently we are only focused on having QGIS core library working. It is out of scope to bring the full QGIS desktop app, GUI library or Python bindings.

There is also code for integration with OpenLayers (see qgis-js-ol package).

## Limitations

Compared to the native build of QGIS, there are various limitations of running in the web browser:

- Network requests to other hosts (WMS, WMTS, raster/vector tiles, ...) may not work if not allowed by those hosts because of [CORS mechanism](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) in browsers
- Some providers that need to do communication with a server using sockets will not work (e.g. PostgreSQL)

## How to build

### Install dependencies

Install the following packages (on Ubuntu 22.04):

```
sudo apt-get install pkg-config ninja-build flex bison
```

Install vcpkg:

```
git clone https://github.com/microsoft/vcpkg
./vcpkg/bootstrap-vcpkg.sh
```

(my vcpkg commit was `c95000e1b`)

Install Emscripten:

```
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install 3.1.29
./emsdk activate 3.1.29
```

Install Qt6:

- Download Qt online installer: https://www.qt.io/download-open-source (one needs free Qt account to use the installer)
- Install at least the following 6.5.2 packages:
  - WebAssembly (multi-threaded)
  - Qt 5 Compatibility Module
- Patch Qt installation (TODO this seems not to be nessesary anymore?)
  - go to `qt-patches` directory in this repo and run `bash qt-patch.sh` (fix QT_DIR if you're not using `~/Qt` for Qt6 install)

### Build

This is assuming the following paths:

- Qt in `~/Qt`

Run CMake (the first run will take long time as it will build all dependencies with vcpkg:

```
QT_HOST_PATH=~/Qt/6.5.2/gcc_64 \
Qt6_DIR=~/Qt/6.5.2/wasm_multithread \
VCPKG_BINARY_SOURCES=clear \
$(echo ./build/vcpkg/downloads/tools/cmake-*/*/bin/cmake) \
  -S . \
  -B build/wasm \
  -G Ninja \
  -DCMAKE_TOOLCHAIN_FILE=$PWD/build/vcpkg/scripts/buildsystems/vcpkg.cmake \
  -DVCPKG_CHAINLOAD_TOOLCHAIN_FILE=$PWD/build/vcpkg-toolchains/qgis-js.cmake \
  -DVCPKG_OVERLAY_TRIPLETS=./build/vcpkg-triplets \
  -DVCPKG_OVERLAY_PORTS=./build/vcpkg-ports \
  -DVCPKG_TARGET_TRIPLET=wasm32-emscripten-qt-threads \
  -DCMAKE_BUILD_TYPE=
```

(Empty CMAKE_BUILD_TYPE is good for dev, with fast link times. One can use `Release` for optimized
release build or `Debug` for debug build with symbols included - both take much longer to build.)

After successful configure, build the WebAssembly binary:

```
cmake --build build/wasm
```

Finally install and run the npm meta pckage:

```
npx pnpm install
npm run dev
```
