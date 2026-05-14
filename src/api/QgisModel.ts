import type { QgsPointXY, QgsPointXYConstructors } from "../model/QgsPointXY";
import type {
  QgsRectangle,
  QgsRectangleConstructors,
} from "../model/QgsRectangle";
import type { QgsLayerTreeModelLegendNode } from "../model/QgsLayerTreeModelLegendNode";
import type { QgsLayerTreeNode } from "../model/QgsLayerTreeNode";
import { NodeType } from "../model/QgsLayerTreeNode";
import type { QgsLayerTreeGroup } from "../model/QgsLayerTreeGroup";
import type { QgsLayerTreeLayer } from "../model/QgsLayerTreeLayer";
import type { QgsMapLayer, QgsVectorLayer } from "../model/QgsMapLayer";
import { LayerType } from "../model/QgsMapLayer";
import type { QgsMapRendererParallelJob } from "../model/QgsMapRendererParallelJob";
import type { QgsMapRendererJob } from "../model/QgsMapRendererJob";
import type { QgsMapRendererQImageJob } from "../model/QgsMapRendererQImageJob";
import type { QgsField } from "../model/QgsField";
import type { QgsFields } from "../model/QgsFields";
import type { QgsGeometry } from "../model/QgsGeometry";
import type { QgsFeature } from "../model/QgsFeature";
import type { QgsFeatureIterator } from "../model/QgsFeatureIterator";
import type {
  QgsFeatureRequest,
  QgsFeatureRequestConstructors,
} from "../model/QgsFeatureRequest";
import { FeatureRequestFlag } from "../model/QgsFeatureRequest";
import type {
  QgsExpression,
  QgsExpressionConstructors,
} from "../model/QgsExpression";
import type {
  QgsExpressionContext,
  QgsExpressionContextConstructors,
} from "../model/QgsExpressionContext";

export type {
  QgsMapRendererJob,
  QgsMapRendererQImageJob,
  QgsMapRendererParallelJob,
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
  QgsExpression,
  QgsExpressionContext,
};

export type { LayerDefinitionResult } from "./QgisApi";
export type { IdentifyResult } from "./QgisIdentify";
export { IdentifyMode } from "./QgisIdentify";

export { LayerType, NodeType, FeatureRequestFlag };

/* prettier-ignore */

export interface QgisModelConstructors
  extends
    QgsPointXYConstructors,
    QgsRectangleConstructors,
    QgsFeatureRequestConstructors,
    QgsExpressionConstructors,
    QgsExpressionContextConstructors
  {}
