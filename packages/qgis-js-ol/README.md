# @qgis-js/ol

**OpenLayers sources for [qgis-js](https://github.com/qgis/qgis-js)**

[qgis-js Repository](https://github.com/qgis/qgis-js) | [qgis-js Website](https://qgis.github.io/qgis-js) | ["`@qgis-js/ol`" package source](https://github.com/qgis/qgis-js/tree/main/packages/qgis-js-ol)

[![@qgis-js/ol on npm](https://img.shields.io/npm/v/@qgis-js/ol)](https://www.npmjs.com/package/@qgis-js/ol)

> ⚠️🧪 **Work in progress**! Currently this project is in public beta

## Prerequisites

- This package requires **[OpenLayers](https://openlayers.org) `>=8`** to be installed as a peer dependency

- The [qgis-js](https://www.npmjs.com/package/@qgis-js/ol) package is also required as a direct dependency of this package

  - An instance of the qgis-js runtime has to be created at runtime and its API must be passed to the OpenLayers source constructor

## Installation

```bash
npm install -S @qgis-js/ol
```

## Usage

### QgisCanvasDataSource

[OpenLayers](https://openlayers.org) source for rendering a single tile with the size and pixel ratio of the ol map canvas. This is useful for rendering in the projection of the QGIS project, both in the OpenLayers view and in the qgis-js runtime.

> See [QgisCanvasDataSource.ts](https://github.com/qgis/qgis-js/blob/main/packages/qgis-js-ol/src/QgisCanvasDataSource.ts) for the implementation.

### QgisXYZDataSource

[OpenLayers](https://openlayers.org) source to render a QGIS project in the common Web Mercator projection (EPSG:3857) addressed with the xyz tile scheme. This makes it convenient to mix the QGIS layer with other layer sources provided by OpenLayers.

> See [QgisXYZDataSource.ts](https://github.com/qgis/qgis-js/blob/main/packages/qgis-js-ol/src/QgisXYZDataSource.ts) for the implementation.

## Versioning

This package uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/qgis/qgis-js/tags).

## License

[GNU General Public License v2.0](https://github.com/qgis/qgis-js/blob/main/LICENSE)
