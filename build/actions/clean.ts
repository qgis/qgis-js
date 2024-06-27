import { CommandLineAction } from "@rushstack/ts-command-line";

import { QgisJsOptions } from "./lib/QgisJsOptions";

import "zx/globals";

export class CleanAction extends CommandLineAction {
  private _options: QgisJsOptions;

  public constructor(options: QgisJsOptions) {
    super({
      actionName: "clean",
      summary: "Clean qgis-js build tree",
      documentation: `Cleans emsdk, vcpkg and the qgis-js build tree in "build/wasm".`,
    });
    this._options = options;
  }

  protected onExecute(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      const v = this._options.verbose;
      $.verbose = this._options.verbose;

      if (v) console.log(`- cleaning build/emsdk`);
      await $`(cd build/emsdk && git clean -xfd)`;

      if (v) console.log(`\n- cleaning build/vcpkg`);
      await $`(cd build/vcpkg && git clean -xfd)`;

      if (v) console.log(`\n- cleaning build/wasm`);
      await $`(rm -rf build/wasm && mkdir build/wasm)`;

      if (v) console.log(`\n`);
      resolve();
    });
  }
}
