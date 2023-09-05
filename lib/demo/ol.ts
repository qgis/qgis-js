import { QgisApi } from "../api/public";

import { QgisOpenLayers } from "../ol/QgisOl";

import Map from "ol/Map.js";
import View from "ol/View.js";

import WebGLTileLayer from "ol/layer/WebGLTile.js";
import ImageLayer from "ol/layer/Image";

import XYZ from "ol/source/XYZ.js";

import { fromLonLat } from "ol/proj.js";

// @ts-ignore
import("ol/ol.css");

const useBaseMap = true;

export function olDemoXYZ(
  target: HTMLDivElement,
  api: QgisApi,
  ol: QgisOpenLayers,
) {
  new Map({
    target,
    maxTilesLoading: 4,
    layers: [
      new WebGLTileLayer({
        source: ol.QgisXYZDataSource(api, {
          debug: false,
        }),
      }),
      ...(useBaseMap
        ? [
            new WebGLTileLayer({
              opacity: 1,
              source: new XYZ({
                url: `https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}.png`,
                maxZoom: 15,
              }),
            }),
          ]
        : []),
    ].reverse(),
    view: new View({
      center: fromLonLat([-3.1072, 51.0595]),
      zoom: 12,
    }),
  });
}

export function olDemoCanvas(
  target: HTMLDivElement,
  api: QgisApi,
  ol: QgisOpenLayers,
) {
  new Map({
    target,
    layers: [
      new ImageLayer({
        source: ol.QgisCanvasDataSource(api),
      }),
    ].reverse(),
    view: new View({
      center: fromLonLat([-3.1072, 51.0595]),
      zoom: 15,
    }),
  });
}
