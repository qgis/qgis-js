#!/usr/bin/env -S node_modules/.bin/vite-node --script

/*
 * qgis-js CLI
 *
 * Will help you to build qgis-js and generate its documentation.
 *
 * Run "qgis-js --help" for more information.
 */

import { CommandLineParser } from "@rushstack/ts-command-line";

import { CleanAction } from "./build/actions/clean";
import { InstallAction } from "./build/actions/install";
import { CompileAction } from "./build/actions/compile";
import { LibsAction } from "./build/actions/libs";
import { SizeAction } from "./build/actions/size";

import { QgisJsOptions } from "./build/actions/lib/QgisJsOptions";

const options: QgisJsOptions = {} as QgisJsOptions;

export class QgisJsCommandLine extends CommandLineParser {
  public constructor() {
    super({
      toolFilename: "qgis-js",
      toolDescription: 'The "qgis-js" build tool.',
    });
    this.addAction(new CleanAction(options));
    this.addAction(new InstallAction(options));
    this.addAction(new CompileAction(options));
    this.addAction(new LibsAction(options));
    this.addAction(new SizeAction(options));
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

    process.env.FORCE_COLOR = "1";

    return super.onExecute();
  }
}

const qgisjs = new QgisJsCommandLine();
qgisjs.execute();
