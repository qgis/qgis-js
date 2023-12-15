import type { Plugin } from "vite";

/**
 * A Vite plugin that adds Cross-Origin Isolation headers to the server responses.
 *
 * @deprecated This is no longed needed with Vite >= 5 (see https://vitejs.dev/config/preview-options.html#preview-cors)
 */
export default function CrossOriginIsolationPlugin(): Plugin {
  return {
    name: "CrossOriginIsolationPlugin",
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        next();
      });
    },
  };
}
