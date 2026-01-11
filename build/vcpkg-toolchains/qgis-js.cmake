
message(STATUS "Using 'qgis-js' toolchain")

# Setup EMSDK/EMSCRIPTEN_ROOT
if(NOT DEFINED ENV{EMSDK})
  get_filename_component(QGIS_JS_BUILD_EMSDK "${CMAKE_CURRENT_LIST_DIR}/../emsdk" ABSOLUTE)
  set(ENV{EMSDK} ${QGIS_JS_BUILD_EMSDK})
endif()
if(NOT EMSCRIPTEN_ROOT)
   if(NOT DEFINED ENV{EMSDK})
      message(FATAL_ERROR "emsdk not found")
   endif()
   set(EMSCRIPTEN_ROOT "$ENV{EMSDK}/upstream/emscripten")
endif()
if(NOT DEFINED ENV{EMSCRIPTEN_ROOT})
  set(ENV{EMSCRIPTEN_ROOT} ${EMSCRIPTEN_ROOT})
endif()

# Set EMSCRIPTEN_TOOLCHAIN_FILE for use by CMakeLists.txt
set(EMSCRIPTEN_TOOLCHAIN_FILE "${EMSCRIPTEN_ROOT}/cmake/Modules/Platform/Emscripten.cmake")

# Include Emscripten toolchain directly
include("${EMSCRIPTEN_TOOLCHAIN_FILE}")

# Set QT_TOOLCHAIN_FILE path for CMakeLists.txt to include
if(CMAKE_TOOLCHAIN_FILE)
  get_filename_component(VCPKG_ROOT_DIR ${CMAKE_TOOLCHAIN_FILE} DIRECTORY)
  get_filename_component(VCPKG_ROOT_DIR ${VCPKG_ROOT_DIR} DIRECTORY)
  get_filename_component(VCPKG_PACKAGES_PATH "${VCPKG_ROOT_DIR}/../packages" ABSOLUTE)
  set(QT_TOOLCHAIN_FILE "${VCPKG_PACKAGES_PATH}/qtbase_${VCPKG_TARGET_TRIPLET}/share/Qt6/qt.toolchain.cmake")
endif()

# Flags for all ports and qgis-js
# TODO reenable -msimd128
set(QGIS_JS_FLAGS "-pthread -fwasm-exceptions -sSUPPORT_LONGJMP=wasm")
set(CMAKE_C_FLAGS_INIT   "${CMAKE_C_FLAGS_INIT} ${QGIS_JS_FLAGS}")
set(CMAKE_CXX_FLAGS_INIT "${CMAKE_CXX_FLAGS_INIT} ${QGIS_JS_FLAGS}")
