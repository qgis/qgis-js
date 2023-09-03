import { PointXY, PointXYConstructors } from "../model/PointXY";
import { Rectangle, RectangleConstructors } from "../model/Rectangle";

export type { PointXY, Rectangle };

/* prettier-ignore */
export interface QgisModelConstructors
  extends
    PointXYConstructors,
    RectangleConstructors
  {}
