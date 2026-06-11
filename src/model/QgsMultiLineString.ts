import type { QgsGeometry } from "./QgsGeometry";
import type { QgsLineString } from "./QgsLineString";

/**
 * A homogeneous collection of {@link QgsLineString} geometries.
 *
 * {@link https://api.qgis.org/api/classQgsMultiLineString.html}
 */
export interface QgsMultiLineString {
  numGeometries(): number;
  isEmpty(): boolean;
  wkbType(): number;
  lineStringN(i: number): QgsLineString;
  /** Append a clone of `l`. */
  addLineString(l: QgsLineString): void;
  /** Sum of segment lengths across every child line. */
  length(): number;
  asGeometry(): QgsGeometry;
  asWkt(precision: number): string;
  asWkb(): Uint8Array;
}

export interface QgsMultiLineStringConstructors {
  QgsMultiLineString: {
    new (): QgsMultiLineString;
    fromGeometry(geom: QgsGeometry): QgsMultiLineString | null;
  };
}
