import { EmscriptenRuntimeModule, EmscriptenFS } from "./emscripten";

import { InternalQgisApi } from "./api/internal";
import { QgisApi } from "./api/public";

import type { QgisOpenLayers } from "./ol/QgisOl";

/**
 * Qt emscripten runtime module that implements the QgisInternalApi
 *
 * @Internal
 */
export interface QgisRuntimeModule
  extends EmscriptenRuntimeModule,
    InternalQgisApi {}

export interface QtAppConfig {}

export interface QtRuntimeFactory {
  mainScriptSource: string;
  createQtAppInstance(config: QtAppConfig): Promise<QgisRuntimeModule>;
}

export interface QgisRuntimeConfig {
  prefix?: string;
}

export interface QgisRuntime {
  api: QgisApi;
  module: EmscriptenRuntimeModule;
  fs: EmscriptenFS;
  ol(): Promise<QgisOpenLayers | undefined>;
}
