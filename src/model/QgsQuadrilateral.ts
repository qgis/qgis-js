import type { QgsGeometry } from "./QgsGeometry";
import type { QgsPoint } from "./QgsPoint";

/**
 * A four-sided polygon shape that enforces validity (no self-intersections,
 * vertices in cyclic order). Convert with {@link toPolygon} to use as a
 * geometry.
 *
 * {@link https://api.qgis.org/api/classQgsQuadrilateral.html}
 */
export interface QgsQuadrilateral {
  /** Whether the four vertices form a valid (non-self-intersecting) quadrilateral. */
  isValid(): boolean;
  /** Convert to a {@link QgsPolygon} wrapped as a generic geometry. */
  toPolygon(): QgsGeometry;
  /** The four corner points. */
  points(): QgsPoint[];
  asWkt(precision: number): string;
}

export interface QgsQuadrilateralConstructors {
  QgsQuadrilateral: {
    new (): QgsQuadrilateral;
    new (
      p1: QgsPoint,
      p2: QgsPoint,
      p3: QgsPoint,
      p4: QgsPoint,
    ): QgsQuadrilateral;
  };
}
