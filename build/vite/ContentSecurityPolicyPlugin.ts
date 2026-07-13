import type { Plugin } from "vite";

import ResponseHeadersPlugin from "./ResponseHeadersPlugin";

/**
 * A strict Content Security Policy which does NOT allow "unsafe-eval".
 *
 * "wasm-unsafe-eval" is required to compile/instantiate WebAssembly, but unlike
 * "unsafe-eval" it does not permit JavaScript eval()/new Function().
 *
 * "unsafe-inline" is only needed for the inline scripts of the demo pages themselves
 * (and for the scripts injected by the Vite dev server), not for the qgis-js runtime.
 */
export const ContentSecurityPolicyResponseHeaders = {
  "Content-Security-Policy": [
    "script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline'",
    "worker-src 'self'",
  ].join("; "),
};

/**
 * A Vite plugin that adds a strict Content Security Policy to the server responses.
 *
 * This ensures that qgis-js keeps running in privileged environments which enforce a CSP
 * (see https://github.com/qgis/qgis-js/issues/65).
 *
 * @remarks The runtime files are served by the QgisRuntimePlugin, which sets these headers
 * itself (so that they are covered regardless of the order of the plugins).
 */
export default function ContentSecurityPolicyPlugin(): Plugin {
  return ResponseHeadersPlugin(
    "ContentSecurityPolicyPlugin",
    ContentSecurityPolicyResponseHeaders,
  );
}

// matches all the forms which a strict CSP blocks: "new Function()", "Function()" (which is
// what a minifier turns "new Function()" into), "eval()", "window.eval()" and "(0, eval)()"
const EVAL = /\bFunction\s*\(|\beval\s*\(|[(,]\s*eval\s*[),]/;

// magic comments which keep downstream bundlers from processing the runtime import
const BUNDLER_IGNORE_COMMENTS = ["@vite-ignore", "webpackIgnore"];

/**
 * A Vite plugin that fails the build if the emitted JavaScript would violate a strict CSP.
 *
 * It asserts that
 *  - no emitted script uses eval()/new Function() (which requires DYNAMIC_EXECUTION=0 and
 *    EMBIND_AOT for the Emscripten runtime, see CMakeLists.txt)
 *  - the dynamic import of the runtime keeps its magic comments, because they are what
 *    stops a downstream bundler from processing it (they have to survive minification)
 *
 * Without this check both could regress silently and would only surface downstream
 * (see https://github.com/qgis/qgis-js/issues/65).
 */
export function ContentSecurityPolicyCheckPlugin(): Plugin {
  return {
    name: "ContentSecurityPolicyCheckPlugin",
    generateBundle(_options, bundle) {
      let entryChecked = false;

      for (const [fileName, chunk] of Object.entries(bundle)) {
        const isChunk = chunk.type === "chunk";

        if (!isChunk && !/\.(js|mjs|cjs)$/.test(fileName)) continue;

        // assets are emitted as a Buffer/Uint8Array, so they have to be decoded explicitly
        // (a Uint8Array would stringify to a list of bytes and never match)
        const code = isChunk
          ? chunk.code
          : Buffer.from(chunk.source).toString("utf-8");

        if (EVAL.test(code)) {
          this.error(
            `${fileName} uses eval()/new Function(), which is blocked by a strict Content Security Policy`,
          );
        }

        // the runtime is imported by the entry, no matter how it is named
        if (isChunk && chunk.isEntry) {
          entryChecked = true;
          for (const comment of BUNDLER_IGNORE_COMMENTS) {
            if (!code.includes(comment)) {
              this.error(
                `${fileName} lost the "${comment}" comment of the runtime import (it has to survive minification, otherwise downstream bundlers will try to process the runtime)`,
              );
            }
          }
        }
      }

      // otherwise the check above would be skipped silently
      if (!entryChecked) {
        this.error(
          `No entry was emitted, so the runtime import was not checked`,
        );
      }
    },
  };
}
