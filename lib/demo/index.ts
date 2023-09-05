import { QGIS_JS_VERSION, qgis } from "..";

import { jsDemo } from "./js";
import { olDemoXYZ, olDemoCanvas } from "./ol";

const printVersion = true;

async function initDemo() {
  if (printVersion) {
    console.log(`qgis-js (${QGIS_JS_VERSION})`);
  }

  const { api, fs, ol } = await qgis({
    prefix: "/assets/wasm",
  });

  const jsDemoCanvas = document.getElementById(
    "js-demo-canvas",
  ) as HTMLCanvasElement;
  jsDemo(jsDemoCanvas, api, fs);

  const qgisOl = await ol();
  if (qgisOl) {
    const olDemoXYZDiv = document.getElementById(
      "ol-demo-xyz",
    ) as HTMLDivElement | null;
    if (olDemoXYZDiv) {
      olDemoXYZ(olDemoXYZDiv, api, qgisOl);
    }

    const olDemoCanvasDiv = document.getElementById(
      "ol-demo-canvas",
    ) as HTMLDivElement | null;
    if (olDemoCanvasDiv) {
      olDemoCanvas(olDemoCanvasDiv, api, qgisOl);
    }
  }
}

initDemo();

/*

// Example on how to load testdata of the qgis repo from github

const owner = "qgis";
const repo = "qgis";
const path = "tests/testdata";

fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`)
  .then((response) => response.json())
  .then((data) => {
    // Handle the response data here
    console.log(data);
  })
  .catch((error) => {
    // Handle any errors here
    console.error(error);
  });
*/
