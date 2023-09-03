#include <string>

#include <qgslayertree.h>
#include <qgsmaprenderercustompainterjob.h>
#include <qgsmaprenderersequentialjob.h>
#include <qgsmapsettings.h>
#include <qgsproject.h>

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

emscripten::val QgisApi_mapData() {
  return emscripten::val(emscripten::typed_memory_view(
    gLastImage.width() * gLastImage.height() * 4, (const unsigned char *)gLastImage.constBits()));
}

EMSCRIPTEN_BINDINGS(QgisApi) {
  emscripten::function("loadProject", &QgisApi_loadProject);
  emscripten::function("fullExtent", &QgisApi_fullExtent);
  emscripten::function("renderMap", &QgisApi_renderMap);
  emscripten::function("mapData", &QgisApi_mapData);
}
