import { qgis } from "qgis-js";

import { QgisCanvasDataSource } from "@qgis-js/ol";

import { Map, View } from "ol";

import ImageLayer from "ol/layer/Image";
import Projection from "ol/proj/Projection.js";

// start the qgis-js runtime
const { api, fs } = await qgis({
  prefix: "/assets/wasm",
});

// prepare the upload directory
const uploadDir = "/upload";
fs.mkdir(uploadDir);

// fetch demo project and upload it to the runtime
const source =
  "https://raw.githubusercontent.com/boardend/qgis-js-projects/main/demo/World%20GPKG";
const files = ["project.qgz", "world_map.gpkg"];
for (const file of files) {
  const url = `${source}/${file}`;
  const response = await fetch(url);
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  fs.writeFile(`${uploadDir}/${file}`, new Uint8Array(buffer));
}

// load the uploaded project
api.loadProject(`${uploadDir}/${files[0]}`);

// create the ol map with the projection from the project
const projection = new Projection({
  code: api.srid(),
  units: "m",
});

new Map({
  target: "map",
  layers: [
    new ImageLayer({
      source: new QgisCanvasDataSource(api, {
        projection,
      }),
    }),
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
    projection,
  }),
});
