import { QgsPointXY, QgsPointXYConstructors } from "../model/QgsPointXY";
import { QgsRectangle, QgsRectangleConstructors } from "../model/QgsRectangle";
import {
  QgsLayerTreeNode,
  QgsLayerTreeGroup,
  QgsLayerTreeLayer,
  LayerTreeNodeType,
} from "../model/QgsLayerTreeNode";
import { QgsMapRendererParallelJob } from "../model/QgsMapRendererParallelJob";
import { QgsMapRendererJob } from "../model/QgsMapRendererJob";
import { QgsMapRendererQImageJob } from "../model/QgsMapRendererQImageJob";

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
