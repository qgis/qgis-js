import type { QgsGeometry } from "./QgsGeometry";

/**
 * A polygon whose rings can be any curve type ({@link QgsLineString},
 * {@link QgsCircularString}, or {@link QgsCompoundCurve}). The parent
 * type of {@link QgsPolygon} — use the latter when all rings are
 * straight-sided.
 *
 * {@link https://api.qgis.org/api/classQgsCurvePolygon.html}
 */
export interface QgsCurvePolygon {
  /**
   * Replace the exterior ring with a clone of `curveGeom`'s underlying
   * curve. The geometry must wrap a curve type; returns `false` otherwise.
   */
  setExteriorRing(curveGeom: QgsGeometry): boolean;
  addInteriorRing(curveGeom: QgsGeometry): boolean;
  /** Empty geometry if no exterior ring is set. */
  exteriorRing(): QgsGeometry;
  numInteriorRings(): number;
  interiorRing(i: number): QgsGeometry;
  isEmpty(): boolean;
  wkbType(): number;
  area(): number;
  perimeter(): number;
  asGeometry(): QgsGeometry;
  asWkt(precision: number): string;
  asWkb(): Uint8Array;
}

export interface QgsCurvePolygonConstructors {
  QgsCurvePolygon: {
    new (): QgsCurvePolygon;
    fromGeometry(geom: QgsGeometry): QgsCurvePolygon | null;
  };
}
