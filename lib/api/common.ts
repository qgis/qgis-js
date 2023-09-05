import { QgisModelConstructors, Rectangle } from "./model";

/**
 * @public
 */
export interface CommonQgisApi extends QgisModelConstructors {
  fullExtent(): Rectangle;
  srid(): string;
  transformRectangle(
    rect: Rectangle,
    inputSrid: string,
    outputSrid: string,
  ): Rectangle;
}
