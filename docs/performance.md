# Performance and Optimization

## Preface

In Feb/March 2024, we will conduct a performance test to measure the performance of qgis-js and find ways to optimize it. This document outlines the general approach and the potential optimizations

More information

- [`./debugging.md`](./debugging.md)
- [`./profiling.md`](./profiling.md)

## Deliverables

- A performance measurement tool for qgis-js
  - A report on the performance of qgis-js before this effort (qgis-js 0.0.2, "baseline")
  - A report for each optimization
  - A report on the overall performance gain
- A [final conclusion](#conclusion)
  - on the performance improvements merged into the main branch
  - as well as potential future optimizations

## Conclusion

> 💡 **Note**: This section will be the final deliverable

## Optimizations

> 💡 **Legend**: Each potential optimization will be prioritized with one of the following labels:
>
> - 🟢 High priority: _Should definitively taken into account_
> - 🟡 Mid priority: _Would be nice to investigate_
> - 🔴 Low priority: _Probably out of scope for now_

### Toolchain/Dependencies

- 🟢 Update to latest emscripten version
  - currently `3.1.29` is used (more than a year old)
  - by anecdotal evidence, binaries compiled with the latest version are faster (latest LLVM)
- 🟢 Update to latest Qt version
  - see [wasm improvements since `6.5.2`](https://github.com/qt/qtreleasenotes/tree/dev/qt)
  - building of Qt is needed anyway, in order to pass custom build flags (see below)
- 🟡 Update to latest vcpkg version (and update the packages with it)
- 🔴 Update to latest QGIS version
  - Currently `3.32.1` is used
  - Latest would be `3.34.3`

### Build/Setup

- 🟢 Internalize Qt build
  - This makes is possible to also apply optimizations also to the Qt build
  - Check if the Qt build configuration can be optimized
- 🟢 Review and tweak the build flags/settings provided to emscripten
  - `-flto` (Link Time Optimization)
  - see https://emscripten.org/docs/optimizing/Optimizing-Code.html
  - see https://emsettings.surma.technology/
- 🟢 Add [SIMD support](https://webassembly.org/features/)
  - Make use of auto vectorization
  - Add SIMD support for libraries (e.g. GDAL)
  - see https://jeromewu.github.io/improving-performance-using-webassembly-simd-intrinsics/
- 🟢 Ensure [Bulk memory operations](https://webassembly.org/features/)
  - Not sure if we already make use of this
  - See `-mbulk-memory`
- 🟢 Check if new [WASMFS](https://emscripten.org/docs/api_reference/Filesystem-API.html#new-file-system-wasmfs) helps to improve FS performance
- 🟡 Check other potential [WebAssembly features](https://webassembly.org/features/)
  - See if we can make use of any other of features generally available

### Architecture/Runtime

- **QGIS**
  - 🟢 Switch to `QgsMapRendererParallelJob`
  - 🟢 Check if auto geometry simplification is configured and used
  - 🟢 Check if `QgsMapRendererCache` can help to speed up redraws
  - 🟡 Check all `MapSettingsFlag`, `ProjectReadFlag`, etc. for potential tweaks
  - 🟡 Have a look at the QGIS Server implementation for potential tweaks
  - **API**
    - 🟢 Check if JS promises can be returned directly from the API
    - 🟡 Check if it is possible to make a zero-copy implementation of the render callback (e.g. [transferable](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects))
- **Qt**
  - 🟢 Check performance impact of OutputImageFormat `Format_ARGB32`
    - Is it faster to render in `Format_ARGB32_Premultiplied` and convert to `Format_ARGB32` afterwards?
- **sqlite**
  - 🟢 Check if WAL/locking etc. can be disabled for rendering (read-only)

### UI/UX

- **OpenLayers**
  - 🟢 Check with the OL devs, if the current layer implementations are well designed
  - 🟢 Cancelation of pending render jobs
  - 🟢 Find a way to cache the results in "canvas" mode (like in XYZ mode)
  - 🟡 Is it possible to display immediate results (progressive rendering), before the job finishes
- 🔴 **QML**
  - Compare the performance of `QgsQuickMapCanvasMap` with the performance and UX of the current OL solution

### QGIS Project

- 🟢 Optimize the project settings for fastest possible rendering
- 🟢 Ensure indices are created and used for all vector layers
- 🟡 Check if there are faster data formats than GeoPackage (e.g. FlatGeobuf, GeoParquet)

## TODOs

- [x] Create the performance measurement tool
- [ ] Write a [profiling guide](./profiling.md)
- [ ] Write the [final conclusion](#conclusion)

## Questions

- Is it still possible to disable progressive rendering in QGIS desktop? (To get comparable measurements in the "Debugging/Development Tools")
