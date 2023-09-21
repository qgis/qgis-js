
#include <string>

#include <qgslayertreemodel.h>
#include <qgslayertreeutils.h>
#include <qgsmaplayer.h>

#include <emscripten/bind.h>

class MapLayer {
public:
  MapLayer(QgsMapLayer *qgsMapLayer) :
    qgsMapLayer(qgsMapLayer)

  {}

  std::string name() const {
    return this->layer()->name().toStdString();
  }

  void setName(std::string name) {
    this->layer()->setName(QString::fromStdString(name));
  }

  bool isVisible() const {
    return this->node()->itemVisibilityChecked();
  }

  void setVisible(bool visible) {
    this->node()->setItemVisibilityChecked(visible);
  }

  double opacity() const {
    return this->layer()->opacity();
  }

  void setOpacity(double opacity) {
    this->layer()->setOpacity(opacity);
  }

protected:
  QgsMapLayer *layer() const {
    return qgsMapLayer;
  }

  QgsLayerTreeLayer *node() const {
    return QgsProject::instance()->layerTreeRoot()->findLayer(this->layer()->id());
  }

private:
  QgsMapLayer *qgsMapLayer;
};

EMSCRIPTEN_BINDINGS(MapLayer) {
  emscripten::class_<MapLayer>("MapLayer")
    .property("name", &MapLayer::name, &MapLayer::setName)
    .property("visible", &MapLayer::isVisible, &MapLayer::setVisible)
    .property("opacity", &MapLayer::opacity, &MapLayer::setOpacity);
}
