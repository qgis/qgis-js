# qgis-js

Work in progress!

## Install dependencies

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
- Patch Qt installation
  - go to `qt-patches` directory in this repo and run `bash qt-patch.sh` (fix QT_DIR if you're not using `~/Qt` for Qt6 install)

## Build

This is assuming the following paths:

- vcpkg in `~/inst/vcpkg`
- emsdk in `~/inst/emsdk`
- Qt in `~/Qt`
- this repo in `~/qgis/wasm/test_vcpkg`

Fix hardcoded paths in `vcpkg-triplets/*.cmake` to point to your paths (TODO: fix!).

Get emscripten tools in PATH:

```
source "~/inst/emsdk/emsdk_env.sh"
```

Run CMake (the first run will take long time as it will build all dependencies with vcpkg:

```
QT_HOST_PATH=~/Qt/6.5.2/gcc_64 \
Qt6_DIR=~/Qt/6.5.2/wasm_multithread \
VCPKG_BINARY_SOURCES=clear \
~/inst/vcpkg/downloads/tools/cmake-3.27.1-linux/cmake-3.27.1-linux-x86_64/bin/cmake \
  -B build-wasm -S . -G Ninja \
  -DCMAKE_TOOLCHAIN_FILE=~/inst/vcpkg/scripts/buildsystems/vcpkg.cmake \
  -DVCPKG_TARGET_TRIPLET=wasm32-emscripten-qt-threads \
  -DVCPKG_OVERLAY_TRIPLETS=./vcpkg-triplets \
  -DVCPKG_OVERLAY_PORTS=./vcpkg-ports \
  -DVCPKG_CHAINLOAD_TOOLCHAIN_FILE=~/qgis/wasm/test_vcpkg/vcpkg-triplets/my_toolchain.cmake \
  -DCMAKE_BUILD_TYPE=
```

(Empty CMAKE_BUILD_TYPE is good for dev, with fast link times. One can use `Release` for optimized
release build or `Debug` for debug build with symbols included - both take much longer to build.)

After successful configure, build the WebAssembly binary:

```
cmake --build build-wasm
```

Finally run the code:

```
cp -r js/* build-wasm/
(cd build-wasm && emrun qgis.html)
```
