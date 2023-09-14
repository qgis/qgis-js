import { resolve } from "path";
import { defineConfig } from "vite";

import dts from "vite-plugin-dts";

import packageJson from "./package.json";

export default defineConfig({
  define: {
    __QGIS_JS_VERSION: JSON.stringify(packageJson.version),
  },
  plugins: [
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
  },
});
