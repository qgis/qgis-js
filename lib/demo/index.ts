import { QGIS_JS_VERSION, boot } from "..";

const printVersion = false;

function initDemo() {
  if (printVersion) {
    console.log(`qgis-js (${QGIS_JS_VERSION})`);
  }

  boot();
}

initDemo();
