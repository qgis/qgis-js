#!/bin/bash
set -eo pipefail

# if vcpkg has installed its own cmake, use that, otherwise use the system cmake
$(find . -iwholename './build/vcpkg/downloads/tools/cmake-*/*/bin/cmake' | grep bin/cmake || echo cmake) \
-S . \
-B build/wasm \
-G Ninja \
-DCMAKE_TOOLCHAIN_FILE=$PWD/build/vcpkg/scripts/buildsystems/vcpkg.cmake \
-DVCPKG_CHAINLOAD_TOOLCHAIN_FILE=$PWD/build/vcpkg-toolchains/qgis-js.cmake \
-DVCPKG_TARGET_TRIPLET=wasm32-emscripten-qt-threads \
-DCMAKE_BUILD_TYPE=

$(echo ./build/vcpkg/downloads/tools/cmake-*/*/bin/cmake) \
--build build/wasm
