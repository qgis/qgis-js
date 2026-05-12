import type { QgsFeature } from "./QgsFeature";

/**
 * Iterates features pulled lazily from a vector layer (or its data provider).
 * Hold an iterator open across calls to read large layers without
 * materializing all features at once.
 *
 * Differs from the C++ API in that {@link nextFeature} returns the feature
 * value (or null when exhausted) rather than mutating an out-parameter and
 * returning a boolean — that pattern doesn't translate to JS.
 *
 * Callers should {@link close} the iterator when done. Reaching the end
 * (`nextFeature() === null`) closes it implicitly inside QGIS.
 *
 * {@link https://api.qgis.org/api/classQgsFeatureIterator.html}
 */
export interface QgsFeatureIterator {
  nextFeature(): QgsFeature | null;
  rewind(): boolean;
  close(): boolean;
  isClosed(): boolean;
  isValid(): boolean;
}
