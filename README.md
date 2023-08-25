
# qgis-js

Work in progress!

- vcpkg
- Qt 6.5.2 wasm multi-threaded - TODO: need to patch FindEGL.cmake to find EGL correctly
- emsdk 3.1.29



```
emsdk install + activate >= 3.1.29

source "/home/martin/wasm/emsdk/emsdk_env.sh"
  
QT_HOST_PATH=/home/martin/Qt/6.5.2/gcc_64 \
Qt6_DIR=/home/martin/Qt/6.5.2/wasm_multithread \
VCPKG_BINARY_SOURCES=clear \
/home/martin/inst/vcpkg/downloads/tools/cmake-3.27.1-linux/cmake-3.27.1-linux-x86_64/bin/cmake \
  -B build-wasm -S . -G Ninja \
  -DCMAKE_TOOLCHAIN_FILE=/home/martin/inst/vcpkg/scripts/buildsystems/vcpkg.cmake \
  -DVCPKG_TARGET_TRIPLET=wasm32-emscripten-qt-threads \
  -DVCPKG_OVERLAY_TRIPLETS=./vcpkg-triplets \
  -DVCPKG_OVERLAY_PORTS=./vcpkg-ports \
  -DVCPKG_CHAINLOAD_TOOLCHAIN_FILE=/home/martin/qgis/wasm/test_vcpkg/vcpkg-triplets/my_toolchain.cmake


cmake --build build-wasm

cd build-wasm && ~/inst/emsdk/upstream/emscripten/emrun test_vcpkg.html
```
