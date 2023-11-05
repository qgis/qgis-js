#include <string>

#include <qgslayertree.h>
#include <qgsmaprenderercustompainterjob.h>
#include <qgsmaprenderersequentialjob.h>
#include <qgsmapsettings.h>
#include <qgsproject.h>
#include <qgstiles.h>

#include <QImage>
#include <QString>

#include "../model/MapLayer.hpp"
#include "../model/PointXY.hpp"
#include "../model/Rectangle.hpp"

#include <emscripten/bind.h>

QList<QgsMapLayer *> QgisApi_allLayers() {
  return QgsProject::instance()->layerTreeRoot()->layerOrder();
}

QList<QgsMapLayer *> QgisApi_visibleLayers() {
  QList<QgsMapLayer *> result = {};
  auto root = QgsProject::instance()->layerTreeRoot();
  const QList<QgsMapLayer *> allLayers = root->layerOrder();
  for (QgsMapLayer *layer : allLayers) {
    QgsLayerTreeLayer *nodeLayer = root->findLayer(layer->id());
    if (nodeLayer && nodeLayer->layer()->isSpatial() && nodeLayer->isVisible()) {
      result << layer;
    }
  }
  return result;
}

bool QgisApi_loadProject(std::string filename) {
  bool res = QgsProject::instance()->read(QString::fromStdString(filename));
  if (!res) return false;

  return true;
}

QgsRectangle QgisApi_fullExtent() {
  QgsMapSettings mapSettings;
  mapSettings.setDestinationCrs(QgsProject::instance()->crs());
  mapSettings.setLayers(QgisApi_visibleLayers());
  return mapSettings.fullExtent();
}

std::string QgisApi_srid() {
  return QgsProject::instance()->crs().authid().toStdString();
}

void QgisApi_renderXYZTile(
  unsigned long x,
  unsigned long y,
  unsigned int z,
  unsigned int tileSize,
  float pixelRatio,
  emscripten::val callback) {

  QgsMapSettings mapSettings;

  mapSettings.setBackgroundColor(Qt::transparent);
  mapSettings.setOutputSize(QSize(tileSize, tileSize));
  mapSettings.setOutputDpi(96.0 * pixelRatio);

  mapSettings.setLayers(QgisApi_visibleLayers());

  mapSettings.setDestinationCrs(QgsCoordinateReferenceSystem(QStringLiteral("EPSG:3857")));

  QgsTileMatrix mTileMatrix = QgsTileMatrix::fromWebMercator(z);
  mapSettings.setExtent(mTileMatrix.tileExtent(QgsTileXYZ(x, y, z)));

  mapSettings.setFlag(Qgis::MapSettingsFlag::RenderMapTile, true);

  QgsMapRendererSequentialJob *job = new QgsMapRendererSequentialJob(mapSettings);
  QObject::connect(job, &QgsMapRendererSequentialJob::finished, [job, callback] {
    auto image = job->renderedImage();
    image.rgbSwap(); // for html canvas
    callback(emscripten::val(emscripten::typed_memory_view(
      image.width() * image.height() * 4, (const unsigned char *)image.constBits())));
    job->deleteLater();
  });
  job->start();
}

void QgisApi_renderImage(
  std::string srid,
  const QgsRectangle &extent,
  unsigned int width,
  unsigned int height,
  float pixelRatio,
  emscripten::val callback) {

  QgsMapSettings mapSettings;

  mapSettings.setBackgroundColor(Qt::transparent);
  mapSettings.setOutputSize(QSize(width, height));
  mapSettings.setOutputDpi(96.0 * pixelRatio);

  mapSettings.setLayers(QgisApi_visibleLayers());

  mapSettings.setDestinationCrs(QgsCoordinateReferenceSystem(QString::fromStdString(srid)));

  mapSettings.setExtent(extent);

  QgsMapRendererSequentialJob *job = new QgsMapRendererSequentialJob(mapSettings);
  QObject::connect(job, &QgsMapRendererSequentialJob::finished, [job, callback] {
    auto image = job->renderedImage();
    image.rgbSwap(); // for html canvas
    callback(emscripten::val(emscripten::typed_memory_view(
      image.width() * image.height() * 4, (const unsigned char *)image.constBits())));
    job->deleteLater();
  });
  job->start();
}

const QgsRectangle QgisApi_transformRectangle(
  const QgsRectangle &inputRectangle, std::string inputSrid, std::string outputSrid) {
  QgsCoordinateTransform transform(
    QgsCoordinateReferenceSystem(QString::fromStdString(inputSrid)),
    QgsCoordinateReferenceSystem(QString::fromStdString(outputSrid)),
    QgsProject::instance());
  return transform.transformBoundingBox(inputRectangle);
}

const std::vector<MapLayer *> QgisApi_mapLayers() {
  std::vector<MapLayer *> result = {};
  for (QgsMapLayer *layer : QgisApi_allLayers()) {
    result.push_back(new MapLayer(layer));
  }
  return result;
}

EMSCRIPTEN_BINDINGS(QgisApi) {
  emscripten::function("loadProject", &QgisApi_loadProject);
  emscripten::function("fullExtent", &QgisApi_fullExtent);
  emscripten::function("srid", &QgisApi_srid);
  emscripten::function("renderImage", &QgisApi_renderImage);
  emscripten::function("renderXYZTile", &QgisApi_renderXYZTile);
  emscripten::function("transformRectangle", &QgisApi_transformRectangle);
  emscripten::function("mapLayers", &QgisApi_mapLayers, emscripten::allow_raw_pointers());
  emscripten::register_vector<MapLayer *>("vector<MapLayer *>");
}
