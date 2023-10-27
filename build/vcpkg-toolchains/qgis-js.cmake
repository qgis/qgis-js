
message(STATUS "Using 'qgis-js' toolchain")

# use/derrive EMSDK and EMSCRIPTEN_ROOT to locate EMSCRIPTEN_TOOLCHAIN_FILE
if(NOT DEFINED ENV{EMSDK})
  get_filename_component(QGIS_JS_EMSDK
  "${CMAKE_CURRENT_LIST_DIR}/../emsdk"
  ABSOLUTE)
  set(ENV{EMSDK} ${QGIS_JS_EMSDK})
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
set(EMSCRIPTEN_TOOLCHAIN_FILE ${EMSCRIPTEN_ROOT}/cmake/Modules/Platform/Emscripten.cmake)
if(NOT EXISTS ${EMSCRIPTEN_TOOLCHAIN_FILE})
   message(FATAL_ERROR "Emscripten.cmake toolchain file not found")
endif()

# setup vcpkg chainload toolchain file
if(EXISTS "$ENV{Qt6_DIR}/lib/cmake/Qt6/qt.toolchain.cmake")
  # during "compile" the qt.toolchain.cmake is used, and the EMSCRIPTEN_TOOLCHAIN_FILE is chainloaded by it
  set(QT_CHAINLOAD_TOOLCHAIN_FILE ${EMSCRIPTEN_TOOLCHAIN_FILE})
  include("$ENV{Qt6_DIR}/lib/cmake/Qt6/qt.toolchain.cmake")

  message(STATUS "CMake toolchains: vcpkg.cmake -> qgis-js.cmake -> qt.toolchain.cmake -> Emscripten.cmake")
else()
  # during "install" Qt6_DIR has not to be set, EMSCRIPTEN_TOOLCHAIN_FILE will used directly by vcpkg
  set(VCPKG_CHAINLOAD_TOOLCHAIN_FILE ${EMSCRIPTEN_TOOLCHAIN_FILE})

  message(STATUS "CMake toolchains: vcpkg.cmake -> qgis-js.cmake -> Emscripten.cmake")
endif()

# flags that have to be set across all ports and qgis-js itself
set(QGIS_JS_FLAGS "-pthread -fwasm-exceptions")

set(CMAKE_C_FLAGS_INIT   "${CMAKE_C_FLAGS_INIT} ${QGIS_JS_FLAGS}")
set(CMAKE_CXX_FLAGS_INIT "${CMAKE_CXX_FLAGS_INIT} ${QGIS_JS_FLAGS}")
