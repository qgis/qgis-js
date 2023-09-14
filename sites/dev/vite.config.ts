import { resolve } from "path";
import { defineConfig } from "vite";

import QgisRuntimePlugin from "../../vite/QgisRuntimePlugin";
import CrossOriginIsolationPlugin from "../../vite/CrossOriginIsolationPlugin";
import DirectoryListingPlugin from "../../vite/DirectoryListingPlugin";

import dts from "vite-plugin-dts";

import packageJson from "./package.json";

export default defineConfig({
  define: {
    __QGIS_JS_VERSION: JSON.stringify(packageJson.version),
  },
  plugins: [
    QgisRuntimePlugin({
      name: "qgis-js",
      outputDir: "build-wasm",
    }),
    DirectoryListingPlugin(["public/projects"]),
    CrossOriginIsolationPlugin(),
    dts({
      rollupTypes: true,
      entryRoot: "src",
    }),
  ],
  build: {
    lib: {
      entry: [resolve(__dirname, "src/index.ts")],
      name: "qgis-js",
      formats: ["es"],
      fileName: "qgis",
    },
    rollupOptions: {
      external: [
        "vue",
        "ol",
        new RegExp("^ol/*"),
        new RegExp("/lib/demo/.*"),
        new RegExp("/lib/vite/.*"),
      ],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
  server: {
    open: "/",
  },
});
