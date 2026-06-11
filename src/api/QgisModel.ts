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
import type {
  QgsMapLayer,
  QgsVectorLayer,
  QgsVectorLayerConstructors,
} from "../model/QgsMapLayer";
import { LayerType } from "../model/QgsMapLayer";
import type { QgsMapRendererParallelJob } from "../model/QgsMapRendererParallelJob";
import type { QgsMapRendererJob } from "../model/QgsMapRendererJob";
import type { QgsMapRendererQImageJob } from "../model/QgsMapRendererQImageJob";
import type { QgsField, QgsFieldConstructors } from "../model/QgsField";
import { FieldType } from "../model/QgsField";
import type { QgsFields, QgsFieldsConstructors } from "../model/QgsFields";
import type {
  QgsGeometry,
  QgsGeometryConstructors,
} from "../model/QgsGeometry";
import type { QgsPoint, QgsPointConstructors } from "../model/QgsPoint";
import type {
  QgsLineString,
  QgsLineStringConstructors,
} from "../model/QgsLineString";
import type { QgsPolygon, QgsPolygonConstructors } from "../model/QgsPolygon";
import type {
  QgsGeometryCollection,
  QgsGeometryCollectionConstructors,
} from "../model/QgsGeometryCollection";
import type {
  QgsMultiPoint,
  QgsMultiPointConstructors,
} from "../model/QgsMultiPoint";
import type {
  QgsMultiLineString,
  QgsMultiLineStringConstructors,
} from "../model/QgsMultiLineString";
import type {
  QgsMultiPolygon,
  QgsMultiPolygonConstructors,
} from "../model/QgsMultiPolygon";
import type {
  QgsCircularString,
  QgsCircularStringConstructors,
} from "../model/QgsCircularString";
import type {
  QgsCompoundCurve,
  QgsCompoundCurveConstructors,
} from "../model/QgsCompoundCurve";
import type {
  QgsCurvePolygon,
  QgsCurvePolygonConstructors,
} from "../model/QgsCurvePolygon";
import type {
  QgsMultiCurve,
  QgsMultiCurveConstructors,
} from "../model/QgsMultiCurve";
import type {
  QgsMultiSurface,
  QgsMultiSurfaceConstructors,
} from "../model/QgsMultiSurface";
import type {
  QgsTriangle,
  QgsTriangleConstructors,
} from "../model/QgsTriangle";
import type { QgsCircle, QgsCircleConstructors } from "../model/QgsCircle";
import type { QgsEllipse, QgsEllipseConstructors } from "../model/QgsEllipse";
import type {
  QgsRegularPolygon,
  QgsRegularPolygonConstructors,
} from "../model/QgsRegularPolygon";
import type {
  QgsQuadrilateral,
  QgsQuadrilateralConstructors,
} from "../model/QgsQuadrilateral";
import type { QgsBox3D, QgsBox3DConstructors } from "../model/QgsBox3D";
import type {
  QgsWkbTypes,
  QgsWkbTypesConstructors,
} from "../model/QgsWkbTypes";
import { WkbType, GeometryType } from "../model/QgsWkbTypes";
import type { QgsFeature, QgsFeatureConstructors } from "../model/QgsFeature";
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
  QgsPoint,
  QgsLineString,
  QgsPolygon,
  QgsGeometryCollection,
  QgsMultiPoint,
  QgsMultiLineString,
  QgsMultiPolygon,
  QgsCircularString,
  QgsCompoundCurve,
  QgsCurvePolygon,
  QgsMultiCurve,
  QgsMultiSurface,
  QgsTriangle,
  QgsCircle,
  QgsEllipse,
  QgsRegularPolygon,
  QgsQuadrilateral,
  QgsBox3D,
  QgsWkbTypes,
  QgsFeature,
  QgsFeatureIterator,
  QgsFeatureRequest,
  QgsExpression,
  QgsExpressionContext,
};

export type { LayerDefinitionResult } from "./QgisApi";
export type { IdentifyResult } from "./QgisIdentify";
export { IdentifyMode } from "./QgisIdentify";

export {
  LayerType,
  NodeType,
  FeatureRequestFlag,
  WkbType,
  GeometryType,
  FieldType,
};

/* prettier-ignore */

export interface QgisModelConstructors
  extends
    QgsPointXYConstructors,
    QgsRectangleConstructors,
    QgsFeatureRequestConstructors,
    QgsExpressionConstructors,
    QgsExpressionContextConstructors,
    QgsGeometryConstructors,
    QgsPointConstructors,
    QgsLineStringConstructors,
    QgsPolygonConstructors,
    QgsGeometryCollectionConstructors,
    QgsMultiPointConstructors,
    QgsMultiLineStringConstructors,
    QgsMultiPolygonConstructors,
    QgsCircularStringConstructors,
    QgsCompoundCurveConstructors,
    QgsCurvePolygonConstructors,
    QgsMultiCurveConstructors,
    QgsMultiSurfaceConstructors,
    QgsTriangleConstructors,
    QgsCircleConstructors,
    QgsEllipseConstructors,
    QgsRegularPolygonConstructors,
    QgsQuadrilateralConstructors,
    QgsBox3DConstructors,
    QgsWkbTypesConstructors,
    QgsFieldConstructors,
    QgsFieldsConstructors,
    QgsFeatureConstructors,
    QgsVectorLayerConstructors
  {}
