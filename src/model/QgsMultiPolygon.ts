import type { QgsGeometry } from "./QgsGeometry";
import type { QgsPolygon } from "./QgsPolygon";

/**
 * A homogeneous collection of {@link QgsPolygon} geometries.
 *
 * {@link https://api.qgis.org/api/classQgsMultiPolygon.html}
 */
export interface QgsMultiPolygon {
  numGeometries(): number;
  isEmpty(): boolean;
  wkbType(): number;
  polygonN(i: number): QgsPolygon;
  /** Append a clone of `p`. */
  addPolygon(p: QgsPolygon): void;
  /** Sum of child polygon areas. */
  area(): number;
  /** Sum of child polygon perimeters. */
  perimeter(): number;
  asGeometry(): QgsGeometry;
  asWkt(precision: number): string;
  asWkb(): Uint8Array;
}

export interface QgsMultiPolygonConstructors {
  QgsMultiPolygon: {
    new (): QgsMultiPolygon;
    fromGeometry(geom: QgsGeometry): QgsMultiPolygon | null;
  };
}
