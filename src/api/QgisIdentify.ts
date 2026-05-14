import type { QgsFeature } from "../model/QgsFeature";
import type { QgsMapLayer } from "../model/QgsMapLayer";

/**
 * Subset of `QgsMapToolIdentify::IdentifyMode` that's meaningful in a
 * headless context. The GUI tool also has `ActiveLayer` and `LayerSelection`
 * modes; those are out of scope here.
 */
export enum IdentifyMode {
  /** Walk visible layers top-down, return after the first layer with hits. */
  TopDownStopAtFirst = 0,
  /** Walk all visible layers top-down, return every hit. */
  TopDownAll = 1,
}

/**
 * One vector layer's contribution to an identify result set.
 *
 * Slimmer than `QgsMapToolIdentify::IdentifyResult` — vector-only, no
 * derived attributes, no per-layer label. The full `QgsFeature` is in
 * `features` so callers can read attributes/geometry as usual.
 */
export interface IdentifyResult {
  layer: QgsMapLayer;
  features: QgsFeature[];
}
