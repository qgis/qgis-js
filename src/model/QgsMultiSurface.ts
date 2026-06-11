import type { QgsGeometry } from "./QgsGeometry";

/**
 * A collection of surface geometries ({@link QgsPolygon},
 * {@link QgsCurvePolygon}). The curve-aware sibling of
 * {@link QgsMultiPolygon}.
 *
 * {@link https://api.qgis.org/api/classQgsMultiSurface.html}
 */
export interface QgsMultiSurface {
  numGeometries(): number;
  isEmpty(): boolean;
  wkbType(): number;
  area(): number;
  perimeter(): number;
  /** Child surface at `i` as a generic {@link QgsGeometry}. */
  surfaceN(i: number): QgsGeometry;
  /** Append a clone of the surface wrapped by `surfaceGeom`. */
  addSurface(surfaceGeom: QgsGeometry): boolean;
  asGeometry(): QgsGeometry;
  asWkt(precision: number): string;
  asWkb(): Uint8Array;
}

export interface QgsMultiSurfaceConstructors {
  QgsMultiSurface: {
    new (): QgsMultiSurface;
    fromGeometry(geom: QgsGeometry): QgsMultiSurface | null;
  };
}
