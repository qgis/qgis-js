import { resolve } from "path";
import { defineConfig } from "vite";

import QgisRuntimePlugin from "../../vite/QgisRuntimePlugin";
import CrossOriginIsolationPlugin from "../../vite/CrossOriginIsolationPlugin";
import DirectoryListingPlugin from "../../vite/DirectoryListingPlugin";

import { viteStaticCopy } from "vite-plugin-static-copy";

import packageJson from "./package.json";

export default defineConfig({
  define: {
    __QGIS_JS_VERSION: JSON.stringify(packageJson.version),
  },
  resolve: {
    alias: [
      // don't use the bundlet version of qgis-js and qgis-js-ol to enable HMR
      {
        find: /^qgis-js$/,
        replacement: resolve(__dirname, "../../packages/qgis-js/src/index.ts"),
      },
      {
        find: /^@qgis-js\/ol$/,
        replacement: resolve(
          __dirname,
          "../../packages/qgis-js-ol/src/index.ts",
        ),
      },
    ],
  },
  plugins: [
    QgisRuntimePlugin({
      name: "qgis-js",
      outputDir: "build/wasm",
    }),
    DirectoryListingPlugin(["public/projects"]),
    CrossOriginIsolationPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/coi-serviceworker/coi-serviceworker.min.js",
          dest: "",
        },
      ],
    }),
  ],
});
