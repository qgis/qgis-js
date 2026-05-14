#pragma once

#include <optional>
#include <string>

#include <qgsexpressioncontext.h>
#include <qgsexpressioncontextutils.h>
#include <qgsmaplayer.h>
#include <qgsproject.h>
#include <qgsvectorlayer.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QgsExpressionContext.hpp"
#include "./QgsFeatureIterator.hpp"
#include "./QgsFeatureRequest.hpp"
#include "./QgsFields.hpp"

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

  std::string crs() const {
    if (!_layer) return "";
    return _layer->crs().authid().toStdString();
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

  double featureCount() const {
    if (auto *vl = asVectorLayer()) return static_cast<double>(vl->featureCount());
    return 0;
  }

  Fields fields() const {
    if (auto *vl = asVectorLayer()) return Fields(vl->fields());
    return Fields();
  }

  FeatureIterator getFeatures(std::optional<FeatureRequest> request) const {
    auto *vl = asVectorLayer();
    if (!vl) return FeatureIterator();
    if (request.has_value()) {
      return FeatureIterator(vl->getFeatures(request->nativeRequest()));
    }
    return FeatureIterator(vl->getFeatures());
  }

  std::string displayExpression() const {
    if (auto *vl = asVectorLayer()) return vl->displayExpression().toStdString();
    return "";
  }

  std::string mapTipTemplate() const {
    if (auto *vl = asVectorLayer()) return vl->mapTipTemplate().toStdString();
    return "";
  }

  ExpressionContext createExpressionContext() const {
    auto *vl = asVectorLayer();
    if (!vl) return ExpressionContext();
    QgsExpressionContext ctx = QgsProject::instance()->createExpressionContext();
    ctx << QgsExpressionContextUtils::layerScope(vl);
    ctx.setFields(vl->fields());
    return ExpressionContext(ctx);
  }

private:
  QgsVectorLayer *asVectorLayer() const {
    if (!_layer) return nullptr;
    Q_ASSERT(_layer->type() == Qgis::LayerType::Vector);
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
    .function("crs", &MapLayer::crs)
    .property("name", &MapLayer::name, &MapLayer::setName)
    .property("opacity", &MapLayer::opacity, &MapLayer::setOpacity);

  emscripten::class_<VectorLayer, emscripten::base<MapLayer>>("QgsVectorLayer")
    .function("subsetString", &VectorLayer::subsetString)
    .function("setSubsetString", &VectorLayer::setSubsetString)
    .function("featureCount", &VectorLayer::featureCount)
    .function("fields", &VectorLayer::fields)
    .function("getFeatures", &VectorLayer::getFeatures)
    .function("displayExpression", &VectorLayer::displayExpression)
    .function("mapTipTemplate", &VectorLayer::mapTipTemplate)
    .function("createExpressionContext", &VectorLayer::createExpressionContext);
}
