import type { QgsGeometry } from "./QgsGeometry";

/**
 * A heterogeneous collection of geometries. Use the type-specific subclasses
 * ({@link QgsMultiPoint}, {@link QgsMultiLineString}, {@link QgsMultiPolygon})
 * when all child geometries share the same type.
 *
 * {@link https://api.qgis.org/api/classQgsGeometryCollection.html}
 */
export interface QgsGeometryCollection {
  numGeometries(): number;
  isEmpty(): boolean;
  wkbType(): number;
  geometryN(i: number): QgsGeometry;
  /** Append a clone of `geom` to the collection. */
  addGeometry(geom: QgsGeometry): void;
  asGeometry(): QgsGeometry;
  asWkt(precision: number): string;
  asWkb(): Uint8Array;
}

export interface QgsGeometryCollectionConstructors {
  QgsGeometryCollection: {
    new (): QgsGeometryCollection;
    fromGeometry(geom: QgsGeometry): QgsGeometryCollection | null;
  };
}
