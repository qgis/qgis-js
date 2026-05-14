import type { QgsFeature } from "./QgsFeature";
import type { QgsFields } from "./QgsFields";

/**
 * The scope stack that an expression sees during evaluation. Typically built
 * by `QgsVectorLayer.createExpressionContext()` which stacks the standard
 * global → project → layer scopes and sets the layer's fields.
 *
 * {@link https://api.qgis.org/api/classQgsExpressionContext.html}
 */
export interface QgsExpressionContext {
  setFeature(feature: QgsFeature): void;
  setFields(fields: QgsFields): void;
  variable(name: string): unknown;
}

export interface QgsExpressionContextConstructors {
  QgsExpressionContext: { new (): QgsExpressionContext };
}
