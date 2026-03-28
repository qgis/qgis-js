import type { QgsLayerTreeGroup } from "./QgsLayerTreeGroup";
import type { QgsLayerTreeLayer } from "./QgsLayerTreeLayer";

export enum NodeType {
  NodeGroup = 0,
  NodeLayer = 1,
}

export interface QgsLayerTreeNode {
  name: string;
  itemVisibilityChecked: boolean;
  expanded: boolean;

  isValid(): boolean;
  nodeType(): NodeType;
  isGroup(): boolean;
  isLayer(): boolean;
  isVisible(): boolean;
  children(): (QgsLayerTreeGroup | QgsLayerTreeLayer)[];
}
