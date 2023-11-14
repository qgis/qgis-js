import { PointXY } from "./PointXY";

/**
 * A rectangle specified with double values.
 *
 * {@link https://api.qgis.org/api/classQgsRectangle.html}
 */
export interface Rectangle {
  xMaximum: number;
  xMinimum: number;
  yMaximum: number;
  yMinimum: number;

  scale(factor: number): void;
  move(dx: number, dy: number): void;
  center(): PointXY;
}

/**
 * The {@link Rectangle} constructors.
 */
export interface RectangleConstructors {
  Rectangle: {
    new (): Rectangle;
    new (xMin: number, yMin: number, xMax: number, yMax: number): Rectangle;
  };
}
