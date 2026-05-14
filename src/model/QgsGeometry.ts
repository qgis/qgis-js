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
   * The Qgis::WkbType enum value of the geometry.
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
}
