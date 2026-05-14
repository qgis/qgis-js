import { qgis, LayerType, FeatureRequestFlag } from "qgis-js";
import { QgisCanvasDataSource } from "@qgis-js/ol";
import { Map, View } from "ol";
import ImageLayer from "ol/layer/Image";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Overlay from "ol/Overlay";
import Projection from "ol/proj/Projection.js";
import WKB from "ol/format/WKB";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";

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
    if (!response.ok)
      throw new Error(`Failed to fetch ${file}: ${response.status}`);
    fs.writeFile(
      `${uploadDir}/${file}`,
      new Uint8Array(await response.arrayBuffer()),
    );
  }),
);
if (!api.loadProject(`${uploadDir}/${projectFiles[0]}`)) {
  throw new Error(`loadProject failed for ${projectFiles[0]}`);
}

const projection = new Projection({ code: api.srid(), units: "m" });

const primaryStyle = new Style({
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
const secondaryStyle = new Style({
  stroke: new Stroke({
    color: cssColor("--color-highlight-secondary-stroke"),
    width: 1.5,
  }),
  fill: new Fill({ color: cssColor("--color-highlight-secondary-fill") }),
});

const primarySource = new VectorSource();
const secondarySource = new VectorSource();

const map = new Map({
  target: "map",
  layers: [
    new ImageLayer({ source: new QgisCanvasDataSource(api, { projection }) }),
    new VectorLayer({ source: secondarySource, style: secondaryStyle }),
    new VectorLayer({ source: primarySource, style: primaryStyle }),
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
const filterBtn = el("#filter-by-view");
const resetBtn = el("#reset");
const pageSizeSelect = el("#page-size");
const paginationEl = el("#pagination");
const hitBoxInput = el("#hit-box");
const identifySummary = el("#identify-summary");
const identifyList = el("#identify-list");
const identifyCardTemplate = el("#identify-card-template");
const popupEl = el("#popup");
const idleIdentifyText = identifySummary.textContent;

const popup = new Overlay({
  element: popupEl,
  positioning: "bottom-center",
  offset: [0, -10],
  stopEvent: false,
});
map.addOverlay(popup);

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
let currentFeatures = [];
let currentPage = 1;
let pageSize = Number(pageSizeSelect.value);

layerSelect.addEventListener("change", () =>
  openLayer(findLayer(layerSelect.value)),
);
filterBtn.addEventListener("click", () => applyFilter(true));
resetBtn.addEventListener("click", () => applyFilter(false));
pageSizeSelect.addEventListener("change", () => {
  pageSize = Number(pageSizeSelect.value);
  currentPage = 1;
  renderPage();
});
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
  currentLayer = layer;
  clearHighlight();
  clearTableSelection();
  clearIdentify();
  resetBtn.disabled = true;
  if (!layer) return;

  const fields = fieldArray(layer.fields());
  currentFieldNames = fields.map((f) => f.name());

  fieldsBody.replaceChildren(
    ...fields.map((f) => makeRow([f.name(), f.typeName(), String(f.length())])),
  );
  rebuildFeaturesHeader();

  summary.textContent = `${layer.featureCount()} features total`;
  loadFeatures(featureRequest());
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

function loadFeatures(request) {
  currentFeatures = drain(currentLayer.getFeatures(request));
  currentPage = 1;
  renderPage();
}

function renderPage() {
  const start = (currentPage - 1) * pageSize;
  const slice = currentFeatures.slice(start, start + pageSize);
  featuresBody.replaceChildren(...slice.map(makeFeatureRow));
  renderPagination();
}

function makeFeatureRow(feature) {
  const row = makeRow([feature.id(), ...feature.attributes()].map(formatCell));
  row.addEventListener("click", () => {
    clearTableSelection();
    row.classList.add("selected");
    clearIdentify();
    highlightFeature(feature);
  });
  return row;
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(currentFeatures.length / pageSize));
  if (totalPages <= 1) {
    paginationEl.replaceChildren();
    return;
  }
  paginationEl.replaceChildren(
    pageBtn("‹", currentPage > 1 ? currentPage - 1 : null),
    ...paginationPages(currentPage, totalPages).map((p) =>
      p === null
        ? pageBtn("…", null)
        : pageBtn(String(p), p, p === currentPage),
    ),
    pageBtn("›", currentPage < totalPages ? currentPage + 1 : null),
  );
}

function paginationPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, null, total];
  if (current >= total - 3)
    return [1, null, total - 4, total - 3, total - 2, total - 1, total];
  return [1, null, current - 1, current, current + 1, null, total];
}

function pageBtn(label, target, isCurrent = false) {
  const b = document.createElement("button");
  b.textContent = label;
  b.classList.toggle("current", isCurrent);
  b.disabled = target === null;
  if (target !== null)
    b.addEventListener("click", () => {
      currentPage = target;
      renderPage();
    });
  return b;
}

function highlightFeature(feature) {
  clearHighlight();
  if (!feature.hasGeometry()) return;
  const geom = wkbFormat.readGeometry(feature.geometry().asWkb());
  primarySource.addFeature(new Feature({ geometry: geom }));
  const extent = geom.getExtent();
  if (Number.isFinite(extent[0])) {
    map.getView().fit(extent, { padding: [40, 40, 40, 40], maxZoom: 10 });
  }
}

function applyFilter(useView) {
  if (!currentLayer) return;
  const request = featureRequest();
  if (useView) {
    const [xmin, ymin, xmax, ymax] = map
      .getView()
      .calculateExtent(map.getSize());
    request.setFilterRect(new api.QgsRectangle(xmin, ymin, xmax, ymax));
    summary.textContent = "Filtered to current map view";
    resetBtn.disabled = false;
  } else {
    summary.textContent = `${currentLayer.featureCount()} features total`;
    resetBtn.disabled = true;
  }
  loadFeatures(request);
}

function identifyAt([x, y]) {
  if (!currentLayer) return;
  clearTableSelection();

  const pixels = Math.max(1, Number(hitBoxInput.value) || 1);
  const radius = map.getView().getResolution() * pixels;
  const request = featureRequest();
  request.setFilterRect(
    new api.QgsRectangle(x - radius, y - radius, x + radius, y + radius),
  );
  request.setFlags(FeatureRequestFlag.ExactIntersect);

  const hits = drain(currentLayer.getFeatures(request));
  clearHighlight();
  hits.forEach((hit, i) => {
    if (!hit.hasGeometry()) return;
    const f = new Feature({
      geometry: wkbFormat.readGeometry(hit.geometry().asWkb()),
    });
    (i === 0 ? primarySource : secondarySource).addFeature(f);
  });
  renderIdentify(hits);
  showMapTip(hits[0], [x, y]);
}

function showMapTip(feature, position) {
  const tip = feature && currentLayer.mapTipTemplate();
  if (!tip) {
    popup.setPosition(undefined);
    return;
  }
  const ctx = currentLayer.createExpressionContext();
  ctx.setFeature(feature);
  popupEl.innerHTML = api.QgsExpression.replaceExpressionText(tip, ctx);
  popup.setPosition(position);
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

function clearHighlight() {
  primarySource.clear();
  secondarySource.clear();
}

function clearIdentify() {
  identifyList.replaceChildren();
  identifySummary.textContent = idleIdentifyText;
  popup.setPosition(undefined);
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
