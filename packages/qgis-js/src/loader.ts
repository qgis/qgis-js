import { getQgisApiProxy } from "./QgisApiAdapter";

import { QgisRuntime, QgisRuntimeConfig, QtRuntimeFactory } from "./runtime";
import { EmscriptenRuntimeModule } from "./emscripten";

export function loadModule(prefix: string = "/"): Promise<QtRuntimeFactory> {
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

export async function qgis(config: QgisRuntimeConfig): Promise<QgisRuntime> {
  return new Promise(async (resolve) => {
    const { createQtAppInstance } = await loadModule(config.prefix);

    const canvas = document.querySelector("#screen") as HTMLDivElement | null;

    const runtimePromise = createQtAppInstance({
      locateFile: (path: string) => `${config.prefix}/` + path,
      preRun: [
        function (module: any) {
          module.qtContainerElements = [canvas];
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
      /*
        setStatus: function (statusText: string) {
          console.log(statusText);
        },
        */
    });
  });
}
