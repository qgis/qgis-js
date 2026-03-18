import type { QgsPointXY, QgsPointXYConstructors } from "../model/QgsPointXY";
import type {
  QgsRectangle,
  QgsRectangleConstructors,
} from "../model/QgsRectangle";
import type {
  QgsLayerTreeNode,
  QgsLayerTreeGroup,
  QgsLayerTreeLayer,
  LayerTreeNodeType,
} from "../model/QgsLayerTreeNode";
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
  LayerTreeNodeType,
};

/* prettier-ignore */

export interface QgisModelConstructors
  extends
    QgsPointXYConstructors,
    QgsRectangleConstructors
  {}
