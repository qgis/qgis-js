import type { QgsFields } from "./QgsFields";
import type { QgsGeometry } from "./QgsGeometry";

/**
 * A single feature: an id, a geometry, and an ordered list of attribute values.
 *
 * Construct from a schema to push into a memory layer:
 * ```ts
 * const feat = new api.QgsFeature(fields);
 * feat.setGeometry(geom);
 * feat.setAttribute("name", "Alpha");
 * layer.addFeature(feat);
 * ```
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
  /** Replace the feature's geometry (the feature stores a copy). */
  setGeometry(geom: QgsGeometry): void;
  /**
   * Set an attribute by field name or zero-based index. Numbers map to
   * doubles, strings to QString, booleans to bool, null/undefined to NULL,
   * Uint8Array to QByteArray. Returns false if the name/index is unknown.
   */
  setAttribute(
    nameOrIndex: string | number,
    value: string | number | boolean | Uint8Array | null,
  ): boolean;
}

export interface QgsFeatureConstructors {
  QgsFeature: {
    new (): QgsFeature;
    /** Construct with a schema — attributes are initialised to NULL. */
    new (fields: QgsFields): QgsFeature;
  };
}
