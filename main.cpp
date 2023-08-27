
#include <stdio.h>

#include <sqlite3.h>
#include <proj.h>
#include <geos_c.h>
#include <gdal.h>
#include <expat.h>
#include <spatialindex/capi/sidx_api.h>
#include <zip.h>
//#include <exiv2/exiv2.hpp>
#include <qt6keychain/keychain.h>

#include <qgis.h>
#include <qgsapplication.h>

#include <QtGlobal>
#include <QCoreApplication>
#include <QTemporaryDir>

static const QTemporaryDir temp;
static QCoreApplication* app;


int test_sqlite3()
{
    printf("SQLITE3: %s\n", sqlite3_libversion());

    sqlite3 *db = nullptr;
    int rc1 = sqlite3_open(":memory:", &db);
    int rc2 = sqlite3_enable_load_extension( db, 1 );
    sqlite3_close( db );
    return rc1 + rc2;
}


int test_proj()
{
    PJ_INFO info = proj_info();
    printf("PROJ: %s\n", info.release);
    return 0;
}

int test_geos()
{
   printf("GEOS: %s\n", GEOSversion());
   return 0;
}

int test_gdal()
{
   printf("GDAL: %s\n", GDALVersionInfo("RELEASE_NAME"));
   return 0;
}

int test_qt()
{
    printf("QT: %s\n", qVersion());
    return 0;
}


int main(int argc, char* argv[])
{
    int res = 0;

    res += test_sqlite3();
    res += test_proj();
    res += test_geos();
    res += test_gdal();
    res += test_qt();
    
    printf("Expat: %s\n", XML_ExpatVersion());
    printf("libspatialindex: %s\n", SIDX_Version());
    printf("libzip: %s\n", zip_libzip_version());
    //printf("exiv2: %s\n", Exiv2::version());
    printf("qt6keychain: %d\n", QTKEYCHAIN_VERSION);

    printf("QGIS: %d\n", Qgis::versionInt());

    app = new QCoreApplication( argc, argv );
    qDebug() << "QgsApplication::init";
    QgsApplication::init( temp.path() );
    qDebug() << "done init";

    return res;
}
