#!/usr/bin/env -S node_modules/.bin/vite-node --script

/*
 * qgis-js CLI
 *
 * Will help you to build qgis-js and generate its documentation.
 *
 * Run "qgis-js --help" for more information.
 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";

import type { BrotliCompress, Gzip } from "zlib";

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
    this.addAction(new LibsAction());
    this.addAction(new SizeAction());
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

      resolve();
    });
  }
}

export class LibsAction extends CommandLineAction {
  private _output!: CommandLineChoiceParameter;

  public constructor() {
    super({
      actionName: "libs",
      summary: "List the vcpkg libraries",
      documentation: `Generates a list of all vcpkg libraries with version and license.`,
    });
  }

  protected onDefineParameters(): void {
    this._output = this.defineChoiceParameter({
      parameterLongName: "--output",
      parameterShortName: "-o",
      description: "Specify the commands output type",
      alternatives: ["json", "markdown"],
      environmentVariable: "QGIS_JS_LIBS_OUTPUT",
      defaultValue: "json",
    });
  }

  protected onExecute(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      $.verbose = false;
      const vcpgkPortList = JSON.parse(
        "" +
          (await $`./build/vcpkg/vcpkg list \
      --x-install-root=build/wasm/vcpkg_installed \
      --overlay-triplets=build/vcpkg-triplets \
      --overlay-ports=build/vcpkg-ports \
      --triplet wasm32-emscripten-qt-threads \
      --x-full-desc \
      --x-json`),
      );

      const custom = {
        qt6: {
          license: "LGPL-3.0",
          website: "https://www.qt.io/",
          source: "https://github.com/qt/qtbase",
        },
        "qgis-qt6": {
          license: "GPL-2.0",
          website: "https://www.qgis.org/",
          source: "https://github.com/qgis/QGIS",
        },
        "qca-qt6": {
          license: "LGPL-2.1",
          website: "https://userbase.kde.org/QCA",
          source: "https://github.com/KDE/qca",
        },
      } as any;

      const libs = await Promise.all(
        Object.entries(vcpgkPortList)
          .filter(([key]) => key.endsWith("wasm32-emscripten-qt-threads"))
          .map<
            Promise<{
              name: string;
              version: string;
              description: string;
              website?: string;
              license?: string;
              source?: string;
            }>
          >(
            ([, value]) =>
              new Promise(async (resolve) => {
                const vcpgkPort = value as any;
                const response = await fetch(
                  `https://vcpkg.link/ports/${vcpgkPort["package_name"]}.json`,
                );
                if (response.status === 200) {
                  const vcpkgLink = await response.json();
                  resolve({
                    name: vcpgkPort["package_name"].replace(/-qt6$/, ""),
                    version: vcpgkPort["version"],
                    description: vcpgkPort["desc"].join("\n"),
                    website: vcpkgLink["homepage_href"],
                    license: vcpkgLink["license"],
                    source: vcpkgLink["repository"]?.["href"],
                  });
                } else {
                  if (vcpgkPort["package_name"] in custom) {
                    resolve({
                      name: vcpgkPort["package_name"].replace(/-qt6$/, ""),
                      version: vcpgkPort["version"],
                      description: vcpgkPort["desc"].join("\n"),
                      website: custom[vcpgkPort["package_name"]]["website"],
                      license: custom[vcpgkPort["package_name"]]["license"],
                      source: custom[vcpgkPort["package_name"]]["source"],
                    });
                  } else {
                    throw new Error("Could not find", vcpgkPort);
                  }
                }
              }),
          ),
      );
      if (this._output.value === "json") {
        console.log(JSON.stringify(libs, null, 2));
      } else if (this._output.value === "markdown") {
        const { tsMarkdown } = await import("ts-markdown");
        const rows = libs.map((lib) => ({
          Library:
            `**${lib.name}**` +
            (lib.version ? ` (${lib.version})` : "") +
            (lib.description
              ? `<br /><div style="max-width:30em">_${lib.description}_`
              : ""),
          License: lib.license || "",
          Links:
            [
              ...(lib.website ? [`[Website](${lib.website})`] : []),
              ...(lib.source ? [`[Source code](${lib.source})`] : []),
            ].join(" - ") || "",
        }));
        const table = {
          table: {
            columns: [
              { name: "Library" },
              { name: "License" },
              { name: "Links" },
            ],
            rows,
          },
        };
        console.log(tsMarkdown([table]));
      }
      resolve();
    });
  }
}

export class SizeAction extends CommandLineAction {
  private _output!: CommandLineChoiceParameter;

  public constructor() {
    super({
      actionName: "size",
      summary: "Measure the size of qgis-js",
      documentation: `Generates a list of all qgis-js assets and checks the compression ratio with "gzip" and "brotli".`,
    });
  }

  protected onDefineParameters(): void {
    this._output = this.defineChoiceParameter({
      parameterLongName: "--output",
      parameterShortName: "-o",
      description: "Specify the commands output type",
      alternatives: ["json", "markdown"],
      environmentVariable: "QGIS_JS_SIZE_OUTPUT",
      defaultValue: "json",
    });
  }

  protected onExecute(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      $.verbose = false;

      const fs = await import("fs");
      const zlib = await import("zlib");

      function measureCompression(
        filePath: string,
        compressionStream: BrotliCompress | Gzip,
      ) {
        return new Promise<number>((resolve, reject) => {
          let compressedSize = 0;
          const fileStream = fs.createReadStream(filePath);
          fileStream.pipe(compressionStream);
          compressionStream.on("data", (chunk) => {
            compressedSize += chunk.length;
          });
          compressionStream.on("end", () => {
            resolve(compressedSize);
          });
          fileStream.on("error", reject);
          compressionStream.on("error", reject);
        });
      }

      function humanFileSize(size: number) {
        const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        return (
          Number((size / Math.pow(1024, i)).toFixed(2)) +
          " " +
          ["B", "kB", "MB", "GB", "TB"][i]
        );
      }

      function spaceSaving(originalSize: number, compressedSize: number) {
        return Math.round((1 - compressedSize / originalSize) * 100);
      }

      const distDir = "packages/qgis-js/dist";

      const files = [
        "qgis.js",
        "assets/wasm/qgis-js.js",
        "assets/wasm/qgis-js.worker.js",
        "assets/wasm/qgis-js.data",
        "assets/wasm/qgis-js.wasm",
      ];

      const filesSize = {} as {
        [key: string]: {
          bytes: number;
          bytesGzip: number;
          bytesBrotli: number;
        };
      };

      for (const filename of files) {
        const filePath = `${distDir}/${filename}`;
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          filesSize[filename] = {
            bytes: stat.size,
            bytesGzip: await measureCompression(filePath, zlib.createGzip()),
            bytesBrotli: await measureCompression(
              filePath,
              zlib.createBrotliCompress({
                params: {
                  // zlib.constants.BROTLI_DEFAULT_QUALITY is 11, which is too slow for stream compression,
                  // so we use the defaul from Apache httpd which is 5
                  // see https://httpd.apache.org/docs/2.4/mod/mod_brotli.html#brotlicompressionquality
                  [zlib.constants.BROTLI_PARAM_QUALITY]: 5,
                },
              }),
            ),
          };
        }
      }

      const total = Object.entries(filesSize).reduce(
        (acc: any, [, value]) => {
          acc.bytes += value.bytes;
          acc.bytesGzip += value.bytesGzip;
          acc.bytesBrotli += value.bytesBrotli;
          return acc;
        },
        {
          bytes: 0,
          bytesGzip: 0,
          bytesBrotli: 0,
        },
      );

      if (this._output.value === "json") {
        console.log(
          JSON.stringify(
            {
              total,
              files: filesSize,
            },
            null,
            2,
          ),
        );
      } else if (this._output.value === "markdown") {
        const { tsMarkdown } = await import("ts-markdown");

        console.log(
          `The size of the package is **\`${humanFileSize(
            total.bytes,
          )}\`** (uncompressed) or \`${humanFileSize(
            total.bytesBrotli,
          )}\` Brotli compressed (${spaceSaving(
            total.bytes,
            total.bytesBrotli,
          )}% space saving) / \`${humanFileSize(
            total.bytesGzip,
          )}\` Gzip compressed (${spaceSaving(
            total.bytes,
            total.bytesGzip,
          )}% space saving)`,
        );
        console.log("");
        console.log("It consists of the following files:");
        console.log("");

        const rows = Object.entries(filesSize).map(([file, size]) => ({
          "File name": `\`${file}\``,
          "Size (uncompressed)": `\`${humanFileSize(size.bytes)}\``,
          "Size (Brotli compressed)": `\`${humanFileSize(
            size.bytesBrotli,
          )}\` (${spaceSaving(size.bytes, size.bytesBrotli)}% space saving)`,
          "Size (Gzip compressed)": `\`${humanFileSize(
            size.bytesGzip,
          )}\` (${spaceSaving(size.bytes, size.bytesGzip)}% space saving)`,
        }));
        const table = {
          table: {
            columns: [
              { name: "File name" },
              { name: "Size (uncompressed)" },
              { name: "Size (Brotli compressed)" },
              { name: "Size (Gzip compressed)" },
            ],
            rows,
          },
        };
        console.log(tsMarkdown([table]));
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
