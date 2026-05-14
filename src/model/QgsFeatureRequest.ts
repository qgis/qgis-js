import type { QgsFields } from "./QgsFields";
import type { QgsRectangle } from "./QgsRectangle";

/**
 * Mirrors `Qgis::FeatureRequestFlag`. Values are bit flags and can be
 * combined with `|` before passing to {@link QgsFeatureRequest.setFlags}.
 *
 * {@link https://api.qgis.org/api/classQgis.html}
 */
export enum FeatureRequestFlag {
  NoFlags = 0,
  NoGeometry = 1,
  SubsetOfAttributes = 2,
  ExactIntersect = 4,
  IgnoreStaticNodesDuringExpressionCompilation = 8,
  EmbeddedSymbols = 16,
}

/**
 * A request describing which features to fetch from a vector layer:
 * spatial filter, attribute filter, fid filter, limit, and flags.
 *
 * {@link https://api.qgis.org/api/classQgsFeatureRequest.html}
 */
export interface QgsFeatureRequest {
  setFilterRect(rect: QgsRectangle): void;
  setFilterExpression(expression: string): void;
  setFilterFid(fid: number): void;
  setFilterFids(fids: number[]): void;
  setLimit(limit: number): void;
  /**
   * Combine {@link FeatureRequestFlag} values with `|` to build the bitmask.
   */
  setFlags(flags: number): void;
  flags(): number;
  setSubsetOfAttributes(names: string[], fields: QgsFields): void;
  /**
   * When set, the filter rect is interpreted in this CRS and returned
   * geometries are reprojected from the layer's source CRS into it.
   * @param authid SRID such as `"EPSG:3857"`.
   */
  setDestinationCrs(authid: string): void;
}

export interface QgsFeatureRequestConstructors {
  QgsFeatureRequest: { new (): QgsFeatureRequest };
}
