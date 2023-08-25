set(QGIS_REF final-3_32_1)
set(QGIS_SHA512 37a8f92739e0ed1df1e8bc1b81b513d275b25d6afeb5d612c3e4cd51123deee29406b3347b863d06d1f6055fac0dd3e032d81ddda19f21e845ddb113c0724974)

vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO qgis/QGIS
    REF ${QGIS_REF}
    SHA512 ${QGIS_SHA512}
    PATCHES
        gdal.patch
        keychain.patch
        exiv2.patch
        crssync.patch
        bigobj.patch
        # wasm-specific
        qt6positioning.patch
        no-tcp-udp-sensors.patch
        exiv2-0.28.patch
        #01-fix-qgswkbptr_h.patch
        02-exclude-wfs-provider.patch
        03-fix-missing-QTimeZone.patch
        04-fix-missing-QCryptographicHash.patch
        05-fix-QT_NO_SSL.patch
        06-GDAL-no-QThread-sleep.patch
        07-fix-QgsArcGisRestQueryUtils-includes.patch
        08-skip-QgsExpression-initFunctionHelp.patch
        09-empty-QgsExpression-Functions.patch
        10-exclude-qgscoordinatereferencesystem_legacy.patch
        11-disable-openedFileLimit.patch
)

file(REMOVE ${SOURCE_PATH}/cmake/FindQtKeychain.cmake)
file(REMOVE ${SOURCE_PATH}/cmake/FindGDAL.cmake)
file(REMOVE ${SOURCE_PATH}/cmake/FindGEOS.cmake)
file(REMOVE ${SOURCE_PATH}/cmake/FindEXIV2.cmake)
file(REMOVE ${SOURCE_PATH}/cmake/FindExpat.cmake)
file(REMOVE ${SOURCE_PATH}/cmake/FindIconv.cmake)

vcpkg_find_acquire_program(FLEX)
vcpkg_find_acquire_program(BISON)
vcpkg_find_acquire_program(PYTHON3)
get_filename_component(PYTHON3_PATH ${PYTHON3} DIRECTORY)
vcpkg_add_to_path(${PYTHON3_PATH})
vcpkg_add_to_path(${PYTHON3_PATH}/Scripts)
set(PYTHON_EXECUTABLE ${PYTHON3})

list(APPEND QGIS_OPTIONS -DFORCE_STATIC_LIBS:BOOL=ON)
list(APPEND QGIS_OPTIONS -DBUILD_WITH_QT6:BOOL=ON)

