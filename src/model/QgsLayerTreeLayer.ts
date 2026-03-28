import type { QgsLayerTreeNode } from "./QgsLayerTreeNode";
import type { QgsMapLayer } from "./QgsMapLayer";

export interface QgsLayerTreeLayer extends QgsLayerTreeNode {
  layerId(): string;
  layer(): QgsMapLayer | null;
}
