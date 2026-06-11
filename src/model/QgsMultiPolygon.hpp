#pragma once

#include <string>

#include <qgsmultipolygon.h>
#include <qgspolygon.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsGeometry.hpp"
#include "./QgsPolygon.hpp"

class MultiPolygon {
public:
  MultiPolygon() = default;
  MultiPolygon(const QgsMultiPolygon &m) : _m(m) {}

  static emscripten::val fromGeometry(const Geometry &geom) {
    const QgsAbstractGeometry *g = geom.nativeGeometry().constGet();
    if (const QgsMultiPolygon *m = dynamic_cast<const QgsMultiPolygon *>(g)) {
      return emscripten::val(MultiPolygon(*m));
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

  Polygon polygonN(int i) const {
    if (const QgsPolygon *p = dynamic_cast<const QgsPolygon *>(_m.geometryN(i))) {
      return Polygon(*p);
    }
    return Polygon();
  }

  void addPolygon(const Polygon &p) {
    _m.addGeometry(p.nativePolygon().clone());
  }

  double area() const {
    return _m.area();
  }
  double perimeter() const {
    return _m.perimeter();
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
  QgsMultiPolygon _m;
};

EMSCRIPTEN_BINDINGS(QgsMultiPolygon) {
  emscripten::class_<MultiPolygon>("QgsMultiPolygon")
    .constructor<>()
    .class_function("fromGeometry", &MultiPolygon::fromGeometry)
    .function("numGeometries", &MultiPolygon::numGeometries)
    .function("isEmpty", &MultiPolygon::isEmpty)
    .function("wkbType", &MultiPolygon::wkbType)
    .function("polygonN", &MultiPolygon::polygonN)
    .function("addPolygon", &MultiPolygon::addPolygon)
    .function("area", &MultiPolygon::area)
    .function("perimeter", &MultiPolygon::perimeter)
    .function("asGeometry", &MultiPolygon::asGeometry)
    .function("asWkt", &MultiPolygon::asWkt)
    .function("asWkb", &MultiPolygon::asWkb);
}
