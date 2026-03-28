#pragma once

#include <string>

#include <qgslayertree.h>
#include <qgslayertreelayer.h>

#include "./QgsLayerTreeGroup.hpp"
#include "./QgsMapLayer.hpp"

class LayerTreeLayer : public LayerTreeNode {
public:
  LayerTreeLayer() : LayerTreeNode(nullptr) {}
  LayerTreeLayer(QgsLayerTreeLayer *layer) : LayerTreeNode(layer) {}

  std::string layerId() const {
    if (auto *layer = asLayer()) return layer->layerId().toStdString();
    return "";
  }

  emscripten::val layer() const {
    if (auto *treeLayer = asLayer()) return wrapLayer(treeLayer->layer());
    return emscripten::val::null();
  }

  std::string renderLegend(float dpi) const {
    auto *treeLayer = asLayer();
    if (!treeLayer || !treeLayer->layer()) return "";
    QgsLayerTree tempRoot;
    tempRoot.addLayer(treeLayer->layer());
    return renderLegendForTree(&tempRoot, dpi);
  }

  emscripten::val legendNodes() const {
    emscripten::val result = emscripten::val::array();
    auto *treeLayer = asLayer();
    if (!treeLayer || !treeLayer->layer() || !treeLayer->layer()->legend()) return result;
    qDeleteAll(legendNodesCache());
    legendNodesCache() = treeLayer->layer()->legend()->createLayerTreeModelLegendNodes(treeLayer);
    for (auto *node : legendNodesCache()) {
      result.call<void>("push", LegendNode(node));
    }
    return result;
  }

private:
  QgsLayerTreeLayer *asLayer() const {
    Q_ASSERT(_node && _node->nodeType() == QgsLayerTreeNode::NodeLayer);
    return static_cast<QgsLayerTreeLayer *>(_node);
  }
};

inline emscripten::val wrapNode(QgsLayerTreeNode *node) {
  if (!node) return emscripten::val::null();
  if (QgsLayerTree::isGroup(node))
    return emscripten::val(LayerTreeGroup(static_cast<QgsLayerTreeGroup *>(node)));
  return emscripten::val(LayerTreeLayer(static_cast<QgsLayerTreeLayer *>(node)));
}

EMSCRIPTEN_BINDINGS(QgsLayerTreeLayer) {
  emscripten::class_<LayerTreeLayer, emscripten::base<LayerTreeNode>>("QgsLayerTreeLayer")
    .function("layerId", &LayerTreeLayer::layerId)
    .function("layer", &LayerTreeLayer::layer)
    .function("legendNodes", &LayerTreeLayer::legendNodes)
    .function("renderLegend", &LayerTreeLayer::renderLegend);
}
