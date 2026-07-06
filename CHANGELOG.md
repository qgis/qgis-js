This document describes changes between tagged qgis-js versions

## 4.2.0 (6. July 2026)

- Update to QGIS 4.2.0
- Replaced `mapLayers()` with `layerTreeRoot()`. (#25)
  - Exposing the full layer tree hierarchy (groups, nested layers, visibility, expand/collapse).
  - Use `layerTreeRoot().findLayers()` as a migration path for flat layer access.
- Added `QgsMapLayer` and `QgsVectorLayer` wrappers with `name`, `opacity`, `id()`, `type()`, and `subsetString()`. (#59)
- Added layer legend support. (#59)
  - `QgsLayerTreeLayer.legendNodes()` returns individual legend entries with `label()` and `symbolImage()`.
  - `renderLegend()` renders the full project legend as a high-DPI PNG (base64 data URL).
  - `QgsLayerTreeGroup.renderLegend()` and `QgsLayerTreeLayer.renderLegend()` for subtree/single-layer legends.
- Added optional `layerIds` parameter to all render functions (`renderImage`, `renderXYZTile`, `renderJob`, `fullExtent`, `renderLegend`). (#59)
  - Enables rendering subsets of layers and composing multiple OL layers from different QGIS layer groups.
  - All three OL data sources (`QgisCanvasDataSource`, `QgisXYZDataSource`, `QgisJobDataSource`) accept `layerIds` in options.
- Added `loadLayerDefinition()` to load .qlr files at runtime into the project layer tree. (#59)
- Added feature inspection API faithful to the QGIS C++ API.
  - `QgsFeature` with `id()`, `isValid()`, `hasGeometry()`, `geometry()`, `fields()`, `attributes()`, `attribute(name|index)`, `attributeCount()`.
  - `QgsGeometry` with `isNull()`, `isEmpty()`, `wkbType()`, `asWkb()` (owned `Uint8Array`), `asWkt(precision)`, `asJson(precision)`.
  - `QgsFields` / `QgsField` for layer schema introspection.
  - `QgsFeatureIterator` with `nextFeature()` (returns the feature or `null`), `rewind()`, `close()`, `isClosed()`, `isValid()` for lazy iteration over large layers.
  - `QgsFeatureRequest` with `setFilterRect`, `setFilterExpression`, `setFilterFid(s)`, `setLimit`, `setFlags`, `setSubsetOfAttributes`, `setDestinationCrs` — and a `FeatureRequestFlag` enum mirroring `Qgis::FeatureRequestFlag`.
  - `QgsVectorLayer` extended with `featureCount()`, `fields()`, `getFeatures(request?)`.
  - `QgsMapLayer.crs()` returns the layer's source SRID authid.
- Added cross-layer identify: `api.identify(rect, rectSrid, mode)` plus an `IdentifyMode` enum (`TopDownStopAtFirst`, `TopDownAll`). Re-implements the core of `QgsMapToolIdentify::identifyVectorLayer` without pulling in `qgis_gui`.
- Added `qgis-js-example-features` to `docs/examples/`: paginated feature table, attribute identify on map click, view-extent filter, and per-feature highlight on OpenLayers.
- Added the full 2D `QgsAbstractGeometry` hierarchy as JS-constructable wrappers, so geometries can be created and inspected from JS without going through `QgsVectorLayer`:
  - Primitives: `QgsPoint` (XY/Z/M-aware, distinct from `QgsPointXY`), `QgsLineString`, `QgsPolygon`.
  - Curves: `QgsCircularString`, `QgsCompoundCurve`, `QgsCurvePolygon`.
  - Collections: `QgsGeometryCollection`, `QgsMultiPoint`, `QgsMultiLineString`, `QgsMultiCurve`, `QgsMultiPolygon`, `QgsMultiSurface`.
  - Shape constructors: `QgsTriangle`, `QgsCircle`, `QgsEllipse`, `QgsRegularPolygon`, `QgsQuadrilateral` (convert to polygon/curve via `toPolygon(segments)` or `toCircularString()`).
  - 3D bounds: `QgsBox3D` (companion of `QgsRectangle`).
- Extended `QgsGeometry` with `fromWkt(wkt)` / `fromWkb(uint8array)` static factories so JS can construct geometries from OL/Mapbox/GeoJSON output, plus `area()`, `length()`, `centroid()`, `boundingBox()`, `isGeosValid()` and `validationErrors()` for analysis.
- Added `QgsWkbTypes` with class-function helpers (`displayString`, `geometryType`, `flatType`, `singleType`, `multiType`, `hasZ`, `hasM`, `isSingleType`, `isMultiType`) and the `WkbType` / `GeometryType` TS enums.
- Each concrete geometry type exposes a `fromGeometry(geom)` static factory that returns a typed wrapper (or `null` when the WKB types don't match) — pattern lets JS code unwrap a `QgsGeometry` into the concrete subclass for type-specific accessors.
- Added dynamic-project / dynamic-layer surface for building QGIS state from JS without loading a `.qgz` / `.gpkg`:
  - `api.clearProject()` and `api.addMapLayer(layer)` for project lifecycle.
  - `QgsVectorLayer.createMemoryLayer(name, wkbType, crs, fields)` factory (backed by `QgsMemoryProviderUtils`).
  - `QgsVectorLayer.addFeature(feature)` — appends to the data provider and triggers a repaint; works on memory layers without `startEditing()`.
  - `new QgsField(name, type)` + `QgsFields.append(field)` for building schemas in JS, plus a `FieldType` TS enum mirroring the relevant `QMetaType::Type` values.
  - `new QgsFeature(fields)`, `feature.setGeometry(geom)`, and `feature.setAttribute(nameOrIndex, value)` for constructing features in JS. Attribute values marshal automatically from JS booleans/numbers/strings/`Uint8Array`/null via a new `valToQVariant` helper.
- Added `qgis-js-example-digitize` to `docs/examples/`: builds a QGIS project entirely in JS (three memory layers — Point, LineString, Polygon — with their own schemas), commits each OpenLayers sketch as a real `QgsFeature`, and renders the result through `QgisCanvasDataSource` so the visible map is being drawn by QGIS itself. Sidebar shows live per-layer feature counts plus the analysis of the last sketch (WKT, area, length, centroid, GEOS validity).

## 4.0.0 (16. March 2026)

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
