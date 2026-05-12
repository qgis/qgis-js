/**
 * The version of qgis-js.
 */
export const QGIS_JS_VERSION: string =
  //@ts-ignore (will be defined by vite)
  __QGIS_JS_VERSION;

export type {
  QgisApi,
  QgisApiAdapter,
  CommonQgisApi,
  InternalQgisApi,
  LayerDefinitionResult,
} from "../../../src/api/QgisApi";

export type { EmscriptenFS } from "./emscripten";

export type {
  QgsPointXY,
  QgsRectangle,
  QgsLayerTreeModelLegendNode,
  QgsLayerTreeNode,
  QgsLayerTreeGroup,
  QgsLayerTreeLayer,
  QgsMapLayer,
  QgsVectorLayer,
  QgsField,
  QgsFields,
  QgsGeometry,
  QgsFeature,
  QgsFeatureIterator,
  QgsFeatureRequest,
} from "../../../src/api/QgisModel";

export {
  LayerType,
  NodeType,
  FeatureRequestFlag,
  IdentifyMode,
} from "../../../src/api/QgisModel";

export type { IdentifyResult } from "../../../src/api/QgisModel";

export { qgis } from "./loader";
