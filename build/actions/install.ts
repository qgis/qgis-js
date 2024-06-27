import { CommandLineAction } from "@rushstack/ts-command-line";

import { QgisJsOptions } from "./lib/QgisJsOptions";

import "zx/globals";

export class InstallAction extends CommandLineAction {
  private _options: QgisJsOptions;

  public constructor(options: QgisJsOptions) {
    super({
      actionName: "install",
      summary: "Installs tools and downloads dependency sources",
      documentation: `Installs emsdk and vcpkg and then downlaods the source code of all ports with vcpkg.`,
    });
    this._options = options;
  }

  protected onExecute(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      const v = this._options.verbose;
      $.verbose = true;

      if (v) console.log(`- installing emsdk`);
      // ensure git submodule is initialized
      await $`git submodule update --init build/emsdk`;
      // read engine "emsdk" from package.json
      const emsdkVersion = JSON.parse(fs.readFileSync("package.json", "utf-8"))
        .engines.emsdk;
      if (!emsdkVersion || emsdkVersion === "")
        throw new Error(`"emsdk" version not found in package.json`);
      await $`(cd build/emsdk && ./emsdk install ${emsdkVersion} && ./emsdk activate ${emsdkVersion})`;

      if (v) console.log(`\n- installing vcpkg`);
      // ensure git submodule is initialized
      await $`git submodule update --init build/vcpkg`;
      // bootstrap vcpkg
      await $`./build/vcpkg/bootstrap-vcpkg.sh -disableMetrics`;

      if (v) console.log(`\n- running vcpkg install`);
      await $`./build/vcpkg/vcpkg install \
--x-install-root=build/wasm/vcpkg_installed \
--only-downloads \
--overlay-triplets=build/vcpkg-triplets \
--overlay-ports=build/vcpkg-ports \
--triplet wasm32-emscripten-qt-threads`;

      if (v) console.log(`\n`);
      resolve();
    });
  }
}
