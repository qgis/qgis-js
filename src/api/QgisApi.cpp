#include <string>

#include <qgslayertree.h>
#include <qgsmaprenderercustompainterjob.h>
#include <qgsmaprenderersequentialjob.h>
#include <qgsmapsettings.h>
#include <qgsproject.h>
#include <qgstiles.h>

#include <QImage>
#include <QString>

#include <emscripten/bind.h>

static QList<QgsMapLayer *> gVisibleLayers;

bool QgisApi_loadProject(std::string filename) {

  gVisibleLayers.clear();

  bool res = QgsProject::instance()->read(QString::fromStdString(filename));
  if (!res) return false;

  QgsLayerTree *root = QgsProject::instance()->layerTreeRoot();
  const QList<QgsMapLayer *> allLayers = root->layerOrder();
  for (QgsMapLayer *layer : allLayers) {
    QgsLayerTreeLayer *nodeLayer = root->findLayer(layer->id());
    if (nodeLayer && nodeLayer->layer()->isSpatial() && nodeLayer->isVisible())
      gVisibleLayers << layer;
  }

  return true;
}

QgsRectangle QgisApi_fullExtent() {
  QgsMapSettings mapSettings;
  mapSettings.setDestinationCrs(QgsProject::instance()->crs());
  mapSettings.setLayers(gVisibleLayers);
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
  emscripten::val callback) {

  QgsMapSettings mapSettings;

  mapSettings.setBackgroundColor(Qt::transparent);
  mapSettings.setOutputSize(QSize(tileSize, tileSize));

  mapSettings.setLayers(gVisibleLayers);

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
  emscripten::val callback) {

  QgsMapSettings mapSettings;

  mapSettings.setBackgroundColor(Qt::transparent);
  mapSettings.setOutputSize(QSize(width, height));

  mapSettings.setLayers(gVisibleLayers);

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

EMSCRIPTEN_BINDINGS(QgisApi) {
  emscripten::function("loadProject", &QgisApi_loadProject);
  emscripten::function("fullExtent", &QgisApi_fullExtent);
  emscripten::function("srid", &QgisApi_srid);
  emscripten::function("renderImage", &QgisApi_renderImage);
  emscripten::function("renderXYZTile", &QgisApi_renderXYZTile);
  emscripten::function("transformRectangle", &QgisApi_transformRectangle);
}
