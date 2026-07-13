import type { Plugin } from "vite";

import ResponseHeadersPlugin from "./ResponseHeadersPlugin";

export const CrossOriginIsolationResponseHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

/**
 * A Vite plugin that adds Cross-Origin Isolation headers to the server responses.
 */
export default function CrossOriginIsolationPlugin(): Plugin {
  return ResponseHeadersPlugin(
    "CrossOriginIsolationPlugin",
    CrossOriginIsolationResponseHeaders,
  );
}
