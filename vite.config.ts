import { resolve } from "path";
import { defineConfig } from "vite";

import QgisRuntimePlugin from "./lib/vite/QgisRuntimePlugin";
import CrossOriginIsolationPlugin from "./lib/vite/CrossOriginIsolationPlugin";

import dts from "vite-plugin-dts";

import packageJson from "./package.json";

export default defineConfig({
  define: {
    __QGIS_JS_VERSION: JSON.stringify(packageJson.version),
  },
  plugins: [
    QgisRuntimePlugin({
      name: "test_vcpkg",
      outputDir: "build-wasm",
    }),
    CrossOriginIsolationPlugin(),
    dts({
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      name: "qgis-js",
      formats: ["es"],
      fileName: "qgis",
    },
    rollupOptions: {
      external: ["vue", new RegExp("/lib/demo/.*"), new RegExp("/lib/vite/.*")],
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
