import { join, resolve } from "path";
import { existsSync, readFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

import type { Plugin, ResolvedConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

const RUNTIME_JS = "js";
const RUNTIME_WORKER = "worker.js";
const RUNTIME_WASM = "wasm";
const RUNTIME_WASM_MAP = "wasm.map";
const RUNTIME_WASM_DEBUG = "wasm.debug.wasm";
const RUNTIME_DATA = "data";

export const BASE_DIR = "wasm";

export interface Runtime {
  name: string;
  outputDir: string;
}

export default function QgisRuntimePlugin(_runtime: Runtime | null): Plugin {
  let runtime: Runtime;
  if (_runtime === null) {
    throw new Error("QgisRuntimePlugin: No runtime specified");
  } else {
    runtime = _runtime;
  }

  let config: ResolvedConfig;
  let runtimeDir = () => `${config.build.assetsDir}/${BASE_DIR}`;

  const repoRoot = resolve(__dirname, "../");

  function file(ending: string) {
    return `${runtime.name}.${ending}`;
  }

  const fileRuntimeJs = file(RUNTIME_JS);
  const fileRuntimeWorker = file(RUNTIME_WORKER);
  const fileRuntimeWasm = file(RUNTIME_WASM);
  const fileRuntimeWasmMap = file(RUNTIME_WASM_MAP);
  const fileRuntimeWasmDebug = file(RUNTIME_WASM_DEBUG);
  const fileRuntimeData = file(RUNTIME_DATA);

  const filesRuntime = [
    fileRuntimeJs,
    fileRuntimeWorker,
    fileRuntimeWasmMap,
    fileRuntimeWasmDebug,
    fileRuntimeWasm,
    fileRuntimeData,
  ];

  return {
    name: "QgisRuntimePlugin",
    enforce: "pre",
    configResolved(_config) {
      config = _config;
    },
    configureServer(server) {
      return () => {
        const filesRuntimeDir = runtimeDir();
        filesRuntime.forEach((id) => {
          server.middlewares.use(
            `/${filesRuntimeDir ? filesRuntimeDir + "/" : ""}` + id,
            (_, res) => {
              const filePath = join(repoRoot, runtime.outputDir, id);
              if (existsSync(filePath)) {
                const raw = readFileSync(filePath);
                res.statusCode = 200;
                if (
                  filePath.endsWith("." + RUNTIME_WASM) ||
                  filePath.endsWith("." + RUNTIME_DATA)
                ) {
                  if (filePath.endsWith("." + RUNTIME_WASM)) {
                    res.setHeader("Content-Type", "application/wasm");
                  }
                  res.end(raw);
                } else if (
                  filePath.endsWith("." + RUNTIME_JS) ||
                  filePath.endsWith("." + RUNTIME_WORKER)
                ) {
                  const content = raw.toString();
                  res.setHeader("Content-Type", "application/javascript");
                  res.end(content);
                } else if (filePath.endsWith("." + RUNTIME_WASM_MAP)) {
                  const content = raw.toString();
                  res.setHeader("Content-Type", "application/json");
                  res.end(content);
                }
              } else {
                console.log("404", filePath);
                res.statusCode = 404;
                res.end();
              }
            },
          );
        });
      };
    },
    generateBundle() {
      filesRuntime.forEach((id) => {
        const filesRuntimeDir = runtimeDir();
        const filePath = join(repoRoot, runtime.outputDir, id);
        if (existsSync(filePath)) {
          const raw = readFileSync(filePath);
          this.emitFile({
            fileName: `${filesRuntimeDir ? filesRuntimeDir + "/" : ""}${id}`,
            type: "asset",
            source: raw as Uint8Array,
          });
        }
      });
    },
  };
}
