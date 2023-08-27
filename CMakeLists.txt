cmake_minimum_required(VERSION 3.15)

project(test_vcpkg CXX)


set(CMAKE_CXX_STANDARD 17)

message(STATUS "COMPILER!!! ${CMAKE_CXX_COMPILER}")

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

find_package(Qt6Keychain CONFIG REQUIRED)

#if (EMSCRIPTEN)
#  set(CMAKE_EXECUTABLE_SUFFIX ".html")
#endif ()

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


#add_executable(test_vcpkg main.cpp)
qt_add_executable(test_vcpkg MANUAL_FINALIZATION main.cpp)

#set_target_properties(test_vcpkg PROPERTIES LINK_FLAGS "-sSAFE_HEAP=1 -sASSERTIONS=1")

target_include_directories(test_vcpkg PRIVATE ${QGIS_INCLUDE_DIR})
target_link_libraries(test_vcpkg PRIVATE ${QGIS_LIBRARY})

target_link_libraries(test_vcpkg PRIVATE
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
  target_link_libraries(test_vcpkg PRIVATE ${QGIS_${provider}_LIBRARY}
  )
endforeach ()


target_link_libraries(test_vcpkg PRIVATE PROJ::proj)
target_link_libraries(test_vcpkg PRIVATE unofficial::sqlite3::sqlite3)
target_link_libraries(test_vcpkg PRIVATE GEOS::geos_c)
target_link_libraries(test_vcpkg PRIVATE GDAL::GDAL)
target_link_libraries(test_vcpkg PRIVATE expat::expat)
target_link_libraries(test_vcpkg PRIVATE protobuf::libprotobuf-lite)
target_link_libraries(test_vcpkg PRIVATE ${SPATIALINDEX_LIBRARY})
target_link_libraries(test_vcpkg PRIVATE libzip::zip)
target_link_libraries(test_vcpkg PRIVATE Qt6Keychain::Qt6Keychain)
target_link_libraries(test_vcpkg PRIVATE /home/martin/qgis/wasm/test_vcpkg/build-wasm/vcpkg_installed/wasm32-emscripten-qt-threads/lib/libqca.a)


qt_finalize_executable(test_vcpkg)
