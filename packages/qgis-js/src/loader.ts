import { getQgisApiProxy } from "./QgisApiAdapter";

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
 * @param prefix - The prefix to use for the module path.
 * @returns A promise that resolves with the QtRuntimeFactory module.
 */
function loadModule(prefix: string = "/"): Promise<QtRuntimeFactory> {
  return new Promise(async (resolve, reject) => {
    try {
      const mainScriptPath = prefix + "/" + "qgis-js" + ".js";
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
export async function qgis(config: QgisRuntimeConfig): Promise<QgisRuntime> {
  return new Promise(async (resolve) => {
    const { createQtAppInstance } = await loadModule(config.prefix);

    const canvas = document.querySelector("#screen") as HTMLDivElement | null;

    const runtimePromise = createQtAppInstance({
      locateFile: (path: string) => `${config.prefix}/` + path,
      preRun: [
        function (module: any) {
          module.qtContainerElements = canvas ? [canvas] : [];
          module.qtFontDpi = 96;
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
