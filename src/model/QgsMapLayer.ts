import type { QgsExpressionContext } from "./QgsExpressionContext";
import type { QgsFeature } from "./QgsFeature";
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
  /**
   * Append a feature to the layer's data provider and trigger a repaint.
   * For memory-provider layers this works without `startEditing()`. Returns
   * false if the provider rejected the feature.
   */
  addFeature(feature: QgsFeature): boolean;
}

export interface QgsVectorLayerConstructors {
  QgsVectorLayer: {
    /**
     * Create an in-memory vector layer with the given schema. The layer is
     * heap-allocated; call `api.addMapLayer(layer)` to transfer ownership
     * to the project, otherwise it leaks.
     *
     * @param name human-readable layer name
     * @param wkbType a {@link WkbType} value matching the geometry shape
     * @param crs authid like `"EPSG:3857"`
     * @param fields the field schema (build via `new QgsFields()` + `append`)
     */
    createMemoryLayer(
      name: string,
      wkbType: number,
      crs: string,
      fields: QgsFields,
    ): QgsVectorLayer;
  };
}
