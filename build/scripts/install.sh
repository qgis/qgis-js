#!/bin/bash
set -eo pipefail

git submodule init build/emsdk
build/emsdk/emsdk install 3.1.29;
build/emsdk/emsdk activate 3.1.29;

git submodule init build/vcpkg
./build/vcpkg/bootstrap-vcpkg.sh -disableMetrics

./build/vcpkg/vcpkg install \
--x-install-root=build/wasm/vcpkg_installed \
--only-downloads \
--overlay-triplets=build/vcpkg-triplets \
--overlay-ports=build/vcpkg-ports \
--triplet wasm32-emscripten-qt-threads
