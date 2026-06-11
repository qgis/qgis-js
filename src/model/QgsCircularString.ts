import type { QgsGeometry } from "./QgsGeometry";
import type { QgsPoint } from "./QgsPoint";

/**
 * A curve composed of circular-arc segments. Points are interpreted as a
 * sequence of (start, arcMidpoint, end, arcMidpoint, end, …) — i.e. an
 * odd number of vertices >= 3.
 *
 * {@link https://api.qgis.org/api/classQgsCircularString.html}
 */
export interface QgsCircularString {
  numPoints(): number;
  isEmpty(): boolean;
  isClosed(): boolean;
  wkbType(): number;
  length(): number;
  pointN(i: number): QgsPoint;
  startPoint(): QgsPoint;
  endPoint(): QgsPoint;
  asGeometry(): QgsGeometry;
  asWkt(precision: number): string;
  asWkb(): Uint8Array;
}

export interface QgsCircularStringConstructors {
  QgsCircularString: {
    new (): QgsCircularString;
    fromArray(coords: number[][]): QgsCircularString;
    fromGeometry(geom: QgsGeometry): QgsCircularString | null;
  };
}
