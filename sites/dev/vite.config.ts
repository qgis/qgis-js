import { resolve } from "path";
import { defineConfig } from "vite";

import QgisRuntimePlugin from "../../build/vite/QgisRuntimePlugin";
import DirectoryListingPlugin from "../../build/vite/DirectoryListingPlugin";
import CrossOriginIsolationPlugin, {
  CrossOriginIsolationResponseHeaders,
} from "../../build/vite/CrossOriginIsolationPlugin";

import { viteStaticCopy } from "vite-plugin-static-copy";

import packageJson from "./package.json";

export default defineConfig({
  base: "/qgis-js/",
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
      {
        find: /^@qgis-js\/utils$/,
        replacement: resolve(
          __dirname,
          "../../packages/qgis-js-utils/src/index.ts",
        ),
      },
    ],
  },
  preview: {
    headers: {
      ...CrossOriginIsolationResponseHeaders,
    },
  },
  plugins: [
    QgisRuntimePlugin({
      name: "qgis-js",
      outputDir: "build/wasm",
    }),
    CrossOriginIsolationPlugin(),
    DirectoryListingPlugin(["public/projects"]),
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
