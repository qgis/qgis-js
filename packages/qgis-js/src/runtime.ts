import { EmscriptenRuntimeModule, EmscriptenFS } from "./emscripten";

import { QgisApi, InternalQgisApi } from "../../../src/api/QgisApi";

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
  createQtAppInstance(config: QtAppConfig): Promise<QgisRuntimeModule>;
}

export interface QgisRuntimeConfig {
  prefix?: string;
}

export interface QgisRuntime {
  api: QgisApi;
  module: EmscriptenRuntimeModule;
  fs: EmscriptenFS;
}
