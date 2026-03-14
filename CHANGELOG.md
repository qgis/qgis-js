This document describes changes between tagged qgis-js versions

4.1.0 (in development)
----------------------
- TBD

4.0.0 (16. March 2026)
----------------------
- Major version bump to align with QGIS 4 (based on QGIS 4.0.0). (#39)
  - Upstreamed patches to the QGIS repository for long-term maintainability.
  - Made possible by the QGIS.org grant programme 2025.
  - Special thanks to Matthias for the substantial contributions.
- Dependency updates:
  - Updated Qt to 6.10.1
  - Updated emsdk to 5.0.2
  - Updated Node to 22.16.0
  - Updated Vite to 8.0.0
  - Updated OpenLayers ("ol") to 10.8.0
- Refactored `Rectangle` and `PointXY` types to `QgsRectangle` and `QgsPointXY`
  across the codebase. This is a breaking API change. (#53)
- Added API to get/set global and project variables.
- Switched from pinned vcpkg to git submodule (based on QGIS).
