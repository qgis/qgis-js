cmake_minimum_required(VERSION 3.15)

project(test_vcpkg CXX)


set(CMAKE_CXX_STANDARD 17)

message(STATUS "COMPILER!!! ${CMAKE_CXX_COMPILER}")

find_package(unofficial-sqlite3 CONFIG REQUIRED)
find_package(PROJ CONFIG REQUIRED)
find_package(GEOS CONFIG REQUIRED)
find_package(GDAL CONFIG REQUIRED)
find_package(expat CONFIG REQUIRED)
#find_package(libspatialindex CONFIG REQUIRED)
find_package(libzip CONFIG REQUIRED)
find_package(exiv2 CONFIG REQUIRED)

#find_package(EGL CONFIG REQUIRED)

#set(CMAKE_FIND_DEBUG_MODE TRUE)
find_package(Qt6 REQUIRED COMPONENTS Core Gui)
#set(CMAKE_FIND_DEBUG_MODE FALSE)

# TODO: we would need to patch QtKeychainConfig.cmake.in to remove DBus requirement
#find_package(Qt6Keychain CONFIG REQUIRED)

#if (EMSCRIPTEN)
#  set(CMAKE_EXECUTABLE_SUFFIX ".html")
#endif ()

#add_executable(test_vcpkg main.cpp)
qt_add_executable(test_vcpkg MANUAL_FINALIZATION main.cpp)


target_link_libraries(test_vcpkg PRIVATE PROJ::proj)
target_link_libraries(test_vcpkg PRIVATE unofficial::sqlite3::sqlite3)
target_link_libraries(test_vcpkg PRIVATE GEOS::geos_c)
target_link_libraries(test_vcpkg PRIVATE GDAL::GDAL)
target_link_libraries(test_vcpkg PRIVATE expat::expat)
# libspatialindex has no cmake support (find_package) so we do it like this
target_link_libraries(test_vcpkg PRIVATE /home/martin/qgis/wasm/test_vcpkg/build-wasm/vcpkg_installed/wasm32-emscripten-qt-threads/lib/libspatialindex_c.a)
target_link_libraries(test_vcpkg PRIVATE libzip::zip)
target_link_libraries(test_vcpkg PRIVATE exiv2lib)
target_link_libraries(test_vcpkg PRIVATE /home/martin/qgis/wasm/test_vcpkg/build-wasm/vcpkg_installed/wasm32-emscripten-qt-threads/lib/libqt6keychain.a)
target_link_libraries(test_vcpkg PRIVATE /home/martin/qgis/wasm/test_vcpkg/build-wasm/vcpkg_installed/wasm32-emscripten-qt-threads/lib/libqca.a)
#target_link_libraries(test_vcpkg PRIVATE Qt6Keychain::Qt6Keychain)


qt_finalize_executable(test_vcpkg)
