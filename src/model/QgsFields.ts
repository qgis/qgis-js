import type { QgsField } from "./QgsField";

/**
 * Container of fields for a vector layer or feature.
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
}
