import { QgsPointXY, QgsPointXYConstructors } from "../model/QgsPointXY";
import { QgsRectangle, QgsRectangleConstructors } from "../model/QgsRectangle";
import { QgsMapLayer } from "../model/QgsMapLayer";
import { QgsMapRendererParallelJob } from "../model/QgsMapRendererParallelJob";
import { QgsMapRendererJob } from "../model/QgsMapRendererJob";
import { QgsMapRendererQImageJob } from "../model/QgsMapRendererQImageJob";

export type {
  QgsMapRendererJob,
  QgsMapRendererQImageJob,
  QgsMapRendererParallelJob,
  QgsPointXY,
  QgsRectangle,
  QgsMapLayer,
};

/* prettier-ignore */

/**
 * Geathers all constructors of the QGIS model classes.
 */
export interface QgisModelConstructors
  extends
    QgsPointXYConstructors,
    QgsRectangleConstructors
  {}
