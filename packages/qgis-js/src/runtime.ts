import { EmscriptenRuntimeModule, EmscriptenFS } from "./emscripten";

import { QgisApi, InternalQgisApi } from "../../../src/api/QgisApi";

/**
 * Qt emscripten runtime module that exposes the QgisInternalApi
 */
export interface QgisRuntimeModule
  extends EmscriptenRuntimeModule,
    InternalQgisApi {}

/**
 * Boot configuration options for the QGIS runtime.
 */
export interface QgisRuntimeConfig {
  /**
   * The prefix to use for the {@link EmscriptenRuntimeModule} path.
   */
  prefix?: string;
  /**
   * A callback function that will be called when the runtime status changes.
   */
  onStatus?: (status: string) => void;
}

/**
 * Wraps the {@link EmscriptenRuntimeModule} and exposes the {@link QgisApi} and {@link EmscriptenFS}
 */
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
