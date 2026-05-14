import type { QgsExpressionContext } from "./QgsExpressionContext";
import type { QgsFeatureIterator } from "./QgsFeatureIterator";
import type { QgsFeatureRequest } from "./QgsFeatureRequest";
import type { QgsFields } from "./QgsFields";

export enum LayerType {
  Vector = 0,
  Raster = 1,
  Plugin = 2,
  Mesh = 3,
  VectorTile = 4,
  Annotation = 5,
  PointCloud = 6,
  Group = 7,
  TiledScene = 8,
}

export interface QgsMapLayer {
  name: string;
  opacity: number;

  isValid(): boolean;
  type(): LayerType;
  id(): string;
  /**
   * The authid of the layer's source CRS (e.g. `"EPSG:4326"`). Geometries
   * returned by features are expressed in this CRS unless the request used
   * to fetch them sets a different destination CRS via
   * `QgsFeatureRequest.setDestinationCrs()`.
   */
  crs(): string;
}

export interface QgsVectorLayer extends QgsMapLayer {
  subsetString(): string;
  setSubsetString(subset: string): boolean;
  featureCount(): number;
  fields(): QgsFields;
  getFeatures(request?: QgsFeatureRequest): QgsFeatureIterator;
  /** The configured display expression (e.g. `"name"`). Empty if none. */
  displayExpression(): string;
  /** The HTML map-tip template, which may contain `[% expr %]` placeholders. Empty if none. */
  mapTipTemplate(): string;
  /**
   * Builds an expression context with the standard scopes stacked
   * (global → project → layer) and the layer's fields set. Call
   * `setFeature(feature)` on the result before passing to an expression.
   */
  createExpressionContext(): QgsExpressionContext;
}
