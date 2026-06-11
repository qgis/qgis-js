import type { QgsGeometry } from "./QgsGeometry";
import type { QgsPoint } from "./QgsPoint";

/**
 * A homogeneous collection of {@link QgsPoint} geometries.
 *
 * {@link https://api.qgis.org/api/classQgsMultiPoint.html}
 */
export interface QgsMultiPoint {
  numGeometries(): number;
  isEmpty(): boolean;
  wkbType(): number;
  pointN(i: number): QgsPoint;
  /** Append a clone of `p`. */
  addPoint(p: QgsPoint): void;
  asGeometry(): QgsGeometry;
  asWkt(precision: number): string;
  asWkb(): Uint8Array;
}

export interface QgsMultiPointConstructors {
  QgsMultiPoint: {
    new (): QgsMultiPoint;
    fromGeometry(geom: QgsGeometry): QgsMultiPoint | null;
  };
}
