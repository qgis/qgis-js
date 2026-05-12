import { qgis, LayerType, FeatureRequestFlag } from "qgis-js";
import { QgisCanvasDataSource } from "@qgis-js/ol";
import { Map, View } from "ol";
import ImageLayer from "ol/layer/Image";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Projection from "ol/proj/Projection.js";
import WKB from "ol/format/WKB";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";

const PAGE_SIZE = 50;
const HIT_BOX_PIXELS = 5;
const IDLE_IDENTIFY_TEXT = "Click the map to identify features";

const cssColor = (name) => {
  const probe = document.body.appendChild(document.createElement("div"));
  probe.style.color = `var(${name})`;
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
};

const { api, fs } = await qgis({ prefix: "/assets/wasm" });

const uploadDir = "/upload";
fs.mkdir(uploadDir);

const projectSource =
  "https://raw.githubusercontent.com/boardend/qgis-js-projects/main/demo/World%20GPKG";
const projectFiles = ["project.qgz", "world_map.gpkg"];
await Promise.all(
  projectFiles.map(async (file) => {
    const response = await fetch(`${projectSource}/${file}`);
    fs.writeFile(
      `${uploadDir}/${file}`,
      new Uint8Array(await response.arrayBuffer()),
    );
  }),
);
api.loadProject(`${uploadDir}/${projectFiles[0]}`);

const projection = new Projection({ code: api.srid(), units: "m" });

const highlightStyle = new Style({
  stroke: new Stroke({ color: cssColor("--color-highlight-stroke"), width: 3 }),
  fill: new Fill({ color: cssColor("--color-highlight-fill") }),
  image: new CircleStyle({
    radius: 6,
    stroke: new Stroke({
      color: cssColor("--color-highlight-stroke"),
      width: 2,
    }),
    fill: new Fill({ color: cssColor("--color-highlight-marker-fill") }),
  }),
});
const highlightSource = new VectorSource();

const map = new Map({
  target: "map",
  layers: [
    new ImageLayer({ source: new QgisCanvasDataSource(api, { projection }) }),
    new VectorLayer({ source: highlightSource, style: highlightStyle }),
  ],
  view: new View({ center: [0, 0], zoom: 2, projection }),
});

const wkbFormat = new WKB();

const el = (sel) => document.querySelector(sel);
const layerSelect = el("#layer-select");
const summary = el("#summary");
const fieldsBody = el("#fields-table tbody");
const featuresHead = el("#features-table thead tr");
const featuresBody = el("#features-table tbody");
const loadMoreBtn = el("#load-more");
const filterBtn = el("#filter-by-view");
const resetBtn = el("#reset");
const identifySummary = el("#identify-summary");
const identifyList = el("#identify-list");
const identifyCardTemplate = el("#identify-card-template");

const vectorLayers = collectVectorLayers(api.layerTreeRoot());
layerSelect.replaceChildren(
  ...vectorLayers.map((layer) => {
    const opt = document.createElement("option");
    opt.value = layer.id();
    opt.textContent = layer.name;
    return opt;
  }),
);

let currentLayer = null;
let currentFieldNames = [];
let currentIterator = null;
let loadedCount = 0;

layerSelect.addEventListener("change", () =>
  openLayer(findLayer(layerSelect.value)),
);
loadMoreBtn.addEventListener("click", loadMore);
filterBtn.addEventListener("click", () => applyFilter(true));
resetBtn.addEventListener("click", () => applyFilter(false));
map.on("singleclick", (event) => identifyAt(event.coordinate));

if (vectorLayers.length) {
  layerSelect.value = vectorLayers[0].id();
  openLayer(vectorLayers[0]);
}

function collectVectorLayers(group) {
  const result = [];
  for (const child of group.children()) {
    if (child.isGroup()) {
      result.push(...collectVectorLayers(child));
    } else if (child.isLayer()) {
      const layer = child.layer();
      if (layer?.type() === LayerType.Vector) result.push(layer);
    }
  }
  return result;
}

function findLayer(id) {
  return vectorLayers.find((l) => l.id() === id) ?? null;
}

function openLayer(layer) {
  closeIterator();
  currentLayer = layer;
  highlightSource.clear();
  clearTableSelection();
  clearIdentify();
  if (!layer) return;

  const fields = fieldArray(layer.fields());
  currentFieldNames = fields.map((f) => f.name());

  fieldsBody.replaceChildren(
    ...fields.map((f) => makeRow([f.name(), f.typeName(), String(f.length())])),
  );
  rebuildFeaturesHeader();
  featuresBody.replaceChildren();

  summary.textContent = `${layer.featureCount()} features total`;
  loadedCount = 0;
  currentIterator = layer.getFeatures(featureRequest());
  loadMore();
}

