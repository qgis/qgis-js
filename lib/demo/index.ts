import { QGIS_JS_VERSION, qgis } from "..";

import { jsDemo } from "./js";

//@ts-ignore
import("./demo.css"); // TODO include this in the .html head to prevnet a flash of unstyled content?

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
