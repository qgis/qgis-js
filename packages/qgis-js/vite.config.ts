import { resolve } from "path";
import { defineConfig } from "vite";

import QgisRuntimePlugin from "../../build/vite/QgisRuntimePlugin";

import dts from "vite-plugin-dts";

import packageJson from "./package.json";

export default defineConfig({
  define: {
    __QGIS_JS_VERSION: JSON.stringify(packageJson.version),
  },
  plugins: [
    QgisRuntimePlugin({
      name: "qgis-js",
      outputDir: "build/wasm",
    }),
    dts({
      copyDtsFiles: true,

      staticImport: true,
      // insertTypesEntry: true,
      compilerOptions: {
        declarationMap: true,
      },

      rollupTypes: true,
      entryRoot: "src",
      rollupConfig: {
        docModel: {
          enabled: true,
          apiJsonFilePath: "<projectFolder>/etc/<unscopedPackageName>.api.json",
        },
      },
      async afterBuild() {
        // remove empty export statement
        const fs = await import("fs");
        const path = await import("path");
        const dtsFile = path.join(__dirname, "dist", "qgis.d.ts");
        let content = fs.readFileSync(dtsFile, "utf-8");
        content = content.replace("export { }", "");

        // format file with prettier
        const prettier = await import("prettier");
        const prettierConfig = await prettier.resolveConfig(
          path.join(__dirname, "../..", ".prettierrc.json"),
        );

        content = await prettier.format(content, {
          ...prettierConfig,
          parser: "typescript",
        });

        fs.writeFileSync(dtsFile, content);
        return;
      },
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
