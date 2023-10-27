#!/bin/bash
set -eo pipefail

(cd build/emsdk; git clean -xfd)

(cd build/vcpkg; git clean -xfd)

rm -rf build/wasm && mkdir build/wasm
