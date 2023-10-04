import { QgisApi } from "qgis-js";

import { QgisOpenLayers } from "@qgis-js/ol";

import type { QgisXYZDataSource, QgisCanvasDataSource } from "@qgis-js/ol";

import Map from "ol/Map.js";
import View from "ol/View.js";

import WebGLTileLayer from "ol/layer/WebGLTile.js";
import ImageLayer from "ol/layer/Image";

import XYZ from "ol/source/XYZ.js";

import Projection from "ol/proj/Projection.js";

import { ScaleLine, defaults as defaultControls } from "ol/control.js";

// @ts-ignore
import("ol/ol.css");

const animationDuration = 500;

const useBaseMap = true;

export function olDemoXYZ(
  target: HTMLDivElement,
  api: QgisApi,
  ol: QgisOpenLayers,
): { init: () => void; update: () => void; render: () => void } {
  let view: View | undefined = undefined;
  let map: Map | undefined = undefined;
  let layer: WebGLTileLayer | undefined = undefined;
  let source: QgisXYZDataSource | undefined = undefined;

  const getBbox = () => {
    const initioalSrid = api.srid();
    const initialExtent = api.fullExtent();
    return initioalSrid === "EPSG:3857"
      ? initialExtent
      : api.transformRectangle(initialExtent, initioalSrid, "EPSG:3857");
  };

  const init = () => {
    target.innerHTML = "";

    const center = getBbox().center();

    view = new View({
      center: [center.x, center.y],
      zoom: 10,
    });

    source = ol.QgisXYZDataSource(api, {
      debug: false,
    });

    (layer = new WebGLTileLayer({
      source,
    })),
      (map = new Map({
        target,
        view,
        controls: defaultControls().extend([new ScaleLine()]),
        layers: [
          layer,
          ...(useBaseMap
            ? [
                new WebGLTileLayer({
                  opacity: 1,
                  source: new XYZ({
                    url: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`,
                  }),
                  style: {
                    //exposure: ["var", "exposure"],
                    //contrast: ["var", "contrast"],
                    saturation: ["var", "saturation"],
                    variables: {
                      //exposure: 0,
                      //contrast: 0,
                      saturation: -0.75,
                    },
                  },
                }),
              ]
            : []),
        ].reverse(),
      }));

    map.once("precompose", function (_event) {
      // fit the view to the extent of the data once the map gets actually rendered
      update();
    });
  };

  const update = () => {
    const bbox = getBbox();
    view!.fit([bbox.xMinimum, bbox.yMinimum, bbox.xMaximum, bbox.yMaximum], {
      duration: animationDuration,
    });
    setTimeout(() => {
      render();
    }, 0);
  };

  const render = () => {
    source?.clear();
    layer?.getRenderer()?.clearCache();
    layer?.changed();
  };

  init();

  return {
    init,
    update,
    render,
  };
}

export function olDemoCanvas(
  target: HTMLDivElement,
  api: QgisApi,
  ol: QgisOpenLayers,
): { init: () => void; update: () => void; render: () => void } {
  let view: View | undefined = undefined;
  let srid: string | undefined = undefined;
  let map: Map | undefined = undefined;
  let layer: ImageLayer<QgisCanvasDataSource> | undefined = undefined;
  let source: QgisCanvasDataSource | undefined = undefined;

  const init = () => {
    target.innerHTML = "";

    srid = api.srid();

    const projection = new Projection({
      code: srid,
      // TODO map unit of QgsCoordinateReferenceSystem to ol unit
      // https://api.qgis.org/api/classQgsCoordinateReferenceSystem.html#ad57c8a9222c27173c7234ca270306128
      // https://openlayers.org/en/latest/apidoc/module-ol_proj_Units.html
      units: "m",
    });

    const bbox = api.fullExtent();
    const center = bbox.center();

    view = new View({
      projection,
      center: [center.x, center.y],
      zoom: 10,
    });

    source = ol.QgisCanvasDataSource(api, {
      projection,
    });

    layer = new ImageLayer({
      source,
    });

    map = new Map({
      target,
      view,
      controls: defaultControls().extend([new ScaleLine()]),
      layers: [layer],
    });

    map.once("precompose", function (_event) {
      const bbox = api.fullExtent();
      view!.fit([bbox.xMinimum, bbox.yMinimum, bbox.xMaximum, bbox.yMaximum], {
        duration: animationDuration,
      });
    });
  };

  // recreate the entire map on each update to get new projections working
  const update = () => {
    init();
  };

  const render = () => {
    setTimeout(() => {
      // recreate the source to force reload the image in the layer
      source = ol.QgisCanvasDataSource(api, {
        projection: new Projection({
          code: srid!,
          units: "m",
        }),
      });
      layer?.setSource(source);
    }, 0);
  };

  init();

  return {
    init,
    update,
    render,
  };
}
