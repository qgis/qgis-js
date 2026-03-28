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
} from "../../../src/api/QgisModel";

export { LayerType, NodeType } from "../../../src/api/QgisModel";

export { qgis } from "./loader";
