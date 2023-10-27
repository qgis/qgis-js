#!/usr/bin/env -S node_modules/.bin/vite-node --script

import { dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";

import {
  CommandLineParser,
  CommandLineAction,
  CommandLineFlagParameter,
  CommandLineChoiceParameter,
} from "@rushstack/ts-command-line";

import "zx/globals";

type BuildType = "Dev" | "Release" | "Debug";

const CMakeCacheFile = "build/wasm/CMakeCache.txt";

process.env.FORCE_COLOR = "1";

export interface QgisJsOptions {
  verbose: boolean;
}

const options: QgisJsOptions = {} as QgisJsOptions;

export class QgisJsCommandLine extends CommandLineParser {
  public constructor() {
    super({
      toolFilename: "qgis-js",
      toolDescription: 'The "qgis-js" build tool.',
    });
    this.addAction(new CleanAction());
    this.addAction(new InstallAction());
    this.addAction(new CompileAction());
  }

  protected onDefineParameters(): void {
    this.defineFlagParameter({
      parameterLongName: "--verbose",
      parameterShortName: "-v",
      description: "Show extra logging detail",
    });
  }

  protected onExecute(): Promise<void> {
    options.verbose = this.getFlagParameter("--verbose")?.value || false;
    return super.onExecute();
  }
}

export class CleanAction extends CommandLineAction {
  public constructor() {
    super({
      actionName: "clean",
      summary: "Clean qgis-js build tree",
      documentation: `Cleans emsdk, vcpkg and the qgis-js build tree in "build/wasm".`,
    });
  }

  protected onExecute(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      const v = options.verbose;

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

export class InstallAction extends CommandLineAction {
  public constructor() {
    super({
      actionName: "install",
      summary: "Installs tools and downloads dependency sources",
      documentation: `Installs emsdk and vcpkg and then downlaods the source code of all ports with vcpkg.`,
    });
  }

  protected onExecute(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      const v = options.verbose;

      if (v) console.log(`- installing emsdk`);
      // read engine "emsdk" from package.json
      const emsdkVersion = JSON.parse(fs.readFileSync("package.json", "utf-8"))
        .engines.emsdk;
      if (!emsdkVersion || emsdkVersion === "")
        throw new Error(`"emsdk" version not found in package.json`);
      await $`(cd build/emsdk && ./emsdk install ${emsdkVersion} && ./emsdk activate ${emsdkVersion})`;

      if (v) console.log(`\n- installing vcpkg`);
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

export class CompileAction extends CommandLineAction {
  private _buildType!: CommandLineChoiceParameter;
  private _debug!: CommandLineFlagParameter;

  public constructor() {
    super({
      actionName: "compile",
      summary: "Compiles qgis-js",
      documentation:
        "Uses emsdk, vcpkg and CMake to configure and build qgis-js.",
    });
  }

  protected onDefineParameters(): void {
    this._debug = this.defineFlagParameter({
      parameterLongName: "--debug",
      parameterShortName: "-d",
      description:
        "Prints debug information during build (and runs the compilation single threaded)",
    });

    this._buildType = this.defineChoiceParameter({
      parameterLongName: "--builde-type",
      parameterShortName: "-t",
      description: "Specify the CMake build type",
      alternatives: ["Dev", "Release", "Debug"],
      environmentVariable: "QGIS_JS_BUILD_TYPE",
      defaultValue: "Dev" as BuildType,
    });
  }

  protected onExecute(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      const v = options.verbose;

      const home = homedir();
      const repo = dirname(fileURLToPath(import.meta.url));

      const buildType = (this._buildType.value || "Dev") as BuildType;
      const debug = this._debug.value || false;

      if (v) console.log("Build Type:", buildType);

      // check if CMakeCache.txt needs to be regenerated
      if (fs.existsSync(CMakeCacheFile)) {
        if (v)
          console.log(
            `"${CMakeCacheFile}" exists, checking if it has to be regenerated`,
          );
        const lastBuild = await lastBuildType();
        if (lastBuild === buildType) {
          if (v)
            console.log(
              `Build type has not changed, skipping regenerating of ${CMakeCacheFile}`,
            );
        } else {
          if (v)
            console.log(
              `Build type has changed, regenerating ${CMakeCacheFile}`,
            );
          await $`rm ${CMakeCacheFile}`;

          if (v)
            console.log(`Build type has changed, removing build artifacts`);
          const artifacts = await glob(["build/wasm/{qt*,qgis-js*}"]);
          if (artifacts.length > 0) await $`rm ${artifacts}`;
        }
      } else {
        if (v) console.log(`"${CMakeCacheFile}" does not exist`);
      }

      // set qgis-js internal environment variables
      process.env.QGIS_JS_VCPKG = `${repo}/build/vcpkg`;
      process.env.QGIS_JS_EMSDK = `${repo}/build/emsdk`;
      process.env.QGIS_JS_QT = `${home}/Qt/6.5.2`;

      // set environment variables for CMake
      process.env.QT_HOST_PATH = `${process.env.QGIS_JS_QT}/gcc_64`;
      process.env.Qt6_DIR = `${process.env.QGIS_JS_QT}/wasm_multithread`;
      process.env.VCPKG_BINARY_SOURCES = "clear";
      if (debug) {
        process.env.VERBOSE = "1";
        process.env.EMCC_DEBUG = "1";
      }

      // configure and build vcpgk dependencies
      await $`${await vcpkgTool("cmake-*/*/bin/cmake")} \
-S . \
-B build/wasm \
-G Ninja \
-DCMAKE_TOOLCHAIN_FILE=${
        process.env.QGIS_JS_VCPKG
      }/scripts/buildsystems/vcpkg.cmake \
-DVCPKG_CHAINLOAD_TOOLCHAIN_FILE=${repo}/build/vcpkg-toolchains/qgis-js.cmake \
-DVCPKG_OVERLAY_TRIPLETS=./build/vcpkg-triplets \
-DVCPKG_OVERLAY_PORTS=./build/vcpkg-ports \
-DVCPKG_TARGET_TRIPLET=wasm32-emscripten-qt-threads \
-DCMAKE_BUILD_TYPE=${buildType !== "Dev" ? buildType : ""}`;

      // build
      await $`cmake --build build/wasm`;

      resolve();
    });
  }
}

async function lastBuildType(): Promise<BuildType | undefined> {
  const CMakeCacheFileContents = fs.readFileSync(CMakeCacheFile, "utf-8");
  if (!CMakeCacheFileContents || CMakeCacheFileContents.length === 0)
    return undefined;
  const match = CMakeCacheFileContents.match(/CMAKE_BUILD_TYPE:STRING=(\w+)/);
  return (match ? match[1] : "Dev") as BuildType;
}

async function vcpkgTool(globPattern: string): Promise<string> {
  const matches = await glob(
    process.env.QGIS_JS_VCPKG + "/downloads/tools/" + globPattern,
  );
  if (matches && matches.length > 0) {
    return matches[0];
  } else {
    throw new Error(
      `vcpkg tool ${globPattern} not found.\n\nDid you run "qgis-js install"?\n\n`,
    );
  }
}

const qgisjs = new QgisJsCommandLine();
qgisjs.execute();
