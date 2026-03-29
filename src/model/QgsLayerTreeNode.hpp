#pragma once

#include <string>

#include <qgslayertree.h>

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

  int nodeType() const {
    if (!_node) return -1;
    return static_cast<int>(_node->nodeType());
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

  QgsLayerTreeNode *nativeNode() const {
    return _node;
  }

protected:
  QgsLayerTreeNode *_node;
};

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
}
