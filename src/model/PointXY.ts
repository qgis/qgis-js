/**
 * A class to represent a 2D point.
 *
 * {@link https://api.qgis.org/api/classQgsPointXY.html}
 */
export interface PointXY {
  x: number;
  y: number;
}

/**
 * The {@link PointXY} constructors.
 */
export interface PointXYConstructors {
  PointXY: { new (): PointXY };
}
