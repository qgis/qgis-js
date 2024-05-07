import { PointXY, PointXYConstructors } from "../model/PointXY";
import { Rectangle, RectangleConstructors } from "../model/Rectangle";
import { MapLayer } from "../model/MapLayer";
import { QgsMapRendererParallelJob } from "../model/QgsMapRendererParallelJob";
import { QgsMapRendererJob } from "../model/QgsMapRendererJob";
import { QgsMapRendererQImageJob } from "../model/QgsMapRendererQImageJob";

export type {
  QgsMapRendererJob,
  QgsMapRendererQImageJob,
  QgsMapRendererParallelJob,
  PointXY,
  Rectangle,
  MapLayer,
};

/* prettier-ignore */

/**
 * Geathers all constructors of the QGIS model classes.
 */
export interface QgisModelConstructors
  extends
    PointXYConstructors,
    RectangleConstructors
  {}
