
#include <expat.h>
#include <gdal.h>
#include <geos_c.h>
#include <proj.h>
#include <qt6keychain/keychain.h>
#include <spatialindex/capi/sidx_api.h>
#include <sqlite3.h>
#include <zip.h>

#include <qgis.h>
#include <qgsapplication.h>
#include <qgscoordinatereferencesystem.h>
#include <qgslayertree.h>
#include <qgsmaprenderercustompainterjob.h>
#include <qgsmaprenderersequentialjob.h>
#include <qgsmapsettings.h>
#include <qgsproject.h>
#include <qgsprojutils.h>
#include <qgsproviderregistry.h>
#include <qgssettingsregistrycore.h>

#include <QFileInfo>
#include <QGuiApplication>
#include <QTemporaryDir>
#include <QTimer>
#include <QtGlobal>

static const QTemporaryDir temp;
static QGuiApplication *app;

static const bool testLibraries = false;

int main(int argc, char *argv[]) {
#if defined(EMSCRIPTEN)
  // as set in CMakeLists.txt
  setenv("PROJ_LIB", "/proj", 1);
#endif

  // needed?
  QCoreApplication::setOrganizationName("QGIS");
  QCoreApplication::setOrganizationDomain("qgis.org");
  QCoreApplication::setApplicationName("qgis-js");

  // prevent warning from QWasmLocalStorageSettingsPrivate
  QSettings::setDefaultFormat(QSettings::IniFormat);
  QSettings::setPath(
    QSettings::IniFormat, QSettings::UserScope, temp.path() + QString("/settings"));

  app = new QGuiApplication(argc, argv);
  // qDebug() << "QgsApplication::init";
  QgsApplication::init(temp.path());
  QgsApplication::setPkgDataPath("/qgis"); // as set in CMakeLists.txt

  QgsSettingsRegistryCore::settingsLayerParallelLoading->setValue(false);

  if (testLibraries) {

    // version information
    qDebug() << "qgis " << Qgis::version() << " (" << Qgis::devVersion() << ")";
    qDebug() << "qt " << QString(QT_VERSION_STR);
    qDebug() << "gdal " << QString(GDAL_RELEASE_NAME);
    PJ_INFO info = proj_info();
    const QString projVersionCompiled{QStringLiteral("%1.%2.%3")
                                        .arg(PROJ_VERSION_MAJOR)
                                        .arg(PROJ_VERSION_MINOR)
                                        .arg(PROJ_VERSION_PATCH)};
    qDebug() << "proj " << projVersionCompiled;
    qDebug() << "geos " << QString(GEOS_CAPI_VERSION);
    qDebug() << "sqlite " << QString{SQLITE_VERSION};
    // no PDAL
    // no postgres
    // no spatialite
    qDebug() << "OS " << QSysInfo::prettyProductName(); // says emscripten + version
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
    // qDebug() << "gdal drivers" << driverCount;
    for (int i = 0; i < driverCount; ++i) {
      GDALDriverH dr = GDALGetDriver(i);
      QString driverName = GDALGetDescription(dr);
      gdalDrivers << driverName;
      // QString longName = GDALGetMetadataItem( dr, "DMD_LONGNAME", "" );
      // bool isRaster = QString( GDALGetMetadataItem( dr, GDAL_DCAP_RASTER,
      // nullptr ) ) == QLatin1String( "YES" ); bool isVector =  QString(
      // GDALGetMetadataItem( dr, GDAL_DCAP_VECTOR, nullptr ) ) ==
      // QLatin1String( "YES" ); qDebug() << driverName << isRaster << isVector
      // << longName;  // quite verbose with 100+ drivers!
    }
    qDebug() << "gdal drivers " << gdalDrivers;

    if (!QFileInfo::exists(QgsApplication::srsDatabaseFilePath())) {
      qDebug() << "srs db does not exist!" << QgsApplication::srsDatabaseFilePath();
      return 1;
    }

    if (!QFileInfo::exists("/proj/proj.db")) {
      qDebug() << "proj db does not exist!"
               << "/proj/proj.db";
      return 1;
    }

    if (QgsCoordinateReferenceSystem("EPSG:27700").toWkt().isEmpty()) {
      qDebug() << "something wrong with CRS database!";
      return 1;
    }
  }

  return 0;
}
