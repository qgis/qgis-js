import { QgsMapRendererQImageJob } from "./QgsMapRendererQImageJob";

/**
 * Job implementation that renders all layers in parallel
 *
 * {@link https://api.qgis.org/api/classQgsMapRendererParallelJob.html}
 */
export interface QgsMapRendererParallelJob extends QgsMapRendererQImageJob {}
