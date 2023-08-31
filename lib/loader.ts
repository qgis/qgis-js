export async function loadModule() {
  return new Promise(async (resolve, reject) => {
    try {
      const qtloaderSource = await (await fetch("/test_vcpkg.js")).text();
      const qtloaderModule =
        qtloaderSource + "\n\n" + `export { createQtAppInstance };`;
      const encodedJs = encodeURIComponent(qtloaderModule);
      const dataUri = "data:text/javascript;charset=utf-8," + encodedJs;
      import(/* @vite-ignore */ dataUri).then((module) => {
        resolve({
          qtloaderSource,
          module,
          createQtAppInstance: module.createQtAppInstance,
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function boot() {
  return new Promise(async (resolve, reject) => {
    const module: any = await loadModule();

    const canvas = document.querySelector("#screen") as HTMLDivElement | null;

    console.dir(
      module.createQtAppInstance({
        preRun: [
          function (module: any) {
            module.qtContainerElements = [canvas];
            module.qtFontDpi = 96;
          },
        ],
        postRun: [
          function () {
            resolve({
              foo: "bar",
            });
          },
        ],
        mainScriptUrlOrBlob: new Blob([module.qtloaderSource], {
          type: "text/javascript",
        }),
        /*
        setStatus: function (statusText: string) {
          console.log(statusText);
        },
        */
      }),
    );
  });
}
