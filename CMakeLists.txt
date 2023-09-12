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
  set(qgis_debug_prefix "debug/")    # debug lib is in different folder
endif()

find_library(
  QGIS_LIBRARY
  NAMES qgis_core
  PATHS "${_VCPKG_INSTALLED_DIR}/${VCPKG_TARGET_TRIPLET}/${qgis_debug_prefix}lib"
  PATH_SUFFIXES qgis
  NO_DEFAULT_PATH
)


set(QGISJS_SOURCES
  src/qgis-js.cpp
  src/api/QgisApi.cpp
  src/api/QgisModel.cpp
)

# this creates also .html + qtloader.js + adds various flags to the build
qt_add_executable(qgis-js MANUAL_FINALIZATION ${QGISJS_SOURCES})


target_compile_options(qgis-js PRIVATE "-fwasm-exceptions")
set_target_properties(qgis-js PROPERTIES LINK_FLAGS "-fwasm-exceptions")

set_target_properties(qgis-js PROPERTIES LINK_FLAGS "--bind")
set_target_properties(qgis-js PROPERTIES LINK_FLAGS "--preload-file ${_VCPKG_INSTALLED_DIR}/${VCPKG_TARGET_TRIPLET}/share/proj@/proj --preload-file ${CMAKE_SOURCE_DIR}/resources/srs.db@/qgis/resources/srs.db")
# FIXME we rely on the deprecated EXTRA_EXPORTED_RUNTIME_METHODS because EXPORTED_RUNTIME_METHODS is set by qt
target_link_options(qgis-js PRIVATE "SHELL:-s EXTRA_EXPORTED_RUNTIME_METHODS=[FS,registeredTypes] -s FORCE_FILESYSTEM=1 -s EXPORT_ES6")


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
    Qt6::Widgets    # because QgsApplication -> QApplication
)

set(QGIS_PROVIDERS_LIST
    provider_arcgisfeatureserver
    provider_arcgismapserver
    provider_delimitedtext
    provider_wcs
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
