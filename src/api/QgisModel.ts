import { PointXY, PointXYConstructors } from "../model/PointXY";
import { Rectangle, RectangleConstructors } from "../model/Rectangle";
import { MapLayer, MapLayerConstructors } from "../model/MapLayer";

export type { PointXY, Rectangle, MapLayer };

/* prettier-ignore */
export interface QgisModelConstructors
  extends
    PointXYConstructors,
    RectangleConstructors,
    MapLayerConstructors
  {}
