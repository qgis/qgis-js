import { QGIS_JS_VERSION, boot } from "..";

const printVersion = false;

async function initDemo() {
  if (printVersion) {
    console.log(`qgis-js (${QGIS_JS_VERSION})`);
  }

  const { api } = await boot();

  console.log(api.loadProject("test"));
}

initDemo();
