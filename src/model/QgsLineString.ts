import type { QgsGeometry } from "./QgsGeometry";
import type { QgsPoint } from "./QgsPoint";

/**
 * A linear (non-curved) line string. Coordinates may include Z and/or M.
 *
 * To construct from raw coordinates use {@link QgsLineStringConstructors.fromArray}:
 * ```ts
 * const line = api.QgsLineString.fromArray([[0, 0], [1, 1], [2, 0]]);
 * ```
 *
 * {@link https://api.qgis.org/api/classQgsLineString.html}
 */
export interface QgsLineString {
  numPoints(): number;
  isEmpty(): boolean;
  isClosed(): boolean;
  wkbType(): number;
  /** Sum of segment lengths. */
  length(): number;
  pointN(i: number): QgsPoint;
  startPoint(): QgsPoint;
  endPoint(): QgsPoint;
  /**
   * All vertices as `[x, y]`, `[x, y, z]`, or `[x, y, z, m]` arrays depending
   * on the dimensionality of the line.
   */
  points(): number[][];
  /** Append a vertex. */
  addPoint(p: QgsPoint): void;
  /** Append a copy of the first vertex if not already closed. */
  close(): void;
  asGeometry(): QgsGeometry;
  asWkt(precision: number): string;
  asWkb(): Uint8Array;
}

export interface QgsLineStringConstructors {
  QgsLineString: {
    new (): QgsLineString;
    fromArray(coords: number[][]): QgsLineString;
    fromGeometry(geom: QgsGeometry): QgsLineString | null;
  };
}
