import type { QgsGeometry } from "./QgsGeometry";
import type { QgsPoint } from "./QgsPoint";

/**
 * A three-vertex polygon. Inherits from {@link QgsPolygon} in QGIS, but
 * exposed here as its own type so the triangle-specific predicates and
 * accessors are reachable.
 *
 * {@link https://api.qgis.org/api/classQgsTriangle.html}
 */
export interface QgsTriangle {
  isEmpty(): boolean;
  wkbType(): number;
  area(): number;
  perimeter(): number;
  /** Side lengths in vertex order (`[ab, bc, ca]`). */
  lengths(): number[];
  /** Interior angles in radians, in vertex order. */
  angles(): number[];
  isDegenerate(): boolean;
  isEquilateral(): boolean;
  isIsocele(): boolean;
  isRight(): boolean;
  isScalene(): boolean;
  asGeometry(): QgsGeometry;
  asWkt(precision: number): string;
  asWkb(): Uint8Array;
}

export interface QgsTriangleConstructors {
  QgsTriangle: {
    new (): QgsTriangle;
    new (a: QgsPoint, b: QgsPoint, c: QgsPoint): QgsTriangle;
    fromGeometry(geom: QgsGeometry): QgsTriangle | null;
  };
}
