
#include <qgspointxy.h>

#include <emscripten/bind.h>

EMSCRIPTEN_BINDINGS(QgsPointXY) {
  emscripten::class_<QgsPointXY>("PointXY")
    .constructor<>()
    .property("x", &QgsPointXY::x, &QgsPointXY::setX)
    .property("y", &QgsPointXY::y, &QgsPointXY::setY);
}
