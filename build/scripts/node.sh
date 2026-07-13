#!/usr/bin/env bash
set -eo pipefail

#
# Node.js wrapper for Emscripten (see EM_NODE_JS, which is set by the CMakeLists.txt)
#
# To generate the embind bindings ahead of time (EMBIND_AOT), emcc executes the linked
# module in Node.js. V8 compiles it with its baseline compiler (Liftoff), which hits a hard
# limit ("Assembler::GrowBuffer Allocation failed") on a module the size of qgis-js, because
# at this point of the link it is not optimized by wasm-opt yet. Compiling it with TurboFan
# instead is slower, but it is the only way to get through the module
# (see https://github.com/qgis/qgis-js/issues/65)
#
# NOTE: V8 flags can only be passed on the command line (Node.js rejects them in
# NODE_OPTIONS), which is why Emscripten has to run Node.js through this wrapper
#

# emsdk exports EMSDK_NODE, otherwise use the most recent Node.js of the emsdk directory
NODE=${EMSDK_NODE:-}
if [ -z "$NODE" ]; then
  NODE=$(ls -d "$(dirname "$0")/../emsdk/node"/*/bin/node 2>/dev/null | sort -V | tail -n 1) || true
fi

if [ -z "$NODE" ]; then
  echo "node.sh: Could not find the Node.js binary of emsdk" >&2
  exit 1
fi

exec "$NODE" --no-liftoff "$@"
