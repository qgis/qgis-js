#!/usr/bin/env -S node_modules/.bin/vite-node --script

import "zx/globals";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";

type BuildType = "Dev" | "Release" | "Debug";

const CMakeCacheFile = "build/wasm/CMakeCache.txt";

void (async function () {
  const home = homedir();
  const repo = dirname(fileURLToPath(import.meta.url));

  const buildType = (argv.buildType || "Dev") as BuildType;
  const verbose = argv.verbose || false;
  const debug = argv.debug || false;

  if (verbose) console.log("Build Type:", buildType);

  // check if CMakeCache.txt needs to be regenerated
  if (fs.existsSync(CMakeCacheFile)) {
    if (verbose)
      console.log(
        `"${CMakeCacheFile}" exists, checking if it has to be regenerated`,
      );

    const lastBuild = await lastBuildType();
    if (lastBuild === buildType) {
      if (verbose)
        console.log(
          `Build type has not changed, skipping regenerating of ${CMakeCacheFile}`,
        );
    } else {
      if (verbose)
        console.log(`Build type has changed, regenerating ${CMakeCacheFile}`);
      await $`rm ${CMakeCacheFile}`;

      if (verbose)
        console.log(`Build type has changed, removing build artifacts`);
      const artifacts = await glob(["build/wasm/{qt*,qgis-js*}"]);
      if (artifacts.length > 0) await $`rm ${artifacts}`;
    }
  }

  // set qgis-js internal environment variables
  process.env.QGIS_JS_VCPKG = `${repo}/build/vcpkg`;
  process.env.QGIS_JS_EMSDK = `${repo}/build/emsdk`;
  process.env.QGIS_JS_QT = `${home}/Qt/6.5.2`;

  // set environment variables for CMake
  process.env.QT_HOST_PATH = `${process.env.QGIS_JS_QT}/gcc_64`;
  process.env.Qt6_DIR = `${process.env.QGIS_JS_QT}/wasm_multithread`;
  process.env.VCPKG_BINARY_SOURCES = "clear";
  process.env.FORCE_COLOR = "1";
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
})();

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
    throw new Error(`vcpkg tool ${globPattern} not found`);
  }
}
