cmake_minimum_required(VERSION 3.15)

project(qgis-js CXX)

set(CMAKE_CXX_STANDARD 17)

find_package(unofficial-sqlite3 CONFIG REQUIRED)
find_package(PROJ CONFIG REQUIRED)
find_package(GEOS CONFIG REQUIRED)
find_package(GDAL CONFIG REQUIRED)
find_package(expat CONFIG REQUIRED)
find_package(libzip CONFIG REQUIRED)
find_package(exiv2 CONFIG REQUIRED)
find_package(Protobuf CONFIG REQUIRED)

find_package(Qt6 REQUIRED COMPONENTS Core Gui Xml Network Concurrent Core5Compat PrintSupport Widgets)

find_library(SPATIALINDEX_LIBRARY spatialindex PATHS ${VCPKG_INSTALLED_DIR}/${VCPKG_TARGET_TRIPLET}/lib NO_DEFAULT_PATH REQUIRED)

find_package(Qca CONFIG REQUIRED)
find_package(Qt6Keychain CONFIG REQUIRED)

find_path(QGIS_INCLUDE_DIR
  NAMES qgis.h
  PATHS "${_VCPKG_INSTALLED_DIR}/${VCPKG_TARGET_TRIPLET}/include"
  PATH_SUFFIXES qgis
  NO_DEFAULT_PATH
)

if (CMAKE_BUILD_TYPE STREQUAL "Debug")
  set(qgis_debug_prefix "debug/") # debug lib is in different folder
endif()

find_library(
 QGIS_LIBRARY
 NAMES qgis_core
 PATHS "${_VCPKG_INSTALLED_DIR}/${VCPKG_TARGET_TRIPLET}/${qgis_debug_prefix}lib"
 PATH_SUFFIXES qgis
 NO_DEFAULT_PATH
)

# because on the initial build the Qt toolchain file is not yet generated and therefore not included by qgis-js.cmake
# this will ensure that the Qt toolchain file is included after qtbase is built
if(EXISTS ${QT_TOOLCHAIN_FILE})
  set(QT_CHAINLOAD_TOOLCHAIN_FILE ${EMSCRIPTEN_TOOLCHAIN_FILE})
  include(${QT_TOOLCHAIN_FILE})
else()
  message(FATAL_ERROR "Could not find Qt toolchain file: ${QT_TOOLCHAIN_FILE}")
endif()

# since Qt 6.3 qt_standard_project_setup should be used so set some default values
qt_standard_project_setup()

set(QGISJS_SOURCES
 src/qgis-js.cpp
 src/api/QgisApi.cpp
)

# this creates also .html + qtloader.js + adds various flags to the build
qt_add_executable(qgis-js MANUAL_FINALIZATION ${QGISJS_SOURCES})


target_compile_options(qgis-js PRIVATE "-fwasm-exceptions")
set_target_properties(qgis-js PROPERTIES LINK_FLAGS "-fwasm-exceptions")

target_compile_options(qgis-js PRIVATE "-msimd128")
set_target_properties(qgis-js PROPERTIES LINK_FLAGS "-msimd128")

target_include_directories(qgis-js PRIVATE ${QGIS_INCLUDE_DIR})
target_link_libraries(qgis-js PRIVATE ${QGIS_LIBRARY})

target_link_libraries(qgis-js PRIVATE
  Qt6::Xml
  Qt6::Concurrent
  Qt6::Network
  Qt6::Core
  Qt6::Gui
  Qt6::Core5Compat
  Qt6::PrintSupport
  Qt6::Widgets # because QgsApplication -> QApplication
  )

set(QGIS_PROVIDERS_LIST
  provider_arcgisfeatureserver
  provider_arcgismapserver
  provider_delimitedtext
  provider_wms
)

foreach (provider ${QGIS_PROVIDERS_LIST})
 find_library(
  QGIS_${provider}_LIBRARY
  NAMES ${provider}_a
  PATHS "${_VCPKG_INSTALLED_DIR}/${VCPKG_TARGET_TRIPLET}/lib"
  PATH_SUFFIXES qgis
  NO_DEFAULT_PATH
 )
 target_link_libraries(qgis-js PRIVATE ${QGIS_${provider}_LIBRARY}
 )
