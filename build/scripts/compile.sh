#!/bin/bash
set -eo pipefail

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

cmake --build build/wasm
