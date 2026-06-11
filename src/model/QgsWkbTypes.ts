/**
 * Common WKB type constants matching `Qgis::WkbType`. Z/M variants follow the
 * QGIS offsets (Z = +1000, M = +2000, ZM = +3000). For an exhaustive list see
 * {@link https://api.qgis.org/api/classQgis.html}.
 */
export enum WkbType {
  Unknown = 0,
  Point = 1,
  LineString = 2,
  Polygon = 3,
  MultiPoint = 4,
  MultiLineString = 5,
  MultiPolygon = 6,
  GeometryCollection = 7,
  CircularString = 8,
  CompoundCurve = 9,
  CurvePolygon = 10,
  MultiCurve = 11,
  MultiSurface = 12,
  Triangle = 17,
  NoGeometry = 100,
}

/**
 * Mirror of `Qgis::GeometryType` — the four families of geometry. Returned by
 * {@link QgsWkbTypes.geometryType}.
 */
export enum GeometryType {
  Point = 0,
  Line = 1,
  Polygon = 2,
  Unknown = 3,
  Null = 4,
}

/**
 * Static helpers for inspecting and converting WKB type integers.
 *
 * {@link https://api.qgis.org/api/classQgsWkbTypes.html}
 */
export interface QgsWkbTypes {
  // intentionally empty — instance methods are not exposed
}

export interface QgsWkbTypesConstructors {
  QgsWkbTypes: {
    displayString(type: number): string;
    geometryType(type: number): GeometryType;
    flatType(type: number): WkbType;
    singleType(type: number): WkbType;
    multiType(type: number): WkbType;
    hasZ(type: number): boolean;
    hasM(type: number): boolean;
    isSingleType(type: number): boolean;
    isMultiType(type: number): boolean;
  };
}
