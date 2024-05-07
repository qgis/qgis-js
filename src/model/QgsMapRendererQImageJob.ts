import { QgsMapRendererJob } from "./QgsMapRendererJob";

/**
 * Intermediate base class adding functionality that allows client to query the rendered image
 *
 * {@link https://api.qgis.org/api/classQgsMapRendererQImageJob.html}
 */
export interface QgsMapRendererQImageJob extends QgsMapRendererJob {
  /**
   * Returns the (preview or final) rendered image as a byte array
   * @returns The rendered image as an emscripten typed_memory_view.
   */
  renderedImage(): ArrayBufferLike;
}
