import type { Plugin } from "vite";

/**
 * Creates a Vite plugin that adds the given headers to all responses of the server.
 */
export default function ResponseHeadersPlugin(
  name: string,
  headers: Record<string, string>,
  enforce?: Plugin["enforce"],
): Plugin {
  return {
    name,
    enforce,
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        Object.entries(headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        next();
      });
    },
  };
}
