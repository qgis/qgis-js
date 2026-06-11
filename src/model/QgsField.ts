/**
 * Common `QMetaType::Type` values for use with the {@link QgsField}
 * constructor. The numeric values are stable across Qt 6.x. See the full list
 * at {@link https://doc.qt.io/qt-6/qmetatype.html#Type-enum}.
 */
export enum FieldType {
  Bool = 1,
  Int = 2,
  LongLong = 4,
  Double = 6,
  String = 10,
  ByteArray = 12,
  Date = 14,
  Time = 15,
  DateTime = 16,
}

/**
 * Encapsulates a field's metadata: name, type, length, precision.
 *
 * Construct a new field for a memory layer schema:
 * ```ts
 * const f = new api.QgsField("population", FieldType.Int);
 * ```
 *
 * {@link https://api.qgis.org/api/classQgsField.html}
 */
export interface QgsField {
  name(): string;
  typeName(): string;
  /**
   * QMetaType::Type enum value — compare against {@link FieldType}.
   */
  type(): number;
  alias(): string;
  length(): number;
  precision(): number;
}

export interface QgsFieldConstructors {
  QgsField: {
    new (): QgsField;
    new (name: string, type: FieldType | number): QgsField;
  };
}
