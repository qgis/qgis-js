EMSCRIPTEN_DIR=~/dev/qgis-js/emsdk/upstream/emscripten \
QT_HOST_PATH=~/Qt/6.5.2/gcc_64 \
Qt6_DIR=~/Qt/6.5.2/wasm_multithread \
VCPKG_BINARY_SOURCES=clear \
~/dev/qgis-js/vcpkg/downloads/tools/cmake-3.27.1-linux/cmake-3.27.1-linux-x86_64/bin/cmake \
  -B build-wasm -S . -G Ninja \
  -DCMAKE_TOOLCHAIN_FILE=~/dev/qgis-js/vcpkg/scripts/buildsystems/vcpkg.cmake \
  -DVCPKG_TARGET_TRIPLET=wasm32-emscripten-qt-threads \
  -DVCPKG_OVERLAY_TRIPLETS=./vcpkg-triplets \
  -DVCPKG_OVERLAY_PORTS=./vcpkg-ports \
  -DVCPKG_CHAINLOAD_TOOLCHAIN_FILE=$PWD/vcpkg-triplets/toolchain.cmake \
  -DCMAKE_BUILD_TYPE=
