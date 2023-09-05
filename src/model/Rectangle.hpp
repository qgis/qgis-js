
#include <qgsrectangle.h>

#include <emscripten/bind.h>

static void QgsRectangle_scale(QgsRectangle &r, double f) {
  r.scale(f);
}

static void QgsRectangle_move(QgsRectangle &r, double dx, double dy) {
  r += QgsVector(dx, dy);
}

EMSCRIPTEN_BINDINGS(QgsRectangle) {
  emscripten::class_<QgsRectangle>("Rectangle")
    .constructor<>()
    .constructor<double, double, double, double>()
    .property("xMinimum", &QgsRectangle::xMinimum, &QgsRectangle::setXMinimum)
    .property("yMinimum", &QgsRectangle::yMinimum, &QgsRectangle::setYMinimum)
    .property("xMaximum", &QgsRectangle::xMaximum, &QgsRectangle::setXMaximum)
    .property("yMaximum", &QgsRectangle::yMaximum, &QgsRectangle::setYMaximum)
    .function("scale", &QgsRectangle_scale)
    .function("move", &QgsRectangle_move)
    .function("center", &QgsRectangle::center);
}
