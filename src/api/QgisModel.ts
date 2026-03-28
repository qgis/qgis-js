import type { QgsPointXY, QgsPointXYConstructors } from "../model/QgsPointXY";
import type {
  QgsRectangle,
  QgsRectangleConstructors,
} from "../model/QgsRectangle";
import type { QgsLayerTreeNode } from "../model/QgsLayerTreeNode";
import { NodeType } from "../model/QgsLayerTreeNode";
import type { QgsLayerTreeGroup } from "../model/QgsLayerTreeGroup";
import type { QgsLayerTreeLayer } from "../model/QgsLayerTreeLayer";
import type { QgsMapLayer, QgsVectorLayer } from "../model/QgsMapLayer";
import { LayerType } from "../model/QgsMapLayer";
import type { QgsMapRendererParallelJob } from "../model/QgsMapRendererParallelJob";
import type { QgsMapRendererJob } from "../model/QgsMapRendererJob";
import type { QgsMapRendererQImageJob } from "../model/QgsMapRendererQImageJob";

export type {
  QgsMapRendererJob,
  QgsMapRendererQImageJob,
  QgsMapRendererParallelJob,
  QgsPointXY,
  QgsRectangle,
  QgsLayerTreeNode,
  QgsLayerTreeGroup,
  QgsLayerTreeLayer,
  QgsMapLayer,
  QgsVectorLayer,
};

export { LayerType, NodeType };

/* prettier-ignore */

export interface QgisModelConstructors
  extends
    QgsPointXYConstructors,
    QgsRectangleConstructors
  {}
