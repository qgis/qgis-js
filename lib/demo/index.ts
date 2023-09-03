import { QGIS_JS_VERSION, qgis } from "..";

import { jsDemo } from "./js";

const printVersion = true;

async function initDemo() {
  if (printVersion) {
    console.log(`qgis-js (${QGIS_JS_VERSION})`);
  }

  const { api, fs } = await qgis({
    prefix: "/assets/wasm",
  });

  const demoCanvas = document.getElementById(
    "js-demo-canvas",
  ) as HTMLCanvasElement;

  jsDemo(demoCanvas, api, fs);
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
