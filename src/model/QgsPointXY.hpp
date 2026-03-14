
#include <qgspointxy.h>

#include <emscripten/bind.h>

EMSCRIPTEN_BINDINGS(QgsPointXY) {
  emscripten::class_<QgsPointXY>("QgsPointXY")
    .constructor<>()
    .property("x", &QgsPointXY::x, &QgsPointXY::setX)
    .property("y", &QgsPointXY::y, &QgsPointXY::setY);
}
