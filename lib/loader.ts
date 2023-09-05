import { QgisApiAdapter } from "./api/public";

import { QgisRuntime, QgisRuntimeConfig, QtRuntimeFactory } from "./runtime";
import { EmscriptenRuntimeModule } from "./emscripten";

import { resolveOpenLayers } from "./ol/QgisOl";

export function loadModule(prefix: string = "/"): Promise<QtRuntimeFactory> {
  return new Promise(async (resolve, reject) => {
    try {
      const mainScriptPath = prefix + "/" + "qgis-js" + ".js";
      const mainScriptSource = await (await fetch(mainScriptPath)).text();
      if (!mainScriptSource || mainScriptSource.length === 0) {
        throw new Error("Failed to load main script");
      }

      // Qt will not pass -s EXPORT_ES6 (https://emsettings.surma.technology/#EXPORT_ES6),
      // this is a hack to make it work anyway by adding the export of the createQtAppInstance function
      const mainScriptModule =
        `//# sourceURL=${mainScriptPath}` +
        mainScriptSource +
        "\n\n" +
        `export { createQtAppInstance };`;
      const encodedJs = encodeURIComponent(mainScriptModule);
      const dataUri = "data:text/javascript;charset=utf-8," + encodedJs;

      import(/* @vite-ignore */ dataUri).then((module) => {
        resolve({
          mainScriptSource,
          createQtAppInstance: module.createQtAppInstance,
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function qgis(config: QgisRuntimeConfig): Promise<QgisRuntime> {
  return new Promise(async (resolve) => {
    const { createQtAppInstance, mainScriptSource } = await loadModule(
      config.prefix,
    );

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
            api: new QgisApiAdapter(runtime),
            module: runtime as EmscriptenRuntimeModule,
            fs: runtime.FS,
            ol: async () => await resolveOpenLayers(),
          });
        },
      ],
      mainScriptUrlOrBlob: new Blob([mainScriptSource], {
        type: "text/javascript",
      }),
      /*
        setStatus: function (statusText: string) {
          console.log(statusText);
        },
        */
    });
  });
}
