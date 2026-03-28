import type { QgsLayerTreeNode } from "./QgsLayerTreeNode";
import type { QgsLayerTreeLayer } from "./QgsLayerTreeLayer";

export interface QgsLayerTreeGroup extends QgsLayerTreeNode {
  isMutuallyExclusive: boolean;

  findLayers(): QgsLayerTreeLayer[];
  findGroup(name: string): QgsLayerTreeGroup | null;
  findLayer(layerId: string): QgsLayerTreeLayer | null;
  renderLegend(dpi: number): string;
}
