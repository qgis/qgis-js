import type { QgsGeometry } from "./QgsGeometry";

/**
 * A point geometry. Unlike {@link QgsPointXY}, this is a full
 * {@link https://api.qgis.org/api/classQgsAbstractGeometry.html | QgsAbstractGeometry}
 * subclass that can carry Z and M coordinates and be embedded directly in a
 * {@link QgsGeometry}.
 *
 * Constructor overloads:
 * - `new QgsPoint()` — empty
 * - `new QgsPoint(x, y)` — 2D
 * - `new QgsPoint(x, y, z)` — 3D
 * - `new QgsPoint(x, y, z, m)` — 3D with measure
 *
 * {@link https://api.qgis.org/api/classQgsPoint.html}
 */
export interface QgsPoint {
  x: number;
  y: number;
  /** NaN for 2D points. */
  z: number;
  /** NaN for points without an M value. */
  m: number;
  is3D(): boolean;
  isMeasure(): boolean;
  isEmpty(): boolean;
  wkbType(): number;
  /** 2D Cartesian distance to another point. */
  distance(other: QgsPoint): number;
  /** 3D Cartesian distance (includes Z) when both points are 3D. */
  distance3D(other: QgsPoint): number;
  /** Wrap this point as a {@link QgsGeometry} (clones internally). */
  asGeometry(): QgsGeometry;
  asWkt(precision: number): string;
  asWkb(): Uint8Array;
}

export interface QgsPointConstructors {
  QgsPoint: {
    new (): QgsPoint;
    new (x: number, y: number): QgsPoint;
    new (x: number, y: number, z: number): QgsPoint;
    new (x: number, y: number, z: number, m: number): QgsPoint;
    /**
     * Returns a typed {@link QgsPoint} if `geom` wraps a point, otherwise `null`.
     */
    fromGeometry(geom: QgsGeometry): QgsPoint | null;
  };
}
