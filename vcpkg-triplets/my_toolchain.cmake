
message(STATUS "MY TOOLCHAIN FILE!")


#include("${EMSCRIPTEN_ROOT}/cmake/Modules/Platform/Emscripten.cmake")
#include("/home/boardend/dev/qgis-js/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake")

set(QT_CHAINLOAD_TOOLCHAIN_FILE "/home/boardend/dev/qgis-js/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake")
include("/home/boardend/Qt/6.5.2/wasm_multithread/lib/cmake/Qt6/qt.toolchain.cmake")

# https://github.com/retifrav/vcpkg-registry/blob/master/triplets/decovar-wasm32-emscripten-pthreads.cmake

set(CMAKE_C_FLAGS_INIT   "${CMAKE_C_FLAGS_INIT}   -pthread")
set(CMAKE_CXX_FLAGS_INIT "${CMAKE_CXX_FLAGS_INIT} -pthread")

# to figure out exceptions thrown
set(CMAKE_C_FLAGS_INIT   "${CMAKE_C_FLAGS_INIT}   -fwasm-exceptions")
set(CMAKE_CXX_FLAGS_INIT "${CMAKE_CXX_FLAGS_INIT} -fwasm-exceptions")
