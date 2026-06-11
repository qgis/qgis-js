import type { QgsGeometry } from "./QgsGeometry";
import type { QgsPoint } from "./QgsPoint";

/**
 * A regular polygon shape (all sides equal, all angles equal) defined by a
 * center, radius, azimuth and side count. Convert with {@link toPolygon}.
 *
 * {@link https://api.qgis.org/api/classQgsRegularPolygon.html}
 */
export interface QgsRegularPolygon {
  center(): QgsPoint;
  /** Radius of the inscribed circle. */
  radius(): number;
  /** Distance from center to midpoint of a side. */
  apothem(): number;
  numberSides(): number;
  setNumberSides(n: number): void;
  setRadius(r: number): void;
  area(): number;
  perimeter(): number;
  /** Side length. */
  length(): number;
  /** Interior angle in radians. */
  interiorAngle(): number;
  /** Central angle in radians. */
  centralAngle(): number;
  isEmpty(): boolean;
  toPolygon(): QgsGeometry;
  asWkt(precision: number): string;
}

export interface QgsRegularPolygonConstructors {
  QgsRegularPolygon: {
    new (): QgsRegularPolygon;
    /** `pt1` is a vertex on the circumscribed circle. */
    new (
      center: QgsPoint,
      pt1: QgsPoint,
      numberSides: number,
    ): QgsRegularPolygon;
    new (
      center: QgsPoint,
      radius: number,
      azimuth: number,
      numberSides: number,
    ): QgsRegularPolygon;
  };
}
