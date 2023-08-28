
#include <stdio.h>

#include <sqlite3.h>
#include <proj.h>
#include <geos_c.h>
#include <gdal.h>
#include <expat.h>
#include <spatialindex/capi/sidx_api.h>
#include <zip.h>
#include <qt6keychain/keychain.h>

#include <qgis.h>
#include <qgsapplication.h>
#include <qgsproject.h>
#include <qgslayertree.h>
#include <qgsmapsettings.h>
#include <qgscoordinatereferencesystem.h>
#include <qgssettingsregistrycore.h>
#include <qgsprojutils.h>
#include <qgsmaprenderersequentialjob.h>
#include <qgsmaprenderercustompainterjob.h>
#include <qgsproviderregistry.h>

#include <QtGlobal>
#include <QCoreApplication>
#include <QTemporaryDir>
#include <QTimer>
#include <QFileInfo>

#include <emscripten/bind.h>


static const QTemporaryDir temp;
static QCoreApplication* app;
static QImage gLastImage;


int main(int argc, char* argv[])
{
#if defined(EMSCRIPTEN)
  // as set in CMakeLists.txt
  setenv("PROJ_LIB", "/proj", 1);
#endif

  // needed?
  QCoreApplication::setOrganizationName("QGIS");
  QCoreApplication::setOrganizationDomain("qgis.org");
  QCoreApplication::setApplicationName("qgis4wasm");

    app = new QCoreApplication( argc, argv );
    qDebug() << "QgsApplication::init";
    QgsApplication::init( temp.path() );
    QgsApplication::setPkgDataPath("/qgis");  // as set in CMakeLists.txt
    
    QgsSettingsRegistryCore::settingsLayerParallelLoading->setValue(false);
    
    // version information
    qDebug() << "qgis " << Qgis::version() << " (" << Qgis::devVersion() << ")";
    qDebug() << "qt " << QString( QT_VERSION_STR );
    qDebug() << "gdal " << QString( GDAL_RELEASE_NAME );
    PJ_INFO info = proj_info();
    const QString projVersionCompiled { QStringLiteral( "%1.%2.%3" ).arg( PROJ_VERSION_MAJOR ).arg( PROJ_VERSION_MINOR ).arg( PROJ_VERSION_PATCH ) };
    qDebug() << "proj " << projVersionCompiled;
    qDebug() << "geos " << QString( GEOS_CAPI_VERSION );
    qDebug() << "sqlite " << QString{ SQLITE_VERSION };
    // no PDAL
    // no postgres
    // no spatialite
    qDebug() << "OS " << QSysInfo::prettyProductName();  // says emscripten + version
#ifdef QGISDEBUG
    qDebug() << "debug build of qgis";
#endif

    qDebug() << "qgis pkg data path: " << QgsApplication::pkgDataPath();
    qDebug() << "srs path" << QgsApplication::srsDatabaseFilePath();
    qDebug() << "proj search paths:" << QgsProjUtils::searchPaths();

    // qgis providers
    QStringList providerList = QgsProviderRegistry::instance()->providerList();
    qDebug() << "providers" << providerList;

    // gdal drivers
    int driverCount = GDALGetDriverCount();
    QStringList gdalDrivers;
    //qDebug() << "gdal drivers" << driverCount;
    for (int i = 0; i < driverCount; ++i)
    {
      GDALDriverH dr = GDALGetDriver(i);
      QString driverName = GDALGetDescription(dr);
      gdalDrivers << driverName;
      // QString longName = GDALGetMetadataItem( dr, "DMD_LONGNAME", "" );
      // bool isRaster = QString( GDALGetMetadataItem( dr, GDAL_DCAP_RASTER, nullptr ) ) == QLatin1String( "YES" );
      // bool isVector =  QString( GDALGetMetadataItem( dr, GDAL_DCAP_VECTOR, nullptr ) ) == QLatin1String( "YES" );
      // qDebug() << driverName << isRaster << isVector << longName;  // quite verbose with 100+ drivers!
    }
    qDebug() << "gdal drivers " << gdalDrivers;

    if ( !QFileInfo::exists( QgsApplication::srsDatabaseFilePath() ) )
    {
      qDebug() << "srs db does not exist!" << QgsApplication::srsDatabaseFilePath();
      return 1;
    }

    if ( !QFileInfo::exists( "/proj/proj.db" ) )
    {
      qDebug() << "proj db does not exist!" << "/proj/proj.db";
      return 1;
    }

    if ( QgsCoordinateReferenceSystem("EPSG:27700").toWkt().isEmpty() )
    {
      qDebug() << "something wrong with CRS database!";
      return 1;
    }

    return 0;
}


bool mr_load_project(std::string filename)
{
  bool res = QgsProject::instance()->read(QString::fromStdString(filename));
  if (!res)
    return false;
/*
  QgsLayerTree *root = QgsProject::instance()->layerTreeRoot();
  qDebug() << root->dump();
*/
  return true;
}


void mr_render_map(const QgsRectangle &extent, int width, int height, emscripten::val callback)
{
  QgsMapSettings mapSettings;
  //mapSettings.setBackgroundColor(Qt::green);
  mapSettings.setOutputSize(QSize(width, height));
  mapSettings.setDestinationCrs(QgsProject::instance()->crs());
  mapSettings.setLayers(QgsProject::instance()->layerTreeRoot()->layerOrderRespectingGroupLayers());
  mapSettings.setExtent(extent);

  QgsMapRendererSequentialJob *job = new QgsMapRendererSequentialJob(mapSettings);
  QObject::connect(job, &QgsMapRendererSequentialJob::finished, [job, callback] {
      gLastImage = job->renderedImage();
      gLastImage.rgbSwap();  // for html canvas
      callback();
      job->deleteLater();
  });
  job->start();
}

emscripten::val mr_map_data()
{
    return emscripten::val( emscripten::typed_memory_view( gLastImage.width()*gLastImage.height()*4, (const unsigned char*) gLastImage.constBits() ) );
}

size_t mr_map_ptr()
{
    return (size_t)gLastImage.constBits();
}

QgsRectangle mr_full_extent()
{
  QgsMapSettings mapSettings;
  mapSettings.setDestinationCrs(QgsProject::instance()->crs());
  mapSettings.setLayers(QgsProject::instance()->layerTreeRoot()->layerOrderRespectingGroupLayers());
  return mapSettings.fullExtent();
}

static void scaleRect(QgsRectangle &r, double f)
{
  r.scale(f);
}

static void moveRect(QgsRectangle &r, double dx, double dy)
{
  r += QgsVector(dx, dy);
}

EMSCRIPTEN_BINDINGS(my_qgis_module) {

    emscripten::class_<QgsPointXY>("PointXY")
    .constructor<>();

    emscripten::class_<QgsRectangle>("Rectangle")
    .constructor<>()
    .constructor<double, double, double, double>()
    .property("xMinimum", &QgsRectangle::xMinimum, &QgsRectangle::setXMinimum)
    .property("yMinimum", &QgsRectangle::yMinimum, &QgsRectangle::setYMinimum)
    .property("xMaximum", &QgsRectangle::xMaximum, &QgsRectangle::setXMaximum)
    .property("yMaximum", &QgsRectangle::yMaximum, &QgsRectangle::setYMaximum)
    .function("scale", &scaleRect)
    .function("move", &moveRect);

    emscripten::function("loadProject", &mr_load_project);
    emscripten::function("fullExtent", &mr_full_extent);
    emscripten::function("renderMap", &mr_render_map);
    emscripten::function("mapData", &mr_map_data);
    emscripten::function("mapPtr", &mr_map_ptr);
}
