import { dirname } from "path";
import { fileURLToPath } from "url";

import {
  CommandLineAction,
  CommandLineChoiceParameter,
  CommandLineFlagParameter,
} from "@rushstack/ts-command-line";

import { BuildType } from "./lib/BuildType";
import { QgisJsOptions } from "./lib/QgisJsOptions";

import "zx/globals";

const CMakeCacheFile = "build/wasm/CMakeCache.txt";

export class CompileAction extends CommandLineAction {
  private _options: QgisJsOptions;

  private _buildType!: CommandLineChoiceParameter;
  private _debug!: CommandLineFlagParameter;

  public constructor(options: QgisJsOptions) {
    super({
      actionName: "compile",
      summary: "Compiles qgis-js",
      documentation:
        "Uses emsdk, vcpkg and CMake to configure and build qgis-js.",
    });
    this._options = options;
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
    return new Promise<void>(async (resolve, reject) => {
      const v = this._options.verbose;
      $.verbose = true;

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

      // set environment variables for CMake
      process.env.VCPKG_BINARY_SOURCES = "clear";
      if (debug) {
        process.env.VERBOSE = "1";
        process.env.EMCC_DEBUG = "1";
      }

      // if vcpkg has installed its own cmake, use that, otherwise use the system cmake
      const cmake =
        await $`find . -iwholename './build/vcpkg/downloads/tools/cmake-*/*/bin/cmake' | grep bin/cmake || echo cmake`;

      // configure and build vcpgk dependencies
      try {
        await $`${cmake} \
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
        await $`${cmake} --build build/wasm`;
      } catch (error) {
        reject(error);
        return;
      }

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
