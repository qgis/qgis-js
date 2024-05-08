import { getQgisApiProxy } from "./QgisApiAdapter";

import { threadPoolSize } from "./runtime";
import type {
  QgisRuntime,
  QgisRuntimeConfig,
  QgisRuntimeModule,
} from "./runtime";

import type { EmscriptenRuntimeModule } from "./emscripten";

/**
 * Emscripten module configuration
 */
interface QtAppConfig {}

/**
 * Interface for a Emscripten module that creates a Qt app instance.
 */
interface QtRuntimeFactory {
  createQtAppInstance(config: QtAppConfig): Promise<QgisRuntimeModule>;
}

/**
 * Loads the QtRuntimeFactory Emscripten module with the given prefix.
 *
 * @param mainScriptPath - The import path of the main script
 * @returns A promise that resolves with the QtRuntimeFactory module.
 */
function loadModule(mainScriptPath: string): Promise<QtRuntimeFactory> {
  return new Promise(async (resolve, reject) => {
    try {
      // hack to import es module without vite knowing about it
      const createQtAppInstance = (
        await new Function(`return import("${mainScriptPath}")`)()
      ).default;
      resolve({
        createQtAppInstance,
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Load and initialize a new qgis-js runtime.
 *
 * @param config The {@link QgisRuntimeConfig} that will be taken into account during loading and initialization.
 * @returns A promise that resolves to a {@link QgisRuntime}.
 */
export async function qgis(
  config: QgisRuntimeConfig = {},
): Promise<QgisRuntime> {
  return new Promise(async (resolve, reject) => {
    let prefix: string | undefined = undefined;
    if (config.prefix) {
      prefix = config.prefix;
    } else {
      const url = import.meta.url;
      if (/.*\/src\/loader\.[ts|js]\?*[^/]*$/.test(url)) {
        console.warn(
          [
            `qgis-js loader is running in development mode and no "prefix" seems to be configured.`,
            ` - Consider adding the QgisRuntimePlugin when bundling with Vite.`,
            ` - For more information see: https://github.com/qgis/qgis-js/blob/main/docs/bundling.md`,
          ].join("\n"),
        );
        if (typeof window !== "undefined") {
          prefix = new URL("assets/wasm", window.location.href).pathname;
        }
      } else {
        prefix = new URL("assets/wasm", import.meta.url).href;
      }
    }

    if (!prefix) {
      prefix = "assets/wasm";
    } else {
      prefix = prefix.replace(/\/$/, ""); // ensure no trailing slash
    }

    let qtRuntimeFactory: QtRuntimeFactory | undefined = undefined;
    try {
      const mainScriptPath = `${prefix}/qgis-js.js`;
      qtRuntimeFactory = await loadModule(mainScriptPath);
    } catch (error) {
      reject(
        new Error(`Unable to load the qgis-js.js script`, { cause: error }),
      );
      return;
    }

    const { createQtAppInstance } = qtRuntimeFactory!;

    let canvas: HTMLDivElement | undefined = undefined;
    if (typeof document !== "undefined") {
      canvas = document?.querySelector("#screen") as HTMLDivElement;
    }

    const runtimePromise = createQtAppInstance({
      locateFile: (path: string) => `${prefix}/` + path,
      preRun: [
        function (module: any) {
          module.qtContainerElements = canvas ? [canvas] : [];
          module.qtFontDpi = 96;
          module.qgisJsMaxThreads = threadPoolSize();
        },
      ],
      postRun: [
        async function () {
          const runtime = await runtimePromise;
          resolve({
            api: getQgisApiProxy(runtime),
            module: runtime as EmscriptenRuntimeModule,
            fs: runtime.FS,
          });
        },
      ],
      ...(config.onStatus ? { setStatus: config.onStatus } : {}),
    });
  });
}
