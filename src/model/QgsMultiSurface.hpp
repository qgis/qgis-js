#pragma once

#include <string>

#include <qgsmultisurface.h>
#include <qgssurface.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsGeometry.hpp"

class MultiSurface {
public:
  MultiSurface() = default;
  MultiSurface(const QgsMultiSurface &m) : _m(m) {}

  static emscripten::val fromGeometry(const Geometry &geom) {
    const QgsAbstractGeometry *g = geom.nativeGeometry().constGet();
    if (const QgsMultiSurface *m = dynamic_cast<const QgsMultiSurface *>(g)) {
      return emscripten::val(MultiSurface(*m));
    }
    return emscripten::val::null();
  }

  int numGeometries() const {
    return _m.numGeometries();
  }
  bool isEmpty() const {
    return _m.isEmpty();
  }
  int wkbType() const {
    return static_cast<int>(_m.wkbType());
  }
  double area() const {
    return _m.area();
  }
  double perimeter() const {
    return _m.perimeter();
  }

  Geometry surfaceN(int i) const {
    if (const QgsAbstractGeometry *g = _m.geometryN(i)) {
      return Geometry(QgsGeometry(g->clone()));
    }
    return Geometry();
  }

  bool addSurface(const Geometry &surfaceGeom) {
    const QgsAbstractGeometry *g = surfaceGeom.nativeGeometry().constGet();
    if (const QgsSurface *s = dynamic_cast<const QgsSurface *>(g)) {
      _m.addGeometry(s->clone());
      return true;
    }
    return false;
  }

  Geometry asGeometry() const {
    return Geometry(QgsGeometry(_m.clone()));
  }

  std::string asWkt(int precision) const {
    return _m.asWkt(precision).toStdString();
  }

  emscripten::val asWkb() const {
    QByteArray wkb = QgsGeometry(_m.clone()).asWkb();
    return makeUint8Array(wkb.constData(), wkb.size());
  }

private:
  QgsMultiSurface _m;
};

EMSCRIPTEN_BINDINGS(QgsMultiSurface) {
  emscripten::class_<MultiSurface>("QgsMultiSurface")
    .constructor<>()
    .class_function("fromGeometry", &MultiSurface::fromGeometry)
    .function("numGeometries", &MultiSurface::numGeometries)
    .function("isEmpty", &MultiSurface::isEmpty)
    .function("wkbType", &MultiSurface::wkbType)
    .function("area", &MultiSurface::area)
    .function("perimeter", &MultiSurface::perimeter)
    .function("surfaceN", &MultiSurface::surfaceN)
    .function("addSurface", &MultiSurface::addSurface)
    .function("asGeometry", &MultiSurface::asGeometry)
    .function("asWkt", &MultiSurface::asWkt)
    .function("asWkb", &MultiSurface::asWkb);
}