list(APPEND QGIS_OPTIONS -DENABLE_TESTS:BOOL=OFF)
list(APPEND QGIS_OPTIONS -DWITH_QTWEBKIT:BOOL=OFF)
list(APPEND QGIS_OPTIONS -DWITH_GRASS7:BOOL=OFF)
#list(APPEND QGIS_OPTIONS -DWITH_QSPATIALITE:BOOL=OFF)
list(APPEND QGIS_OPTIONS -DUSE_OPENCL:BOOL=OFF)
list(APPEND QGIS_OPTIONS -DWITH_BINDINGS:BOOL=OFF)
list(APPEND QGIS_OPTIONS -DWITH_GUI:BOOL=OFF)
list(APPEND QGIS_OPTIONS -DWITH_DESKTOP:BOOL=OFF)
list(APPEND QGIS_OPTIONS -DWITH_CUSTOM_WIDGETS:BOOL=OFF)
#list(APPEND QGIS_OPTIONS -DWITH_SERVER_PLUGINS:BOOL=OFF)
list(APPEND QGIS_OPTIONS -DWITH_SERVER:BOOL=OFF)
list(APPEND QGIS_OPTIONS -DWITH_QGIS_PROCESS:BOOL=OFF)
list(APPEND QGIS_OPTIONS -DWITH_PDAL:BOOL=OFF)
list(APPEND QGIS_OPTIONS -DWITH_EPT:BOOL=OFF)
list(APPEND QGIS_OPTIONS -DWITH_3D:BOOL=OFF)
list(APPEND QGIS_OPTIONS -DWITH_COPC=OFF)
list(APPEND QGIS_OPTIONS -DWITH_ANALYSIS=OFF)
#list(APPEND QGIS_OPTIONS -DWITH_GRASS=OFF)
#list(APPEND QGIS_OPTIONS -DWITH_GEOREFERENCER:BOOL=OFF)
#list(APPEND QGIS_OPTIONS -DWITH_QTMOBILITY:BOOL=OFF)
list(APPEND QGIS_OPTIONS -DENABLE_TESTS=OFF)
#list(APPEND QGIS_OPTIONS -DWITH_QWTPOLAR=OFF)
list(APPEND QGIS_OPTIONS -DWITH_GUI=OFF)
list(APPEND QGIS_OPTIONS -DWITH_APIDOC=OFF)
list(APPEND QGIS_OPTIONS -DWITH_ASTYLE=OFF)
#list(APPEND QGIS_OPTIONS -DWITH_QT5SERIALPORT=OFF)
list(APPEND QGIS_OPTIONS -DWITH_QUICK:BOOL=OFF)
list(APPEND QGIS_OPTIONS -DQGIS_MACAPP_FRAMEWORK=FALSE)
list(APPEND QGIS_OPTIONS -DWITH_QTSERIALPORT=FALSE)

# WASM
list(APPEND QGIS_OPTIONS -DWITH_POSTGRESQL:BOOL=FALSE)
list(APPEND QGIS_OPTIONS -DWITH_SPATIALITE:BOOL=FALSE)
list(APPEND QGIS_OPTIONS -DWITH_AUTH:BOOL=FALSE)


# QGIS likes to install auth and providers to different locations on each platform
# let's keep things clean and tidy and put them at a predictable location
list(APPEND QGIS_OPTIONS -DQGIS_PLUGIN_SUBDIR=lib)

# By default QGIS installs includes into "include" on Windows and into "include/qgis" everywhere else
# let's keep things clean and tidy and put them at a predictable location
list(APPEND QGIS_OPTIONS -DQGIS_INCLUDE_SUBDIR=include/qgis)

list(APPEND QGIS_OPTIONS -DWITH_INTERNAL_POLY2TRI=ON)
    
vcpkg_configure_cmake(
    SOURCE_PATH ${SOURCE_PATH}
    #PREFER_NINJA
    OPTIONS ${QGIS_OPTIONS} 
    OPTIONS_DEBUG ${QGIS_OPTIONS_DEBUG}
    OPTIONS_RELEASE ${QGIS_OPTIONS_RELEASE}
)

vcpkg_install_cmake()


file(GLOB QGIS_CMAKE_PATH ${CURRENT_PACKAGES_DIR}/*.cmake)
if(QGIS_CMAKE_PATH)
    file(COPY ${QGIS_CMAKE_PATH} DESTINATION ${CURRENT_PACKAGES_DIR}/share/cmake/${PORT})
    file(REMOVE_RECURSE ${QGIS_CMAKE_PATH})
endif()

file(GLOB QGIS_CMAKE_PATH_DEBUG ${CURRENT_PACKAGES_DIR}/debug/*.cmake)
if( QGIS_CMAKE_PATH_DEBUG )
    file(REMOVE_RECURSE ${QGIS_CMAKE_PATH_DEBUG})
endif()

file(REMOVE_RECURSE
    ${CURRENT_PACKAGES_DIR}/debug/include
)
file(REMOVE_RECURSE # Added for debug porpose
    ${CURRENT_PACKAGES_DIR}/debug/share
)

# Handle copyright
file(INSTALL ${SOURCE_PATH}/COPYING DESTINATION ${CURRENT_PACKAGES_DIR}/share/${PORT} RENAME copyright)
