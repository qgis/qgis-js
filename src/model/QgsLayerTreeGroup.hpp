#pragma once

#include <string>

#include <qgslayertreegroup.h>

#include "./QgsLayerTreeNode.hpp"

class LayerTreeGroup : public LayerTreeNode {
public:
  LayerTreeGroup() : LayerTreeNode(nullptr) {}
  LayerTreeGroup(QgsLayerTreeGroup *group) : LayerTreeNode(group) {}

  emscripten::val findLayers() const {
    emscripten::val result = emscripten::val::array();
    if (auto *group = asGroup()) {
      for (QgsLayerTreeLayer *layerNode : group->findLayers()) {
        result.call<void>("push", wrapNode(layerNode));
      }
    }
    return result;
  }

  emscripten::val findGroup(std::string name) const {
    if (auto *group = asGroup()) {
      QgsLayerTreeGroup *found = group->findGroup(QString::fromStdString(name));
      if (found) return wrapNode(found);
    }
    return wrapNode(nullptr);
  }

  emscripten::val findLayer(std::string layerId) const {
    if (auto *group = asGroup()) {
      QgsLayerTreeLayer *found = group->findLayer(QString::fromStdString(layerId));
      if (found) return wrapNode(found);
    }
    return wrapNode(nullptr);
  }

  bool isMutuallyExclusive() const {
    if (auto *group = asGroup()) return group->isMutuallyExclusive();
    return false;
  }

  void setIsMutuallyExclusive(bool exclusive) {
    if (auto *group = asGroup()) group->setIsMutuallyExclusive(exclusive);
  }

private:
  QgsLayerTreeGroup *asGroup() const {
    Q_ASSERT(_node && _node->nodeType() == QgsLayerTreeNode::NodeGroup);
    return static_cast<QgsLayerTreeGroup *>(_node);
  }
};

EMSCRIPTEN_BINDINGS(QgsLayerTreeGroup) {
  emscripten::class_<LayerTreeGroup, emscripten::base<LayerTreeNode>>("QgsLayerTreeGroup")
    .function("findLayers", &LayerTreeGroup::findLayers)
    .function("findGroup", &LayerTreeGroup::findGroup)
    .function("findLayer", &LayerTreeGroup::findLayer)
    .property(
      "isMutuallyExclusive",
      &LayerTreeGroup::isMutuallyExclusive,
      &LayerTreeGroup::setIsMutuallyExclusive);
}
