import type { Plugin } from "vite";

export const CrossOriginIsolationResponseHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

/**
 * A Vite plugin that adds Cross-Origin Isolation headers to the server responses.
 */
export default function CrossOriginIsolationPlugin(): Plugin {
  return {
    name: "CrossOriginIsolationPlugin",
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        Object.entries(CrossOriginIsolationResponseHeaders).forEach(
          ([key, value]) => {
            res.setHeader(key, value);
          },
        );
        next();
      });
    },
  };
}
