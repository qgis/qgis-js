#include <string>

#include <qgsexpressioncontextutils.h>
#include <qgslayertree.h>
#include <qgsmaprenderercustompainterjob.h>
#include <qgsmaprendererparalleljob.h>
#include <qgsmaprenderersequentialjob.h>
#include <qgsmapsettings.h>
#include <qgsproject.h>
#include <qgstiles.h>

#include <QImage>
#include <QString>
#include <QtConcurrent/QtConcurrent>

#include "../model/MapLayer.hpp"
#include "../model/PointXY.hpp"
#include "../model/QgsMapRendererJob.hpp"
#include "../model/QgsMapRendererParallelJob.hpp"
#include "../model/QgsMapRendererQImageJob.hpp"
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
  Qgis::ProjectReadFlags readFlags =
    Qgis::ProjectReadFlag::ForceReadOnlyLayers | Qgis::ProjectReadFlag::TrustLayerMetadata;

  bool res = QgsProject::instance()->read(QString::fromStdString(filename), readFlags);
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
  float extentBufferFactor,
  emscripten::val callback) {

  QgsMapSettings mapSettings;

  mapSettings.setOutputImageFormat(QImage::Format_ARGB32);
  mapSettings.setBackgroundColor(Qt::transparent);
  mapSettings.setOutputSize(QSize(tileSize, tileSize));
  mapSettings.setOutputDpi(96.0 * pixelRatio);

  mapSettings.setLayers(QgisApi_visibleLayers());

  mapSettings.setDestinationCrs(QgsCoordinateReferenceSystem(QStringLiteral("EPSG:3857")));

  QgsTileMatrix mTileMatrix = QgsTileMatrix::fromWebMercator(z);
  auto extent = mTileMatrix.tileExtent(QgsTileXYZ(x, y, z));
  mapSettings.setExtent(extent);

  auto tileExtentBuffer = extent.width() * extentBufferFactor;
  if (tileExtentBuffer > 0.0) {
    mapSettings.setExtentBuffer(tileExtentBuffer);
  }

  mapSettings.setFlag(Qgis::MapSettingsFlag::RenderMapTile, true);

  QgsExpressionContext context = QgsProject::instance()->createExpressionContext();
  context << QgsExpressionContextUtils::mapSettingsScope(mapSettings);
  mapSettings.setExpressionContext(context);

  mapSettings.setPathResolver(QgsProject::instance()->pathResolver());

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

  mapSettings.setOutputImageFormat(QImage::Format_ARGB32);
  mapSettings.setBackgroundColor(Qt::transparent);
  mapSettings.setOutputSize(QSize(width, height));
  mapSettings.setOutputDpi(96.0 * pixelRatio);

  mapSettings.setLayers(QgisApi_visibleLayers());

  mapSettings.setDestinationCrs(QgsCoordinateReferenceSystem(QString::fromStdString(srid)));

  mapSettings.setExtent(extent);

  QgsExpressionContext context = QgsProject::instance()->createExpressionContext();
  context << QgsExpressionContextUtils::mapSettingsScope(mapSettings);
  mapSettings.setExpressionContext(context);

  mapSettings.setPathResolver(QgsProject::instance()->pathResolver());

  // START optimizations
  QgsVectorSimplifyMethod simplify;
  simplify.setSimplifyHints(QgsVectorSimplifyMethod::FullSimplification);
  mapSettings.setSimplifyMethod(simplify);

  mapSettings.setFlag(Qgis::MapSettingsFlag::UseRenderingOptimization, true);
  mapSettings.setFlag(Qgis::MapSettingsFlag::ForceRasterMasks, true);
  mapSettings.setFlag(Qgis::MapSettingsFlag::RenderPreviewJob, true);

  mapSettings.setRendererUsage(Qgis::RendererUsage::View);
  // END optimizations

  QgsMapRendererParallelJob *job = new QgsMapRendererParallelJob(mapSettings);

  QObject::connect(job, &QgsMapRendererParallelJob::finished, [job, callback] {
    auto image = job->renderedImage();
    image.rgbSwap(); // for html canvas
    callback(emscripten::val(emscripten::typed_memory_view(
      image.width() * image.height() * 4, (const unsigned char *)image.constBits())));
    job->deleteLater();
  });

  // start the rendering job in a separate thread to prevent blocking the main thread
  // (in theory strange things could happen, but this has been working well so far)
  (void)QtConcurrent::run([job]() { job->start(); });
}

