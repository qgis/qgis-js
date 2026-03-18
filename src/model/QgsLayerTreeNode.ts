export type LayerTreeNodeType = "group" | "layer" | "";

export interface QgsLayerTreeNode {
  name: string;
  itemVisibilityChecked: boolean;
  expanded: boolean;

  isValid(): boolean;
  nodeType(): LayerTreeNodeType;
  isGroup(): boolean;
  isLayer(): boolean;
  isVisible(): boolean;
  children(): (QgsLayerTreeGroup | QgsLayerTreeLayer)[];
}

export interface QgsLayerTreeGroup extends QgsLayerTreeNode {
  isMutuallyExclusive: boolean;

  findLayers(): QgsLayerTreeLayer[];
  findGroup(name: string): QgsLayerTreeGroup | null;
  findLayer(layerId: string): QgsLayerTreeLayer | null;
}

export interface QgsLayerTreeLayer extends QgsLayerTreeNode {
  opacity: number;

  layerId(): string;
}
