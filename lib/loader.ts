/// <reference types="emscripten" />

import { QgisApi, QgisApiAdapter, QgisInternalApi } from "./api";

/**
 * Extension of a EmscriptenModule that adds additional properties
 */
export interface EmscriptenRuntimeModule extends EmscriptenModule {
  [x: string]: any;
}

export type EmscriptenFS = typeof FS;

/**
 * Qt emscripten runtime module that implements the QgisInternalApi
 */
export interface QgisRuntimeModule
  extends EmscriptenRuntimeModule,
    QgisInternalApi {}

export interface QtRuntimeFactory {
  mainScriptSource: string;
  // TODO add a proper type for the config
  createQtAppInstance(config: any): Promise<QgisRuntimeModule>;
}

export interface QgisRuntime {
  api: QgisApi;
  module: QgisRuntimeModule;
  fs: EmscriptenFS;
}

export function loadModule(prefix: string = "/"): Promise<QtRuntimeFactory> {
  return new Promise(async (resolve, reject) => {
    try {
      const mainScriptSource = await (
        await fetch(prefix + "/" + "test_vcpkg.js")
      ).text();
      if (!mainScriptSource || mainScriptSource.length === 0) {
        throw new Error("Failed to load main script");
      }

      // Qt will not pass -s EXPORT_ES6 (https://emsettings.surma.technology/#EXPORT_ES6),
      // this is a hack to make it work anyway by adding the export of the createQtAppInstance function
      const mainScriptModule =
        mainScriptSource + "\n\n" + `export { createQtAppInstance };`;
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

export interface QgisRuntimeConfig {
  prefix?: string;
}

export async function boot(config: QgisRuntimeConfig): Promise<QgisRuntime> {
  return new Promise(async (resolve, reject) => {
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
            module: runtime,
            fs: runtime.fs,
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
