#pragma once

#include <string>

#include <qgsmaplayer.h>
#include <qgsvectorlayer.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

class VectorLayer;

emscripten::val wrapLayer(QgsMapLayer *layer);

class MapLayer {
public:
  MapLayer() : _layer(nullptr) {}
  MapLayer(QgsMapLayer *layer) : _layer(layer) {}
  virtual ~MapLayer() = default;

  bool isValid() const {
    return _layer != nullptr;
  }

  int type() const {
    if (!_layer) return -1;
    return static_cast<int>(_layer->type());
  }

  std::string id() const {
    if (!_layer) return "";
    return _layer->id().toStdString();
  }

  std::string name() const {
    if (!_layer) return "";
    return _layer->name().toStdString();
  }

  void setName(std::string name) {
    if (_layer) _layer->setName(QString::fromStdString(name));
  }

  double opacity() const {
    if (!_layer) return 1.0;
    return _layer->opacity();
  }

  void setOpacity(double opacity) {
    if (_layer) _layer->setOpacity(opacity);
  }

protected:
  QgsMapLayer *_layer;
};

class VectorLayer : public MapLayer {
public:
  VectorLayer() : MapLayer(nullptr) {}
  VectorLayer(QgsVectorLayer *layer) : MapLayer(layer) {}

  std::string subsetString() const {
    if (auto *vl = asVectorLayer()) return vl->subsetString().toStdString();
    return "";
  }

  bool setSubsetString(std::string subset) {
    if (auto *vl = asVectorLayer()) return vl->setSubsetString(QString::fromStdString(subset));
    return false;
  }

private:
  QgsVectorLayer *asVectorLayer() const {
    Q_ASSERT(_layer && _layer->type() == Qgis::LayerType::Vector);
    return static_cast<QgsVectorLayer *>(_layer);
  }
};

inline emscripten::val wrapLayer(QgsMapLayer *layer) {
  if (!layer) return emscripten::val::null();
  if (layer->type() == Qgis::LayerType::Vector)
    return emscripten::val(VectorLayer(static_cast<QgsVectorLayer *>(layer)));
  return emscripten::val(MapLayer(layer));
}

EMSCRIPTEN_BINDINGS(QgsMapLayer) {
  emscripten::class_<MapLayer>("QgsMapLayer")
    .constructor<>()
    .function("isValid", &MapLayer::isValid)
    .function("type", &MapLayer::type)
    .function("id", &MapLayer::id)
    .property("name", &MapLayer::name, &MapLayer::setName)
    .property("opacity", &MapLayer::opacity, &MapLayer::setOpacity);

  emscripten::class_<VectorLayer, emscripten::base<MapLayer>>("QgsVectorLayer")
    .function("subsetString", &VectorLayer::subsetString)
    .function("setSubsetString", &VectorLayer::setSubsetString);
}
