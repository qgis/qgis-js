import { resolve } from "path";
import { defineConfig } from "vite";

import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      entryRoot: "src",
    }),
  ],
  build: {
    lib: {
      entry: [resolve(__dirname, "src/index.ts")],
      name: "qgis-js-utils",
      formats: ["es"],
      fileName: "qgis-js-utils",
    },
    rollupOptions: {
      external: ["qgis-js", "public/projects"],
    },
  },
});
