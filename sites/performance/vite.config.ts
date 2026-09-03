import { defineConfig } from "vite";

import QgisRuntimePlugin from "../../build/vite/QgisRuntimePlugin.ts";
import DirectoryListingPlugin from "../../build/vite/DirectoryListingPlugin.ts";
import CrossOriginIsolationPlugin, {
  CrossOriginIsolationResponseHeaders,
} from "../../build/vite/CrossOriginIsolationPlugin.ts";

import packageJson from "./package.json" with { type: "json" };

export default defineConfig({
  define: {
    __QGIS_JS_VERSION: JSON.stringify(packageJson.version),
  },
  server: {
    port: 3000,
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
  ],
});
