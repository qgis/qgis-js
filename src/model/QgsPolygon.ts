import type { QgsGeometry } from "./QgsGeometry";
import type { QgsLineString } from "./QgsLineString";

/**
 * A polygon with a linear exterior ring and any number of linear interior
 * (hole) rings. For curved rings see `QgsCurvePolygon` (not yet bound).
 *
 * Typical construction:
 * ```ts
 * const ring = api.QgsLineString.fromArray([[0,0],[1,0],[1,1],[0,1],[0,0]]);
 * const poly = new api.QgsPolygon();
 * poly.setExteriorRing(ring);
 * ```
 *
 * {@link https://api.qgis.org/api/classQgsPolygon.html}
 */
export interface QgsPolygon {
  /** Replace the exterior ring. The polygon takes a clone of `ring`. */
  setExteriorRing(ring: QgsLineString): void;
  /** Append an interior (hole) ring. The polygon takes a clone of `ring`. */
  addInteriorRing(ring: QgsLineString): void;
  /** The exterior ring as a {@link QgsLineString}, or `null` if not yet set. */
  exteriorRing(): QgsLineString | null;
  numInteriorRings(): number;
  interiorRing(i: number): QgsLineString | null;
  isEmpty(): boolean;
  wkbType(): number;
  area(): number;
  perimeter(): number;
  asGeometry(): QgsGeometry;
  asWkt(precision: number): string;
  asWkb(): Uint8Array;
}

export interface QgsPolygonConstructors {
  QgsPolygon: {
    new (): QgsPolygon;
    fromGeometry(geom: QgsGeometry): QgsPolygon | null;
  };
}
