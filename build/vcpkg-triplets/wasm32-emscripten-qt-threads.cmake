message(STATUS "Using 'wasm32-emscripten-qt-threads' triplet")

set(VCPKG_TARGET_ARCHITECTURE wasm32)
set(VCPKG_CRT_LINKAGE dynamic)
set(VCPKG_LIBRARY_LINKAGE static)
set(VCPKG_CMAKE_SYSTEM_NAME Emscripten)

# to avoid building both debug and release of all libs
set(VCPKG_BUILD_TYPE "release")

set(VCPKG_ENV_PASSTHROUGH_UNTRACKED EMSDK EMSCRIPTEN EMSCRIPTEN_ROOT PATH)

# this needs to be present for vcpkg installs, but also the same VCPKG_CHAINLOAD_TOOLCHAIN_FILE
# needs to be present when running CMake so that the project gets it
get_filename_component(QGISJS_TOOLCHAIN_FILE
   "${CMAKE_CURRENT_LIST_DIR}/../vcpkg-toolchains/qgis-js.cmake"
   ABSOLUTE)
set(VCPKG_CHAINLOAD_TOOLCHAIN_FILE ${QGISJS_TOOLCHAIN_FILE})

set(VCPKG_ENV_PASSTHROUGH_UNTRACKED EMSDK EMSCRIPTEN EMSCRIPTEN_ROOT PATH)

# set(VCPKG_ENV_PASSTHROUGH Qt6_DIR) # needed by port/qt6/vcpkg-cmake-wrapper.cmake
# set(VCPKG_ENV_PASSTHROUGH QT_HOST_PATH) # needed by port/qt6/vcpkg-cmake-wrapper.cmake
# set(QT_HOST_PATH $ENV{QT_HOST_PATH} CACHE PATH "needed by QtPublicDependencyHelpers.cmake" FORCE)
