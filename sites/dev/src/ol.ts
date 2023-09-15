import { QgisApi } from "qgis-js";

import { QgisOpenLayers } from "@qgis-js/ol";

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
): () => void {
  let view: View | undefined = undefined;

  const getBbox = () => {
    const initioalSrid = api.srid();
    const initialExtent = api.fullExtent();
    return initioalSrid === "EPSG:3857"
      ? initialExtent
      : api.transformRectangle(initialExtent, initioalSrid, "EPSG:3857");
  };

  const init = () => {
    const center = getBbox().center();
    view = new View({
      center: [center.x, center.y],
      zoom: 10,
    });

    const map = new Map({
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
      view: view,
    });

    map.once("precompose", function (_event) {
      // fit the view to the extent of the data once the map gets actually rendered
      update();
    });
  };

  const update = () => {
    const bbox = getBbox();
    view!.fit([bbox.xMinimum, bbox.yMinimum, bbox.xMaximum, bbox.yMaximum], {
      duration: 500,
    });
  };

  init();

  return update;
}

export function olDemoCanvas(
  target: HTMLDivElement,
  api: QgisApi,
  ol: QgisOpenLayers,
): () => void {
  const update = () => {
    target.innerHTML = "";

    // TODO switch map to the projects CRS
    /*
    const initialExtent = api.fullExtent();
    const center = initialExtent.center();
    */

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
  };
  update();
  return update;
}
