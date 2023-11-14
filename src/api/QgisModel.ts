import { PointXY, PointXYConstructors } from "../model/PointXY";
import { Rectangle, RectangleConstructors } from "../model/Rectangle";
import { MapLayer } from "../model/MapLayer";

export type { PointXY, Rectangle, MapLayer };

/* prettier-ignore */

/**
 * Geathers all constructors of the QGIS model classes.
 */
export interface QgisModelConstructors
  extends
    PointXYConstructors,
    RectangleConstructors
  {}
