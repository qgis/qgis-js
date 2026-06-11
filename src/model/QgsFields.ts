import type { QgsField } from "./QgsField";

/**
 * Container of fields for a vector layer or feature.
 *
 * To build a schema for {@link QgsVectorLayerConstructors.createMemoryLayer}:
 * ```ts
 * const fields = new api.QgsFields();
 * fields.append(new api.QgsField("name", FieldType.String));
 * fields.append(new api.QgsField("population", FieldType.Int));
 * ```
 *
 * {@link https://api.qgis.org/api/classQgsFields.html}
 */
export interface QgsFields {
  count(): number;
  at(index: number): QgsField;
  /**
   * Lookup a field by name. Returns null if no field with that name exists.
   */
  field(name: string): QgsField | null;
  /**
   * Append a copy of `field`. Returns `false` and leaves the schema unchanged
   * if a field with the same name already exists.
   */
  append(field: QgsField): boolean;
}

export interface QgsFieldsConstructors {
  QgsFields: {
    new (): QgsFields;
  };
}
