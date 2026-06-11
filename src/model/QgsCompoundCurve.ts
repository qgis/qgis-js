import type { QgsCircularString } from "./QgsCircularString";
import type { QgsGeometry } from "./QgsGeometry";
import type { QgsLineString } from "./QgsLineString";

/**
 * A curve made of one or more {@link QgsLineString} and / or
 * {@link QgsCircularString} segments joined end-to-end.
 *
 * {@link https://api.qgis.org/api/classQgsCompoundCurve.html}
 */
export interface QgsCompoundCurve {
  /** Append a copy of `line` as the next segment. */
  addLineString(line: QgsLineString): void;
  /** Append a copy of `arc` as the next segment. */
  addCircularString(arc: QgsCircularString): void;
  /** Number of child curve segments. */
  nCurves(): number;
  /** Total vertex count across all segments. */
  numPoints(): number;
  isEmpty(): boolean;
  isClosed(): boolean;
  wkbType(): number;
  length(): number;
  /**
   * Child segment at `i` as a {@link QgsGeometry}. Inspect `wkbType()` to
   * tell whether it's a line or circular-string and unwrap with
   * `QgsLineString.fromGeometry` / `QgsCircularString.fromGeometry`.
   */
  curveAt(i: number): QgsGeometry;
  asGeometry(): QgsGeometry;
  asWkt(precision: number): string;
  asWkb(): Uint8Array;
}

export interface QgsCompoundCurveConstructors {
  QgsCompoundCurve: {
    new (): QgsCompoundCurve;
    fromGeometry(geom: QgsGeometry): QgsCompoundCurve | null;
  };
}
