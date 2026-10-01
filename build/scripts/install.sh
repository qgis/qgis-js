#!/bin/bash
set -eo pipefail

git submodule update --init build/emsdk
build/emsdk/emsdk install 6.0.10;
build/emsdk/emsdk activate 6.0.10;

git submodule update --init build/vcpkg
./build/vcpkg/bootstrap-vcpkg.sh -disableMetrics

./build/vcpkg/vcpkg install \
--x-install-root=build/wasm/vcpkg_installed \
--only-downloads \
--triplet wasm32-emscripten-qt-threads
