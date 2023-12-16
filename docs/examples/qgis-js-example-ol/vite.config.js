import { defineConfig } from "vite";

import { viteStaticCopy } from "vite-plugin-static-copy";

const headers = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

export default defineConfig({
  build: {
    target: "esnext",
  },
  plugins: [
    {
      name: "headers-after-static-copy",
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          Object.entries(headers).forEach(([key, value]) => {
            res.setHeader(key, value);
          });
          next();
        });
      },
    },
    viteStaticCopy({
      silent: true,
      targets: [
        {
          src: "node_modules/qgis-js/dist/assets/wasm/**",
          dest: "assets/wasm",
        },
      ],
    }),
  ],
  preview: {
    headers,
  },
});
