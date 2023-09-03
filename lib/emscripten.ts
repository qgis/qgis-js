/// <reference types="emscripten" />

/**
 * Extension of a EmscriptenModule that adds additional properties
 *
 * @public
 */
export interface EmscriptenRuntimeModule extends EmscriptenModule {
  [x: string]: any;
}

/**
 * Emscripten file system
 *
 * @link https://emscripten.org/docs/api_reference/Filesystem-API.html
 * @public
 */
export type EmscriptenFS = typeof FS;
