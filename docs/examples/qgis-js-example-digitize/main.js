import "ol/ol.css";
import { qgis, WkbType, GeometryType, FieldType } from "qgis-js";
import { QgisCanvasDataSource } from "@qgis-js/ol";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import ImageLayer from "ol/layer/Image";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";
import WKB from "ol/format/WKB";

const { api } = await qgis({ prefix: "/assets/wasm" });

// Build the QGIS project from scratch, in JS. After this runs there are
// three real QgsVectorLayers owned by QgsProject::instance() — no .qgz,
// no .gpkg, no fetch. The schemas live entirely in JS.
const LAYERS = {};
function rebuildProject() {
  api.clearProject();
  const types = [
    { key: "Point", wkb: WkbType.Point },
    { key: "LineString", wkb: WkbType.LineString },
    { key: "Polygon", wkb: WkbType.Polygon },
  ];
  for (const { key, wkb } of types) {
    const fields = new api.QgsFields();
    fields.append(new api.QgsField("label", FieldType.String));
    fields.append(new api.QgsField("created", FieldType.String));
    const layer = api.QgsVectorLayer.createMemoryLayer(
      `Sketched ${key}s`,
      wkb,
      "EPSG:3857",
      fields,
    );
    api.addMapLayer(layer);
    LAYERS[key] = { layer, fields };
  }
}
rebuildProject();

// The visible map: OSM basemap, a QGIS-rendered image layer drawing the
// memory layers we just registered, and a transient OL vector source for
// the sketch-in-progress (cleared on drawend, when the feature is
// committed to QGIS).
const inProgress = new VectorSource();
const qgisSource = new QgisCanvasDataSource(api, { projection: "EPSG:3857" });
const map = new Map({
  target: "map",
  layers: [
    new TileLayer({ source: new OSM() }),
    new ImageLayer({ source: qgisSource }),
    new VectorLayer({
      source: inProgress,
      style: new Style({
        stroke: new Stroke({ color: "#2b7a3f", width: 2, lineDash: [4, 4] }),
        fill: new Fill({ color: "rgba(43, 122, 63, 0.15)" }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({ color: "#2b7a3f", width: 2 }),
          fill: new Fill({ color: "rgba(43, 122, 63, 0.3)" }),
        }),
      }),
    }),
  ],
  view: new View({
    center: [1100000, 6000000], // central Europe, EPSG:3857
    zoom: 4,
  }),
});

const wkbFormat = new WKB({ hex: false });

const el = (sel) => document.querySelector(sel);
const toolButtons = document.querySelectorAll(".tools button");
const clearBtn = el("#clear");
const undoBtn = el("#undo");
const wktToggle = el("#wkt-toggle");
const wktPre = el("#m-wkt");

let currentType = "Point";
let activeDraw = null;

toolButtons.forEach((btn) =>
  btn.addEventListener("click", () => switchType(btn.dataset.type)),
);

clearBtn.addEventListener("click", () => {
  rebuildProject();
  refreshCanvas();
  refreshCounts();
  resetMetrics();
  inProgress.clear();
});

undoBtn.addEventListener("click", () => activeDraw?.removeLastPoint());

wktToggle.addEventListener("click", () => {
  const hidden = wktPre.classList.toggle("hidden");
  wktToggle.textContent = hidden ? "WKT ▸" : "WKT ▾";
});

switchType(currentType);
refreshCounts();

function switchType(type) {
  currentType = type;
  toolButtons.forEach((b) =>
    b.classList.toggle("active", b.dataset.type === type),
  );
  if (activeDraw) map.removeInteraction(activeDraw);
  activeDraw = new Draw({ source: inProgress, type });
  activeDraw.on("drawstart", () => {
    inProgress.clear();
    undoBtn.disabled = false;
  });
  activeDraw.on("drawend", (event) => {
    undoBtn.disabled = true;
    commit(event.feature);
  });
  map.addInteraction(activeDraw);
}

function commit(olFeature) {
  // OL geometry → WKB → QgsGeometry → QgsFeature → QGIS memory layer.
  const buf = wkbFormat.writeGeometry(olFeature.getGeometry());
  const geom = api.QgsGeometry.fromWkb(new Uint8Array(buf));

  const { layer, fields } = LAYERS[currentType];
  const feat = new api.QgsFeature(fields);
  feat.setGeometry(geom);
  feat.setAttribute("label", `${currentType} ${layer.featureCount() + 1}`);
  feat.setAttribute("created", new Date().toISOString());
  layer.addFeature(feat);

  // Hand rendering back to QGIS: drop the transient OL overlay and force
  // QgisCanvasDataSource to re-fetch a freshly-rendered image.
  inProgress.clear();
  refreshCanvas();
  refreshCounts();
  analyze(geom);
}

function refreshCanvas() {
  qgisSource.changed();
}

function refreshCounts() {
  for (const key of Object.keys(LAYERS)) {
    el(`#c-${key}`).textContent = LAYERS[key].layer.featureCount();
  }
}

function analyze(geom) {
  const type = geom.wkbType();
  const family = api.QgsWkbTypes.geometryType(type);

  el("#m-type").textContent =
    `${api.QgsWkbTypes.displayString(type)} (${type})`;
  el("#m-vertices").textContent = vertexCount(geom, family);
  el("#m-area").textContent =
    family === GeometryType.Polygon ? formatNum(geom.area()) : "—";
  el("#m-length").textContent =
    family === GeometryType.Line || family === GeometryType.Polygon
      ? formatNum(geom.length())
      : "—";

  const centroid = geom.centroid();
  el("#m-centroid").textContent = centroid.isEmpty()
    ? "—"
    : centroid
        .asWkt(2)
        .replace(/^Point\s*\(?|\)$/g, "")
        .trim();

  const valid = geom.isGeosValid();
  const errs = geom.validationErrors();
  const v = el("#m-valid");
  v.className = valid && errs.length === 0 ? "valid" : "invalid";
  v.textContent =
    valid && errs.length === 0
      ? "valid"
      : `invalid${errs.length ? ` — ${errs.join("; ")}` : ""}`;
  el("#m-wkt").textContent = geom.asWkt(2);
}

function vertexCount(geom, family) {
  switch (family) {
    case GeometryType.Point:
      return api.QgsPoint.fromGeometry(geom) ? "1" : "—";
    case GeometryType.Line: {
      const l = api.QgsLineString.fromGeometry(geom);
      return l ? String(l.numPoints()) : "—";
    }
    case GeometryType.Polygon: {
      const p = api.QgsPolygon.fromGeometry(geom);
      if (!p) return "—";
      const ring = p.exteriorRing();
      return ring ? String(ring.numPoints()) : "—";
    }
    default:
      return "—";
  }
}

function formatNum(n) {
  if (!Number.isFinite(n) || n === 0) return "0";
  if (Math.abs(n) >= 1000)
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function resetMetrics() {
  ["m-type", "m-vertices", "m-area", "m-length", "m-centroid"].forEach(
    (id) => (el("#" + id).textContent = "—"),
  );
  el("#m-valid").textContent = "—";
  el("#m-valid").className = "";
  wktPre.textContent = "";
}
