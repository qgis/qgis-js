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

static QImage gLastImage;

bool QgisApi_loadProject(std::string filename) {
  bool res = QgsProject::instance()->read(QString::fromStdString(filename));
  if (!res) return false;
  return true;
}

QgsRectangle QgisApi_fullExtent() {
  QgsMapSettings mapSettings;
  mapSettings.setDestinationCrs(QgsProject::instance()->crs());
  mapSettings.setLayers(QgsProject::instance()->layerTreeRoot()->layerOrderRespectingGroupLayers());
  return mapSettings.fullExtent();
}

std::string QgisApi_srid() {
  return QgsProject::instance()->crs().authid().toStdString();
}

void QgisApi_renderMap(
  const QgsRectangle &extent, int width, int height, emscripten::val callback) {
  QgsMapSettings mapSettings;
  // mapSettings.setBackgroundColor(Qt::green);
  mapSettings.setOutputSize(QSize(width, height));
  mapSettings.setDestinationCrs(QgsProject::instance()->crs());
  mapSettings.setLayers(QgsProject::instance()->layerTreeRoot()->layerOrderRespectingGroupLayers());
  mapSettings.setExtent(extent);

  QgsMapRendererSequentialJob *job = new QgsMapRendererSequentialJob(mapSettings);
  QObject::connect(job, &QgsMapRendererSequentialJob::finished, [job, callback] {
    gLastImage = job->renderedImage();
    gLastImage.rgbSwap(); // for html canvas
    callback();
    job->deleteLater();
  });
  job->start();
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

  mapSettings.setLayers(QgsProject::instance()->layerTreeRoot()->layerOrderRespectingGroupLayers());

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

  mapSettings.setLayers(QgsProject::instance()->layerTreeRoot()->layerOrderRespectingGroupLayers());

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

emscripten::val QgisApi_mapData() {
  return emscripten::val(emscripten::typed_memory_view(
    gLastImage.width() * gLastImage.height() * 4, (const unsigned char *)gLastImage.constBits()));
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
  emscripten::function("renderMap", &QgisApi_renderMap);
  emscripten::function("renderImage", &QgisApi_renderImage);
  emscripten::function("renderXYZTile", &QgisApi_renderXYZTile);
  emscripten::function("mapData", &QgisApi_mapData);
  emscripten::function("transformRectangle", &QgisApi_transformRectangle);
}
