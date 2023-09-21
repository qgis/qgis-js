import { QgisApi } from "qgis-js";

import { QgisOpenLayers } from "@qgis-js/ol";

import Map from "ol/Map.js";
import View from "ol/View.js";

import WebGLTileLayer from "ol/layer/WebGLTile.js";
import ImageLayer from "ol/layer/Image";

import XYZ from "ol/source/XYZ.js";

import Projection from "ol/proj/Projection.js";

import { ScaleLine, defaults as defaultControls } from "ol/control.js";

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
      view,
      controls: defaultControls().extend([new ScaleLine()]),
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
  // recreate the entire map on each update to get new projections working
  const update = () => {
    target.innerHTML = "";

    const srid = api.srid();

    // from "WMS without Projection" example
    // https://openlayers.org/en/latest/examples/wms-no-proj.html
    const projection = new Projection({
      code: srid,
      // TODO map unit of QgsCoordinateReferenceSystem to ol unit
      // https://api.qgis.org/api/classQgsCoordinateReferenceSystem.html#ad57c8a9222c27173c7234ca270306128
      // https://openlayers.org/en/latest/apidoc/module-ol_proj_Units.html
      units: "m",
    });

    const view = new View({
      projection,
      zoom: 10,
    });

    new Map({
      target,
      view,
      controls: defaultControls().extend([new ScaleLine()]),
      layers: [
        new ImageLayer({
          source: ol.QgisCanvasDataSource(api, {
            projection,
          }),
        }),
      ].reverse(),
    });

    const bbox = api.fullExtent();
    view!.fit([bbox.xMinimum, bbox.yMinimum, bbox.xMaximum, bbox.yMaximum], {
      duration: 500,
    });
  };
  update();
  return update;
}
