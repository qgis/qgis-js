import { QgisModelConstructors, Rectangle } from "./model";

/**
 * @public
 */
export interface CommonQgisApi extends QgisModelConstructors {
  fullExtent(): Rectangle;
}
