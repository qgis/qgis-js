/**
 * A class to represent a 2D point.
 *
 * {@link https://api.qgis.org/api/classQgsPointXY.html}
 */
export interface QgsPointXY {
  x: number;
  y: number;
}

/**
 * The {@link QgsPointXY} constructors.
 */
export interface QgsPointXYConstructors {
  QgsPointXY: { new (): QgsPointXY };
}
