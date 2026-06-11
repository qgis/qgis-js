import type { QgsGeometry } from "./QgsGeometry";

/**
 * A collection of any curve types ({@link QgsLineString},
 * {@link QgsCircularString}, {@link QgsCompoundCurve}).
 *
 * {@link https://api.qgis.org/api/classQgsMultiCurve.html}
 */
export interface QgsMultiCurve {
  numGeometries(): number;
  isEmpty(): boolean;
  wkbType(): number;
  /** Sum of child curve lengths. */
  length(): number;
  /** Child curve at `i` as a generic {@link QgsGeometry}. */
  curveN(i: number): QgsGeometry;
  /** Append a clone of the curve wrapped by `curveGeom`. Returns `false` if it isn't a curve. */
  addCurve(curveGeom: QgsGeometry): boolean;
  asGeometry(): QgsGeometry;
  asWkt(precision: number): string;
  asWkb(): Uint8Array;
}

export interface QgsMultiCurveConstructors {
  QgsMultiCurve: {
    new (): QgsMultiCurve;
    fromGeometry(geom: QgsGeometry): QgsMultiCurve | null;
  };
}