endforeach ()

target_link_libraries(qgis-js PRIVATE PROJ::proj)
target_link_libraries(qgis-js PRIVATE unofficial::sqlite3::sqlite3)
target_link_libraries(qgis-js PRIVATE GEOS::geos_c)
target_link_libraries(qgis-js PRIVATE GDAL::GDAL)
target_link_libraries(qgis-js PRIVATE expat::expat)
target_link_libraries(qgis-js PRIVATE protobuf::libprotobuf-lite)
target_link_libraries(qgis-js PRIVATE ${SPATIALINDEX_LIBRARY})
target_link_libraries(qgis-js PRIVATE libzip::zip)
target_link_libraries(qgis-js PRIVATE Qt6Keychain::Qt6Keychain)
target_link_libraries(qgis-js PRIVATE qca)

qt_finalize_executable(qgis-js)

#
# emcc settings (see https://emsettings.surma.technology/)
#
# NOTE: We set our flags after qt_finalize_executable in order to override the flags set by Qt
#
# Flags set by Qt:
# -s PTHREAD_POOL_SIZE=4
# -s INITIAL_MEMORY=50MB 
# -s EXPORTED_RUNTIME_METHODS=UTF16ToString,stringToUTF16,JSEvents,specialHTMLTargets,FS
# -s MAX_WEBGL_VERSION=2
# -s FETCH=1 
# -s WASM_BIGINT=1
# -s STACK_SIZE=5MB
# -s MODULARIZE=1
# -s EXPORT_NAME=createQtAppInstance
# -s ALLOW_MEMORY_GROWTH
#- s ASYNCIFY_IMPORTS=qt_asyncify_suspend_js,qt_asyncify_resume_js
# -s ERROR_ON_UNDEFINED_SYMBOLS=1

# Emscripten Runtime
target_link_options(qgis-js PRIVATE "SHELL: \
-s EXPORT_ES6"
)

# FS (see https://emscripten.org/docs/api_reference/Filesystem-API.html)
target_link_options(qgis-js PRIVATE "SHELL: \
-s FORCE_FILESYSTEM=1"
)

# Threading (see https://emscripten.org/docs/porting/pthreads.html)
set(MINIMAL_THREAD_POOL_SIZE "4")
set(MAXIMAL_THREAD_POOL_SIZE "16")
target_link_options(qgis-js PRIVATE "SHELL: \
-s PTHREAD_POOL_SIZE=\"Math.min(Math.max(((navigator&&navigator.hardwareConcurrency)||${MINIMAL_THREAD_POOL_SIZE}),${MINIMAL_THREAD_POOL_SIZE}),${MAXIMAL_THREAD_POOL_SIZE})\" \
-s PTHREAD_POOL_SIZE_STRICT=2 \
-s PTHREAD_POOL_DELAY_LOAD=1 \
-s MALLOC=mimalloc"
)

target_link_options(qgis-js PRIVATE "SHELL: \
--preload-file ${_VCPKG_INSTALLED_DIR}/${VCPKG_TARGET_TRIPLET}/share/proj@/proj \
--preload-file ${_VCPKG_INSTALLED_DIR}/${VCPKG_TARGET_TRIPLET}/share/qgis/resources/srs.db@/qgis/resources/srs.db"
)

# DWARF debug info (see https://developer.chrome.com/blog/faster-wasm-debugging/)
if (CMAKE_BUILD_TYPE STREQUAL "Debug")
  set_target_properties(qgis-js PROPERTIES LINK_FLAGS "-gseparate-dwarf \
-gdwarf-5 \
-gsplit-dwarf \
-gpubnames")
endif()

# TODO remove this fix (see https://github.com/emscripten-core/emscripten/issues/21844)
target_link_options(qgis-js PRIVATE "SHELL: \
-s EXPORTED_FUNCTIONS=_main,__emscripten_thread_crashed,__embind_initialize_bindings"
)
