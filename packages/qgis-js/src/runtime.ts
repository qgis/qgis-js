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
  onStatus?: (status: string) => void;
}

export interface QgisRuntime {
  api: QgisApi;
  module: EmscriptenRuntimeModule;
  fs: EmscriptenFS;
}

/**
 * Returns the thread pool size based on the hardware concurrency of the user's device.
 * The thread pool size is capped between a minium of 4 and a maximum 16 threads.
 *
 * @privateRemarks This needs to be in sync with PTHREAD_POOL_SIZE in CMakeLists.txt
 *
 * @returns The thread pool size of the qgis-js runtime
 */
export function threadPoolSize() {
  const MINIMAL_THREAD_POOL_SIZE = 4;
  const MAXIMAL_THREAD_POOL_SIZE = 8;
  return Math.min(
    Math.max(
      navigator?.hardwareConcurrency || MINIMAL_THREAD_POOL_SIZE,
      MINIMAL_THREAD_POOL_SIZE,
    ),
    MAXIMAL_THREAD_POOL_SIZE,
  );
}
