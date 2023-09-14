import type { Plugin } from "vite";

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
