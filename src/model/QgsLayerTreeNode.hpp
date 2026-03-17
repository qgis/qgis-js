#pragma once

#include <string>

#include <qgslayertree.h>
#include <qgslayertreegroup.h>
#include <qgslayertreelayer.h>
#include <qgsmaplayer.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

class LayerTreeGroup;
class LayerTreeLayer;

emscripten::val wrapNode(QgsLayerTreeNode *node);

class LayerTreeNode {
public:
  LayerTreeNode() : _node(nullptr) {}
  LayerTreeNode(QgsLayerTreeNode *node) : _node(node) {}
  virtual ~LayerTreeNode() = default;

  bool isValid() const {
    return _node != nullptr;
  }

  std::string nodeType() const {
    if (!_node) return "";
    return _node->nodeType() == QgsLayerTreeNode::NodeGroup ? "group" : "layer";
  }

  bool isGroup() const {
    return _node && _node->nodeType() == QgsLayerTreeNode::NodeGroup;
  }

  bool isLayer() const {
    return _node && _node->nodeType() == QgsLayerTreeNode::NodeLayer;
  }

  std::string name() const {
    if (!_node) return "";
    return _node->name().toStdString();
  }

  void setName(std::string name) {
    if (_node) _node->setName(QString::fromStdString(name));
  }

  bool isVisible() const {
    if (!_node) return false;
    return _node->isVisible();
  }

  bool itemVisibilityChecked() const {
    if (!_node) return false;
    return _node->itemVisibilityChecked();
  }

  void setItemVisibilityChecked(bool checked) {
    if (_node) _node->setItemVisibilityChecked(checked);
  }

  bool isExpanded() const {
    if (!_node) return false;
    return _node->isExpanded();
  }

  void setExpanded(bool expanded) {
    if (_node) _node->setExpanded(expanded);
  }

  emscripten::val children() const {
    emscripten::val result = emscripten::val::array();
    if (!_node) return result;
    for (QgsLayerTreeNode *child : _node->children()) {
      result.call<void>("push", wrapNode(child));
    }
    return result;
  }

protected:
  QgsLayerTreeNode *_node;
};

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

class LayerTreeLayer : public LayerTreeNode {
public:
  LayerTreeLayer() : LayerTreeNode(nullptr) {}
  LayerTreeLayer(QgsLayerTreeLayer *layer) : LayerTreeNode(layer) {}

  std::string layerId() const {
    if (auto *layer = asLayer()) return layer->layerId().toStdString();
    return "";
  }

  double opacity() const {
    if (auto *layer = asLayer()) {
      if (layer->layer()) return layer->layer()->opacity();
    }
    return 1.0;
  }

  void setOpacity(double opacity) {
    if (auto *layer = asLayer()) {
      if (layer->layer()) layer->layer()->setOpacity(opacity);
    }
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

EMSCRIPTEN_BINDINGS(QgsLayerTreeNode) {
  emscripten::class_<LayerTreeNode>("QgsLayerTreeNode")
    .constructor<>()
    .function("isValid", &LayerTreeNode::isValid)
    .function("nodeType", &LayerTreeNode::nodeType)
    .function("isGroup", &LayerTreeNode::isGroup)
    .function("isLayer", &LayerTreeNode::isLayer)
    .property("name", &LayerTreeNode::name, &LayerTreeNode::setName)
    .function("isVisible", &LayerTreeNode::isVisible)
    .property(
      "itemVisibilityChecked",
      &LayerTreeNode::itemVisibilityChecked,
      &LayerTreeNode::setItemVisibilityChecked)
    .property("expanded", &LayerTreeNode::isExpanded, &LayerTreeNode::setExpanded)
    .function("children", &LayerTreeNode::children);

  emscripten::class_<LayerTreeGroup, emscripten::base<LayerTreeNode>>("QgsLayerTreeGroup")
    .function("findLayers", &LayerTreeGroup::findLayers)
    .function("findGroup", &LayerTreeGroup::findGroup)
    .function("findLayer", &LayerTreeGroup::findLayer)
    .property(
      "isMutuallyExclusive",
      &LayerTreeGroup::isMutuallyExclusive,
      &LayerTreeGroup::setIsMutuallyExclusive);

  emscripten::class_<LayerTreeLayer, emscripten::base<LayerTreeNode>>("QgsLayerTreeLayer")
    .function("layerId", &LayerTreeLayer::layerId)
    .property("opacity", &LayerTreeLayer::opacity, &LayerTreeLayer::setOpacity);
}