function fieldArray(fields) {
  return Array.from({ length: fields.count() }, (_, i) => fields.at(i));
}

function featureRequest() {
  const r = new api.QgsFeatureRequest();
  r.setDestinationCrs(projection.getCode());
  return r;
}

function rebuildFeaturesHeader() {
  featuresHead.replaceChildren(
    ...["id", ...currentFieldNames].map((name) => {
      const th = document.createElement("th");
      th.textContent = name;
      return th;
    }),
  );
}

function closeIterator() {
  currentIterator?.close();
  currentIterator = null;
}

function loadMore() {
  if (!currentIterator) return;
  let added = 0;
  while (added < PAGE_SIZE) {
    const feature = currentIterator.nextFeature();
    if (!feature) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = `End of features — ${loadedCount} loaded`;
      return;
    }
    appendFeatureRow(feature);
    loadedCount++;
    added++;
  }
  loadMoreBtn.textContent = `Load more (${PAGE_SIZE}) — ${loadedCount} loaded`;
}

function appendFeatureRow(feature) {
  const row = makeRow([feature.id(), ...feature.attributes()].map(formatCell));
  row.addEventListener("click", () => {
    clearTableSelection();
    row.classList.add("selected");
    clearIdentify();
    highlightFeature(feature);
  });
  featuresBody.appendChild(row);
}

function highlightFeature(feature) {
  highlightSource.clear();
  if (!feature.hasGeometry()) return;
  const geom = wkbFormat.readGeometry(feature.geometry().asWkb());
  highlightSource.addFeature(new Feature({ geometry: geom }));
  const extent = geom.getExtent();
  if (Number.isFinite(extent[0])) {
    map.getView().fit(extent, { padding: [40, 40, 40, 40], maxZoom: 10 });
  }
}

function applyFilter(useView) {
  if (!currentLayer) return;
  closeIterator();
  featuresBody.replaceChildren();
  loadedCount = 0;
  loadMoreBtn.disabled = false;
  loadMoreBtn.textContent = `Load more (${PAGE_SIZE})`;

  const request = featureRequest();
  if (useView) {
    const [xmin, ymin, xmax, ymax] = map
      .getView()
      .calculateExtent(map.getSize());
    request.setFilterRect(new api.QgsRectangle(xmin, ymin, xmax, ymax));
    summary.textContent = "Filtered to current map view";
  } else {
    summary.textContent = `${currentLayer.featureCount()} features total`;
  }
  currentIterator = currentLayer.getFeatures(request);
  loadMore();
}

function identifyAt([x, y]) {
  if (!currentLayer) return;
  clearTableSelection();

  const radius = map.getView().getResolution() * HIT_BOX_PIXELS;
  const request = featureRequest();
  request.setFilterRect(
    new api.QgsRectangle(x - radius, y - radius, x + radius, y + radius),
  );
  request.setFlags(FeatureRequestFlag.ExactIntersect);

  const hits = drain(currentLayer.getFeatures(request));
  highlightSource.clear();
  for (const hit of hits) {
    if (!hit.hasGeometry()) continue;
    highlightSource.addFeature(
      new Feature({ geometry: wkbFormat.readGeometry(hit.geometry().asWkb()) }),
    );
  }
  renderIdentify(hits);
}

function drain(it) {
  const out = [];
  let f;
  while ((f = it.nextFeature())) out.push(f);
  it.close();
  return out;
}

function renderIdentify(features) {
  identifyList.replaceChildren();
  if (!features.length) {
    identifySummary.textContent = "Nothing identified here";
    return;
  }
  identifySummary.textContent = `${features.length} feature${features.length === 1 ? "" : "s"} in ${currentLayer.name}`;
  identifyList.append(...features.map(renderIdentifyCard));
}

function renderIdentifyCard(feature) {
  const card = identifyCardTemplate.content.firstElementChild.cloneNode(true);
  card.querySelector(".identify-card-header").textContent =
    `Feature ${feature.id()}`;
  const attrs = feature.attributes();
  card
    .querySelector("tbody")
    .replaceChildren(
      ...currentFieldNames.map((name, i) =>
        makeRow([name, formatCell(attrs[i])]),
      ),
    );
  return card;
}

function clearTableSelection() {
  featuresBody.querySelector(".selected")?.classList.remove("selected");
}

function clearIdentify() {
  identifyList.replaceChildren();
  identifySummary.textContent = IDLE_IDENTIFY_TEXT;
}

function makeRow(cells) {
  const row = document.createElement("tr");
  for (const text of cells) {
    const td = document.createElement("td");
    td.textContent = text;
    td.title = text;
    row.appendChild(td);
  }
  return row;
}

function formatCell(v) {
  return v == null ? "" : String(v);
}
