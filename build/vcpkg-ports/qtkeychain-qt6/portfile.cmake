message(WARNING "qtkeychain is a third-party extension to Qt and is not affiliated with The Qt Company")

vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO frankosterfeld/qtkeychain
    REF v0.14.0
    SHA512 65118198d82f284c1bb914964657e62fccb81050359071b44530574c73c673913d22b5de17cc30e9099feca06ece556bb9329350f017ce331e845ba074d1f078
    HEAD_REF master
    PATCHES
      dbus-fix.patch
      dbus-fix-config.patch
)

# Opportunity to build without dependency on qt5-tools/qt5-declarative
set(BUILD_TRANSLATIONS OFF)
if("translations" IN_LIST FEATURES)
    set(BUILD_TRANSLATIONS ON)
endif()

vcpkg_cmake_configure(
    DISABLE_PARALLEL_CONFIGURE
    SOURCE_PATH ${SOURCE_PATH}
    OPTIONS
        -DBUILD_WITH_QT6=ON
        -DBUILD_TEST_APPLICATION=OFF
        -DBUILD_TRANSLATIONS=${BUILD_TRANSLATIONS}
        -DBUILD_TOOLS=OFF
        -DWITH_nss_PLUGIN=OFF
        -DWITH_pkcs11_PLUGIN=OFF
)

vcpkg_cmake_install()
vcpkg_copy_pdbs()
vcpkg_cmake_config_fixup(CONFIG_PATH lib/cmake/Qt6Keychain PACKAGE_NAME Qt6Keychain)

# Remove unneeded dirs
file(REMOVE_RECURSE
    "${CURRENT_PACKAGES_DIR}/debug/include"
    "${CURRENT_PACKAGES_DIR}/debug/share"
)

# Handle copyright
file(INSTALL "${SOURCE_PATH}/COPYING" DESTINATION "${CURRENT_PACKAGES_DIR}/share/${PORT}" RENAME copyright)
