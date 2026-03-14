import { QgsPointXY } from "./QgsPointXY";

/**
 * A rectangle specified with double values.
 *
 * {@link https://api.qgis.org/api/classQgsRectangle.html}
 */
export interface QgsRectangle {
  xMaximum: number;
  xMinimum: number;
  yMaximum: number;
  yMinimum: number;

  scale(factor: number): void;
  move(dx: number, dy: number): void;
  center(): QgsPointXY;
}

/**
 * The {@link QgsRectangle} constructors.
 */
export interface QgsRectangleConstructors {
  QgsRectangle: {
    new (): QgsRectangle;
    new (xMin: number, yMin: number, xMax: number, yMax: number): QgsRectangle;
  };
}
