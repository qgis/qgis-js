/**
 * Encapsulates a field's metadata: name, type, length, precision.
 *
 * {@link https://api.qgis.org/api/classQgsField.html}
 */
export interface QgsField {
  name(): string;
  typeName(): string;
  /**
   * QMetaType::Type enum value.
   */
  type(): number;
  alias(): string;
  length(): number;
  precision(): number;
}
