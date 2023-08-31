type Status = "Created" | "Loading" | "Running" | "Exited";

type RestartMode = "DoNotRestart" | "RestartOnExit" | "RestartOnCrash";
type RestartType = "RestartModule" | "ReloadPage";

interface QtLoaderConfig {
  /**
   * One or more HTML elements. QtLoader will display loader elements on
   * these while loading the application, and replace the loader with
   * a canvas on load complete.
   */
  containerElements?: HTMLDivElement[];

  /**
   * One or more HTML elements. QtLoader will display loader elements
   * on these while loading the application, and replace the loader with a
   * canvas on load complete.
   */
  canvasElements?: HTMLDivElement[];

  /**
   * Optional loading element constructor function. Implement to create
   * a custom loading screen. This function may be called multiple times,
   * while preparing the application binary. "status" is a string
   * containing the loading sub-status, and may be either "Downloading",
   * or "Compiling". The browser may be using streaming compilation, in
   * which case the wasm module is compiled during downloading and the
   * there is no separate compile step.
   */
  showLoader?(status: string, containerElement: HTMLDivElement): void;

  /**
   * Optional canvas constructor function. Implement to create custom
   * canvas elements.
   */
  showCanvas?(containerElement: HTMLDivElement): void;

  /**
   * Optional exited element constructor function.
   */
  showExit?(
    crashed: boolean,
    exitCode: number,
    containerElement: HTMLDivElement,
  ): void;

  /**
   * Optional error element constructor function.
   */
  showError?(
    errorText: string, //TODO: documentation in qtloader.js seems to be wrong
    containerElement: HTMLDivElement,
  ): void;

  /**
   * Optional callback called when the status of the app has changed
   */
  statusChanged?(newStatus: string): void;

  /**
   * Prefix path for wasm file, realative to the loading HMTL file.
   */
  path?: string;

  /**
   * Controls whether the application should be reloaded on exits. The default is "DoNotRestart"
   */
  restartMode?: RestartMode;
  /**
   * Controls how a restart should be performed.
   */
  restartType?: RestartType;
  /**
   * Restart attempts limit. The default is 10.
   */
  restartLimit?: number;

  stdoutEnabled?: boolean;
  stderrEnabled?: boolean;

  /**
   * Key-value environment variable pairs
   */
  environment?: { [key: string]: string };
}

interface QtLoaderApi {
  new (config: QtLoaderConfig): QtLoaderApi;

  webAssemblySupported(): boolean;
  webGLSupported(): boolean;
  /**
   * Reports if WebAssembly and WebGL are supported. These are requirements for
   * running Qt applications.
   */
  canLoadQt(): boolean;
  canLoadApplication(): boolean;
  /**
   * One of "Created", "Loading", "Running", "Exited".
   */
  status: Status;
  /**
   * Loads the application from the given emscripten javascript module file and wasm file
   */
  loadEmscriptenModule(applicationName: string): void;

  /**
   * Add canvas at run-time. Adds a corresponding QScreen.
   */
  addCanvasElement(canvas: HTMLDivElement): void;
  /**
   * Remove canvas at run-time. Removes the corresponding QScreen.
   */
  removeCanvasElement(canvas: HTMLDivElement): void;
  /**
   * Signals to the application that a canvas has been resized.
   */
  resizeCanvasElement(canvas: HTMLDivElement): void;

  /**
   * Sets the logical font dpi for the application.
   */
  setFontDpi(dpi: number): void;
  fontDpi: number;

  /**
   * Set to true if there was an unclean exit.
   */
  crashed: boolean;
  /**
   * main()/emscripten_force_exit() return code. Valid on status change to
   * "Exited", iff crashed is false.
   */
  exitCode: number;
  /**
   * Abort/exit message.
   */
  exitText: string;

  /**
   * Returns the Emscripten module object, or undefined if the module
   * has not been created yet. Note that the module object becomes available
   * at the very end of the loading sequence, _after_ the transition from
   * Loading to Running occurs.
   */
  module: any; //TODO use emscripten type
}

export function bootQt() {
  //@ts-ignore
  import("../build-wasm/qtloader.js").then(
    ({ QtLoader }: { QtLoader: QtLoaderApi }) => {
      const spinner = document.querySelector(
        "#qtspinner",
      ) as HTMLDivElement | null;
      const canvas = document.querySelector("#screen") as HTMLDivElement | null;
      const status = document.querySelector(
        "#qtstatus",
      ) as HTMLDivElement | null;

      const qtLoader = new QtLoader({
        ...(canvas ? { canvasElements: [canvas] } : {}),
        //@ts-ignore FIXME
        moduleConfig: {
          onAbort() {
            console.error("Abort!");
            document.body.innerHTML = "";
          },
        },
        showLoader: function (loaderStatus: string) {
          if (spinner) spinner.style.display = "block";
          if (canvas) canvas.style.display = "none";
          if (status) status.innerHTML = loaderStatus + "...";
        },
        showError: function (errorText: string) {
          //FIXME unclear
          if (status) status.innerHTML = errorText;
          if (spinner) spinner.style.display = "block";
          if (canvas) canvas.style.display = "none";
        },
        showExit: function () {
          if (status) status.innerHTML = "Application exit";
          if (qtLoader.exitCode !== undefined)
            if (status) status.innerHTML += " with code " + qtLoader.exitCode;
          if (qtLoader.exitText !== undefined)
            if (status) status.innerHTML += " (" + qtLoader.exitText + ")";
          if (spinner) spinner.style.display = "block";
          if (canvas) canvas.style.display = "none";
        },
        showCanvas: function () {
          if (spinner) spinner.style.display = "none";
          if (canvas) canvas.style.display = "block";
        },
      });
      qtLoader.loadEmscriptenModule("test_vcpkg");
    },
  );
}
