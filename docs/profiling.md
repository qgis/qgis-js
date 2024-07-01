# Profiling

## qgis-js Performance Measurement Tool

The [qgis-js Performance Measurement Tool](../sites/performance/) can be used to measure the performance of the qgis-js application in a reproducible way:

```
cd sites/performance
npm run dev
```

1. Boot the runtime
2. Load a project
3. Render a first dummy frame
4. Start the performance test

## Browsers

### Chrome

The Performance tab of the Chrome DevTools can be used to profile the performance of the qgis-js application. See the [official documentation](https://developer.chrome.com/docs/devtools/evaluate-performance/) for more information.

![Firefox Profiler](https://developer.chrome.com/static/docs/devtools/performance/image/the-results-the-profile-5d830d01508e2_2880.png)

- 💡 In order to get useful results (e.g. function names in the `.wasm` module), the [build type](../README.md#build-types) has to be set to `Dev` or `Debug`
  - ⚠️ Note that the `Debug` build type is significantly slower than the `Dev` build type

### Firefox

The [Firefox Profiler⁩](https://profiler.firefox.com/) can be used to profile the performance of the qgis-js application.

![Firefox Profiler](https://profiler.firefox.com/b45b29da558efa211628.jpg)

- 💡 In order to get useful results (e.g. function names in the `.wasm` module), the [build type](../README.md#build-types) has to be set to `Dev` or `Debug`
  - ⚠️ Note that the `Debug` build type is significantly slower than the `Dev` build type

## Emscripten

- Emscripten provies a [profiling guide](https://emscripten.org/docs/optimizing/Optimizing-Code.html#profiling) and some embeddable tools to profile the application:
  - `--cpuprofiler`
  - `--memoryprofiler`
  - `--threadprofiler`

## QGIS profiling

- It would be nice to extend the qgis-js API in order to retrieve profiling information from the QGIS core
  - ⚠️ This is not yet implemented
