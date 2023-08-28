set(VCPKG_ENV_PASSTHROUGH_UNTRACKED EMSCRIPTEN_ROOT EMSDK PATH)

if(NOT DEFINED ENV{EMSCRIPTEN_ROOT})
   find_path(EMSCRIPTEN_ROOT "emcc")
else()
   set(EMSCRIPTEN_ROOT "$ENV{EMSCRIPTEN_ROOT}")
endif()

if(NOT EMSCRIPTEN_ROOT)
   if(NOT DEFINED ENV{EMSDK})
      message(FATAL_ERROR "The emcc compiler not found in PATH")
   endif()
   set(EMSCRIPTEN_ROOT "$ENV{EMSDK}/upstream/emscripten")
endif()

if(NOT EXISTS "${EMSCRIPTEN_ROOT}/cmake/Modules/Platform/Emscripten.cmake")
   message(FATAL_ERROR "Emscripten.cmake toolchain file not found")
endif()

set(VCPKG_TARGET_ARCHITECTURE wasm32)
set(VCPKG_CRT_LINKAGE dynamic)
set(VCPKG_LIBRARY_LINKAGE static)
set(VCPKG_CMAKE_SYSTEM_NAME Emscripten)


message(STATUS "MY TRIPLET!")

# this needs to be present for vcpkg installs, but also the same VCPKG_CHAINLOAD_TOOLCHAIN_FILE
# needs to be present when running CMake so that the project gets it
set(VCPKG_CHAINLOAD_TOOLCHAIN_FILE "/home/martin/qgis/wasm/test_vcpkg/vcpkg-triplets/my_toolchain.cmake")

# to avoid building both debug and release of all libs
#set(VCPKG_BUILD_TYPE "release")

# --------------

# otherwise these environment variables won't be available in the chainloaded toolchain
set(VCPKG_ENV_PASSTHROUGH_UNTRACKED EMSDK EMSCRIPTEN PATH)

set(VCPKG_ENV_PASSTHROUGH Qt6_DIR) # needed by port/qt6/vcpkg-cmake-wrapper.cmake
set(VCPKG_ENV_PASSTHROUGH QT_HOST_PATH) # needed by port/qt6/vcpkg-cmake-wrapper.cmake
set(QT_HOST_PATH $ENV{QT_HOST_PATH} CACHE PATH "needed by QtPublicDependencyHelpers.cmake" FORCE) 

#  does not work with chainload toolchain!
#set(VCPKG_CXX_FLAGS "-pthread")
#set(VCPKG_C_FLAGS "-pthread")
#set(VCPKG_LINKER_FLAGS "-pthread")
