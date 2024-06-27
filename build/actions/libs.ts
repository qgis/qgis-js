import {
  CommandLineAction,
  CommandLineChoiceParameter,
} from "@rushstack/ts-command-line";

import "zx/globals";
import { QgisJsOptions } from "./lib/QgisJsOptions";

export class LibsAction extends CommandLineAction {
  private _options: QgisJsOptions;
  private _output!: CommandLineChoiceParameter;

  public constructor(options: QgisJsOptions) {
    super({
      actionName: "libs",
      summary: "List the vcpkg libraries",
      documentation: `Generates a list of all vcpkg libraries with version and license.`,
    });
    this._options = options;
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
      $.verbose = this._options.verbose;

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
