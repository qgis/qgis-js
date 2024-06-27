import type { BrotliCompress, Gzip } from "zlib";

import {
  CommandLineAction,
  CommandLineChoiceParameter,
} from "@rushstack/ts-command-line";

import { QgisJsOptions } from "./lib/QgisJsOptions";

import "zx/globals";

export class SizeAction extends CommandLineAction {
  private _options: QgisJsOptions;
  private _output!: CommandLineChoiceParameter;

  public constructor(options: QgisJsOptions) {
    super({
      actionName: "size",
      summary: "Measure the size of qgis-js",
      documentation: `Generates a list of all qgis-js assets and checks the compression ratio with "gzip" and "brotli".`,
    });
    this._options = options;
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
      $.verbose = this._options.verbose;

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
