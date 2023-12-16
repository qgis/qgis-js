const QGIS_JS_DIST = window.location.pathname + "node_modules/qgis-js/dist";

// loading the qgis-js library
const { qgis, QGIS_JS_VERSION } = await import(QGIS_JS_DIST + "/qgis.js");
console.log(`qgis-js (v${QGIS_JS_VERSION})`);

// booting the qgis-js runtime
console.log(`- loading qgis-js`);
const { api } = await qgis({
  prefix: QGIS_JS_DIST + "/assets/wasm",
});
console.log(`- qgis-js ready`);

// qgis-js API example
console.log(`- creating a rectangle`);
const rect = new api.Rectangle(1, 2, 3, 4);
console.log("-> " + printRect(rect));

console.log(`- scaling the rectangle`);
rect.scale(5);
console.log("-> " + printRect(rect));

console.log(`- getting the center of the rectangle`);
const center = rect.center();
console.log(`-> Point: x: ${center.x}, y: ${center.y}`);

function printRect(rect) {
  return `Rectangle: xMaximum: ${rect.xMaximum}, xMinimum: ${rect.xMinimum}, yMaximum: ${rect.yMaximum}, yMinimum: ${rect.yMinimum}`;
}
