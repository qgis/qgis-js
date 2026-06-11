#pragma once

#include <optional>
#include <string>

#include <qgsexpressioncontext.h>
#include <qgsexpressioncontextutils.h>
#include <qgsmaplayer.h>
#include <qgsmemoryproviderutils.h>
#include <qgsproject.h>
#include <qgsvectordataprovider.h>
#include <qgsvectorlayer.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QgsExpressionContext.hpp"
#include "./QgsFeature.hpp"
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

  /**
   * Append a feature to the layer's data provider. For memory-provider
   * layers this works without `startEditing()`. Triggers a repaint so any
   * subscribed renderer (e.g. `QgisCanvasDataSource`) re-fetches the image.
   * Returns false if the layer has no data provider or the provider rejects
   * the feature.
   */
  bool addFeature(const Feature &feature) {
    auto *vl = asVectorLayer();
    if (!vl) return false;
    QgsVectorDataProvider *dp = vl->dataProvider();
    if (!dp) return false;
    QgsFeatureList list;
    list.append(feature.nativeFeature());
    bool ok = dp->addFeatures(list);
    if (ok) {
      vl->updateExtents();
      vl->triggerRepaint();
    }
    return ok;
  }

  /**
   * Create an in-memory vector layer from a schema. The returned layer is
   * heap-allocated and must be registered with the project via
   * `api.addMapLayer(layer)` to assume ownership — otherwise it leaks.
   *
   * `wkbType` follows `Qgis::WkbType` (see the `WkbType` TS enum).
   * `crs` is an authid string, e.g. `"EPSG:3857"`.
   */
  static VectorLayer
  createMemoryLayer(std::string name, int wkbType, std::string crs, const Fields &fields) {
    QgsVectorLayer *vl = QgsMemoryProviderUtils::createMemoryLayer(
      QString::fromStdString(name),
      fields.nativeFields(),
      static_cast<Qgis::WkbType>(wkbType),
      QgsCoordinateReferenceSystem(QString::fromStdString(crs)));
    return VectorLayer(vl);
  }

  QgsVectorLayer *nativeVectorLayer() const {
    return asVectorLayer();
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
    .class_function("createMemoryLayer", &VectorLayer::createMemoryLayer)
    .function("subsetString", &VectorLayer::subsetString)
    .function("setSubsetString", &VectorLayer::setSubsetString)
    .function("featureCount", &VectorLayer::featureCount)
    .function("fields", &VectorLayer::fields)
    .function("getFeatures", &VectorLayer::getFeatures)
    .function("displayExpression", &VectorLayer::displayExpression)
    .function("mapTipTemplate", &VectorLayer::mapTipTemplate)
    .function("createExpressionContext", &VectorLayer::createExpressionContext)
    .function("addFeature", &VectorLayer::addFeature);
}
