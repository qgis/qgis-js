import type { QgsFields } from "./QgsFields";
import type { QgsGeometry } from "./QgsGeometry";

/**
 * A single feature: an id, a geometry, and an ordered list of attribute values.
 *
 * {@link https://api.qgis.org/api/classQgsFeature.html}
 */
export interface QgsFeature {
  id(): number;
  isValid(): boolean;
  hasGeometry(): boolean;
  geometry(): QgsGeometry;
  fields(): QgsFields;
  attributeCount(): number;
  /**
   * All attribute values in field order. Scalar values are converted to JS
   * primitives via QVariant; geometry is NOT included.
   */
  attributes(): unknown[];
  /**
   * Single attribute value by field name or zero-based index. Returns null
   * when the field is unknown or the value is null.
   */
  attribute(nameOrIndex: string | number): unknown | null;
}
