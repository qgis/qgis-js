import type { QgsGeometry } from "./QgsGeometry";
import type { QgsPoint } from "./QgsPoint";

/**
 * A circle shape — center + radius + azimuth. Not a
 * {@link https://api.qgis.org/api/classQgsAbstractGeometry.html | QgsAbstractGeometry}
 * itself; convert with {@link toPolygon} or {@link toCircularString} for
 * geometry operations.
 *
 * {@link https://api.qgis.org/api/classQgsCircle.html}
 */
export interface QgsCircle {
  center(): QgsPoint;
  radius(): number;
  /** Rotation of the major axis in degrees from north, clockwise. */
  azimuth(): number;
  setRadius(r: number): void;
  setAzimuth(a: number): void;
  area(): number;
  perimeter(): number;
  isEmpty(): boolean;
  /**
   * Approximate as a regular polygon with `segments` straight edges
   * (more segments → smoother circle).
   */
  toPolygon(segments: number): QgsGeometry;
  /** Exact representation as a closed circular-arc curve. */
  toCircularString(): QgsGeometry;
  asWkt(precision: number): string;
}

export interface QgsCircleConstructors {
  QgsCircle: {
    new (): QgsCircle;
    new (center: QgsPoint, radius: number): QgsCircle;
    new (center: QgsPoint, radius: number, azimuth: number): QgsCircle;
  };
}
