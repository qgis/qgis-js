/**
 * Abstract base class for map rendering implementations
 *
 * {@link https://api.qgis.org/api/classQgsMapRendererJob.html}
 */
export interface QgsMapRendererJob {
  /**
   * Stop the rendering job - does not return until the job has terminated
   */
  cancel(): void;

  /**
   * Triggers cancellation of the rendering job without blocking.
   */
  cancelWithoutBlocking(): void;

  /**
   * Tell whether the rendering job is currently running in background.
   * @returns True if the job is active, false otherwise.
   */
  isActive(): boolean;

  /**
   * Returns the total time it took to finish the job (in milliseconds)
   * @returns The rendering time in milliseconds.
   */
  renderingTime(): number;

  /**
   * Registers a callback function to be called when the map rendering job is finished.
   * @param callback The callback function to be called.
   */
  finished(callback: () => void): void;
}
