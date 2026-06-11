import type { QgsRectangle } from "./QgsRectangle";

/**
 * A geometry, mirroring the QGIS QgsGeometry value type. Use {@link asWkb},
 * {@link asWkt}, or {@link asJson} to serialize for consumption in JS (e.g.
 * `ol/format/WKB` in OpenLayers).
 *
 * {@link https://api.qgis.org/api/classQgsGeometry.html}
 */
export interface QgsGeometry {
  isNull(): boolean;
  isEmpty(): boolean;
  /**
   * The Qgis::WkbType enum value of the geometry. See {@link WkbType}.
   */
  wkbType(): number;
  /**
   * Well-Known Binary representation. Owned Uint8Array safe to keep across calls.
   */
  asWkb(): Uint8Array;
  /**
   * Well-Known Text representation.
   * @param precision number of decimal places for coordinate values (QGIS default is 17).
   */
  asWkt(precision: number): string;
  /**
   * GeoJSON geometry string (not a Feature). Call `JSON.parse` on the result for
   * an object literal.
   * @param precision number of decimal places for coordinate values (QGIS default is 17).
   */
  asJson(precision: number): string;
  /**
   * Planar area in the geometry's units. Always 0 for non-areal geometries.
   * For ellipsoidal area use a `QgsDistanceArea` (not yet bound).
   */
  area(): number;
  /**
   * Planar length: line length for curves, perimeter for polygons, 0 for points.
   */
  length(): number;
  /**
   * The geometric centroid. Always a single point even for collections.
   */
  centroid(): QgsGeometry;
  /**
   * Axis-aligned bounding box of the geometry.
   */
  boundingBox(): QgsRectangle;
  /**
   * Validity according to GEOS. Cheap; uses the same checks the QGIS validator
   * tool surfaces. For the list of errors use {@link validationErrors}.
   */
  isGeosValid(): boolean;
  /**
   * Human-readable validation messages. Empty array when the geometry is valid.
   */
  validationErrors(): string[];
}

export interface QgsGeometryConstructors {
  QgsGeometry: {
    new (): QgsGeometry;
    fromWkt(wkt: string): QgsGeometry;
    fromWkb(wkb: Uint8Array): QgsGeometry;
  };
}