QgsMapRendererParallelJob *QgisApi_renderJob(
  std::string srid,
  const QgsRectangle &extent,
  unsigned int width,
  unsigned int height,
  float pixelRatio) {

  QgsMapSettings mapSettings;

  mapSettings.setOutputImageFormat(QImage::Format_ARGB32);
  mapSettings.setBackgroundColor(Qt::transparent);
  mapSettings.setOutputSize(QSize(width, height));
  mapSettings.setOutputDpi(96.0 * pixelRatio);

  mapSettings.setLayers(QgisApi_visibleLayers());

  mapSettings.setDestinationCrs(QgsCoordinateReferenceSystem(QString::fromStdString(srid)));

  mapSettings.setExtent(extent);

  QgsExpressionContext context = QgsProject::instance()->createExpressionContext();
  context << QgsExpressionContextUtils::mapSettingsScope(mapSettings);
  mapSettings.setExpressionContext(context);

  mapSettings.setPathResolver(QgsProject::instance()->pathResolver());

  // START optimizations
  QgsVectorSimplifyMethod simplify;
  simplify.setSimplifyHints(QgsVectorSimplifyMethod::FullSimplification);
  mapSettings.setSimplifyMethod(simplify);

  mapSettings.setFlag(Qgis::MapSettingsFlag::UseRenderingOptimization, true);
  mapSettings.setFlag(Qgis::MapSettingsFlag::ForceRasterMasks, true);
  mapSettings.setFlag(Qgis::MapSettingsFlag::RenderPreviewJob, true);
  mapSettings.setFlag(Qgis::MapSettingsFlag::RenderPartialOutput, true);

  mapSettings.setRendererUsage(Qgis::RendererUsage::View);
  // END optimizations

  QgsMapRendererParallelJob *job = new QgsMapRendererParallelJob(mapSettings);

  // start the rendering job in a separate thread to prevent blocking the main thread
  // (in theory strange things could happen, but this has been working well so far)
  (void)QtConcurrent::run([job]() { job->start(); });

  return job;
}

const QgsRectangle QgisApi_transformRectangle(
  const QgsRectangle &inputRectangle, std::string inputSrid, std::string outputSrid) {
  QgsCoordinateTransform transform(
    QgsCoordinateReferenceSystem(QString::fromStdString(inputSrid)),
    QgsCoordinateReferenceSystem(QString::fromStdString(outputSrid)),
    QgsProject::instance());
  return transform.transformBoundingBox(inputRectangle);
}

const std::vector<MapLayer> QgisApi_mapLayers() {
  std::vector<MapLayer> result = {};
  for (QgsMapLayer *layer : QgisApi_allLayers()) {
    result.push_back(MapLayer(layer));
  }
  return result;
}

const std::vector<std::string> QgisApi_mapThemes() {
  std::vector<std::string> result = {};
  for (const QString &theme : QgsProject::instance()->mapThemeCollection()->mapThemes()) {
    result.push_back(theme.toStdString());
  }
  return result;
}

const std::string QgisApi_getMapTheme() {
  QgsLayerTree *layerTreeRoot = QgsProject::instance()->layerTreeRoot();
  QgsMapThemeCollection *collection = QgsProject::instance()->mapThemeCollection();
  QgsLayerTreeModel model(layerTreeRoot);
  auto currentState = QgsMapThemeCollection::createThemeFromCurrentState(layerTreeRoot, &model);
  for (const QString &theme : QgsProject::instance()->mapThemeCollection()->mapThemes()) {
    if (currentState == QgsProject::instance()->mapThemeCollection()->mapThemeState(theme)) {
      return theme.toStdString();
    }
  }
  return "";
}

const bool QgisApi_setMapTheme(std::string themeName) {
  QString qThemeName = QString::fromStdString(themeName);
  if (!QgsProject::instance()->mapThemeCollection()->hasMapTheme(qThemeName)) {
    return false;
  } else {
    QgsLayerTree *layerTreeRoot = QgsProject::instance()->layerTreeRoot();
    QgsMapThemeCollection *collection = QgsProject::instance()->mapThemeCollection();
    QgsLayerTreeModel model(layerTreeRoot);
    collection->applyTheme(qThemeName, layerTreeRoot, &model);
    return true;
  }
}

EMSCRIPTEN_BINDINGS(QgisApi) {
  emscripten::function("loadProject", &QgisApi_loadProject);
  emscripten::function("fullExtent", &QgisApi_fullExtent);
  emscripten::function("srid", &QgisApi_srid);
  emscripten::function("renderImage", &QgisApi_renderImage);
  emscripten::function("renderXYZTile", &QgisApi_renderXYZTile);
  emscripten::function("renderJob", &QgisApi_renderJob, emscripten::allow_raw_pointers());
  emscripten::function("transformRectangle", &QgisApi_transformRectangle);
  emscripten::function("mapLayers", &QgisApi_mapLayers);
  emscripten::register_vector<MapLayer>("vector<MapLayer>");
  emscripten::function("mapThemes", &QgisApi_mapThemes);
  emscripten::function("getMapTheme", &QgisApi_getMapTheme);
  emscripten::function("setMapTheme", &QgisApi_setMapTheme);
  emscripten::register_vector<std::string>("vector<std::string>");
}
