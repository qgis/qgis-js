# Performance and Optimization

## Preface

In Feb-June 2024, we will conduct a performance test to measure the performance of qgis-js and find ways to optimize it. This document outlines the general approach, lists the potential optimizations and tracks the status of those optimizations

More information

- [Performance Comparison (between version 0.0.3 and 0.0.5)](https://github.com/boardend/qgis-js-performance)
- Documentation
  - [`./debugging.md`](./debugging.md)
  - [`./profiling.md`](./profiling.md)

## Deliverables

- [x] [A performance measurement tool for qgis-js](../sites/performance/)
  - [x] [A report on the performance gain](https://github.com/boardend/qgis-js-performance)
- [x] [A final conclusion](#conclusion)

## Conclusion

**Approach**:

- In order to optimize the performance of qgis-js, we have gathered a list of potential [optimizations](#optimizations) and implemented as many as possible in the given time frame
  - The status of each optimization is tracked in the [list](#optimizations)
  - Note that most of them have been implemented
- To challenge the performance of qgis-js, the demo project "AoS - Precipitation per balance basin" with the worst observed performance so far has been selected to verify the optimizations
  - It is used on its worst performing extent (whole of Switzerland) and used to render a full screen map (`1920x1080`)
  - The project was measured in two versions:
    - [`aos-baseline`](https://github.com/boardend/qgis-js-projects/tree/main/performance/aos-baseline): The original version of the project, as it is used on the qgis-js website
    - [`aos-playground`](https://github.com/boardend/qgis-js-projects/tree/main/performance/aos-playground): A optimized version of the project
      - Added/Recalculate indices for all layers
      - Simplified geometries for all vector layers
      - Played with the project settings to achieve potential performance improvements
- A performance measurement tool has been implemented used to measure the performance of the application before (version `0.0.3`) and after the optimizations (version `0.0.5`) and to compare the performance of the `aos-baseline` and `aos-playground` project:
  - The full results can be found in a seperate repository: [Performance Comparison (between version 0.0.3 and 0.0.5)](https://github.com/boardend/qgis-js-performance)

> All changes in the scope of this project have been merged with [PR #38](https://github.com/qgis/qgis-js/pull/38)

**Results**:

- Rendering time could be reduced significantly between version `0.0.3` and `0.0.5`:
  - Chrome: `41.60%`
  - Firefox: `43.04%`
- Chrome is performing better than Firefox
  - Ratio rendering time Chrome/Firefox: `0.47`
- Difference between `aos-baseline`/`aos-playground` project is negligible
  - `100.38%`, `100.51%`, `93.66%`, `101.62%`

> see [Performance Comparison (between version 0.0.3 and 0.0.5)](https://github.com/boardend/qgis-js-performance)

> Compare the two versions in the browser:
>
> - \>= `0.0.5`: https://qgis.github.io/qgis-js/
> - `0.0.3`: https://boardend.github.io/qgis-js-baseline/

**Further steps**:

- Implement the not yet implemented [optimizations](#optimizations)
- Add the performance measurement tool to the GitHub page
- Automate the performance measurement tool to run on every commit/release
- Further [profile](./profiling.md) the performance of the application in order to find bottlenecks
- Compare the performance of the WebAssembly build against the native build of QGIS

## Optimizations

> 💡 **Legend**: Each potential optimization will be prioritized with one of the following labels:
>
> **Priority**:
>
> - 🟢 High priority: _Should definitively taken into account_
> - 🟡 Mid priority: _Would be nice to investigate_
> - 🔴 Low priority: _Probably out of scope for now_
>
> **Status**:
>
> - [x] Implemented
> - [ ] Open

### Toolchain/Dependencies

- [x] 🟢 Update to latest emscripten version
  - currently `3.1.29` is used (more than a year old)
  - by anecdotal evidence, binaries compiled with the latest version are faster (latest LLVM)
- [x] 🟢 Update to Qt version `6.6.1`
  - see [wasm improvements since `6.5.2`](https://github.com/qt/qtreleasenotes/tree/dev/qt)
  - building of Qt is needed anyway, in order to pass custom build flags (see below)
- [x] 🟡 Update to vcpkg version `2024.02.14` (and update the packages with it)
- [ ] 🔴 Update to latest QGIS version
  - Currently `3.32.1` is used
  - Latest would be `3.34.3`
  - 💬 Created an issue to track this: https://github.com/qgis/qgis-js/issues/39

### Build/Setup

- [x] 🟢 Internalize Qt build
  - This makes is possible to also apply optimizations also to the Qt build
  - Check if the Qt build configuration can be optimized
- [x] 🟢 Review and tweak the build flags/settings provided to emscripten
  - `-flto` (Link Time Optimization)
  - see https://emscripten.org/docs/optimizing/Optimizing-Code.html
  - see https://emsettings.surma.technology/
- [x] 🟢 Add [SIMD support](https://webassembly.org/features/)
  - Make use of auto vectorization
  - Add SIMD support for libraries (e.g. GDAL)
  - see https://jeromewu.github.io/improving-performance-using-webassembly-simd-intrinsics/
- [x] 🟢 Ensure [Bulk memory operations](https://webassembly.org/features/)
  - Not sure if we already make use of this
  - See `-mbulk-memory`
  - 💬 Note that this is the default of newer Emscripten versions
- [ ] 🟢 Check if new [WASMFS](https://emscripten.org/docs/api_reference/Filesystem-API.html#new-file-system-wasmfs) helps to improve FS performance
  - 💬 This was not working well with the Qt CMake setup
    - Needs more time to investigate
- [x] 🟡 Check other potential [WebAssembly features](https://webassembly.org/features/)
  - See if we can make use of any other of features generally available
  - 💬 Didn't find anything that could benefit the current setup

### Architecture/Runtime

- **QGIS**
  - [x] 🟢 Switch to `QgsMapRendererParallelJob`
  - [x] 🟢 Check if auto geometry simplification is configured and used
  - [x] 🟢 Check if `QgsMapRendererCache` can help to speed up redraws
    - 💬 This doesn't help with the general rending performance. But could improove e.g. layer toggling. Not in use at the moment
  - [x] 🟡 Check all `MapSettingsFlag`, `ProjectReadFlag`, etc. for potential tweaks
  - [x] 🟡 Have a look at the QGIS Server implementation for potential tweaks
  - **API**
    - [x] 🟢 Check if JS promises can be returned directly from the API
      - 💬 This is possible with Emscriptens [promise.h](https://github.com/emscripten-core/emscripten/blob/main/system/include/emscripten/promise.h). But won't help much with the general render performance
    - [x] 🟡 Check if it is possible to make a zero-copy implementation of the render callback (e.g. [transferable](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects))
      - 💬 This is not possible with the current architecture (But the copy takes less then 5ms)
- **Qt**
  - [ ] 🟢 Check performance impact of OutputImageFormat `Format_ARGB32`
    - Is it faster to render in `Format_ARGB32_Premultiplied` and convert to `Format_ARGB32` afterwards?
- **sqlite**
  - [x] 🟢 Check if WAL/locking etc. can be disabled for rendering (read-only)
    - 💬 See the flags in `qgis-js.cpp`

### UI/UX

- [x] **OpenLayers**
  - [x] 🟢 Check with the OL devs, if the current layer implementations are well designed
    - 💬 Checked with [Andreas Hocevar](https://github.com/ahocevar) and created this follow up issues:
      - https://github.com/qgis/qgis-js/issues/40 , https://github.com/qgis/qgis-js/issues/41 , https://github.com/qgis/qgis-js/issues/42 , https://github.com/qgis/qgis-js/issues/16
  - [x] 🟢 Cancellation of pending render jobs
    - 💬 Implemented with the `QgisJobDataSource`
  - [x] 🟢 Find a way to cache the results in "canvas" mode (like in XYZ mode)
    - 💬 Not possible at the moment (only with tiling like here: https://openlayers.org/en/latest/examples/wms-custom-proj.html)
  - [x] 🟡 Is it possible to display immediate results (progressive rendering), before the job finishes
    - 💬 Implemented with the `QgisJobDataSource`
- [ ] 🔴 **QML**
  - Compare the performance of `QgsQuickMapCanvasMap` with the performance and UX of the current OL solution

### QGIS Project

- [x] 🟢 Optimize the project settings for fastest possible rendering
  - 💬 This doesn't help much. See [`aos-baseline`](https://github.com/boardend/qgis-js-projects/tree/main/performance/aos-baseline) vs [`aos-playground`](https://github.com/boardend/qgis-js-projects/tree/main/performance/aos-playground) when running in local dev mode.
- [x] 🟢 Ensure indices are created and used for all vector layers
  - 💬 This was already in place for the checked vector and raster layers ([`aos-baseline`](https://github.com/boardend/qgis-js-projects/tree/main/performance/aos-baseline))
- [ ] 🟡 Check if there are faster data formats than GeoPackage (e.g. FlatGeobuf)
