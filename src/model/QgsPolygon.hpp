#pragma once

#include <string>

#include <qgslinestring.h>
#include <qgspolygon.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsGeometry.hpp"
#include "./QgsLineString.hpp"

class Polygon {
public:
  Polygon() = default;
  Polygon(const QgsPolygon &poly) : _poly(poly) {}

  static emscripten::val fromGeometry(const Geometry &geom) {
    const QgsAbstractGeometry *g = geom.nativeGeometry().constGet();
    if (const QgsPolygon *p = dynamic_cast<const QgsPolygon *>(g)) {
      return emscripten::val(Polygon(*p));
    }
    return emscripten::val::null();
  }

  void setExteriorRing(const LineString &ring) {
    _poly.setExteriorRing(static_cast<QgsLineString *>(ring.nativeLine().clone()));
  }

  void addInteriorRing(const LineString &ring) {
    _poly.addInteriorRing(static_cast<QgsLineString *>(ring.nativeLine().clone()));
  }

  emscripten::val exteriorRing() const {
    if (const QgsCurve *c = _poly.exteriorRing()) {
      if (const QgsLineString *l = dynamic_cast<const QgsLineString *>(c)) {
        return emscripten::val(LineString(*l));
      }
    }
    return emscripten::val::null();
  }

  int numInteriorRings() const {
    return _poly.numInteriorRings();
  }

  emscripten::val interiorRing(int i) const {
    if (const QgsCurve *c = _poly.interiorRing(i)) {
      if (const QgsLineString *l = dynamic_cast<const QgsLineString *>(c)) {
        return emscripten::val(LineString(*l));
      }
    }
    return emscripten::val::null();
  }

  bool isEmpty() const {
    return _poly.isEmpty();
  }
  int wkbType() const {
    return static_cast<int>(_poly.wkbType());
  }
  double area() const {
    return _poly.area();
  }
  double perimeter() const {
    return _poly.perimeter();
  }

  Geometry asGeometry() const {
    return Geometry(QgsGeometry(_poly.clone()));
  }

  std::string asWkt(int precision) const {
    return _poly.asWkt(precision).toStdString();
  }

  emscripten::val asWkb() const {
    QByteArray wkb = QgsGeometry(_poly.clone()).asWkb();
    return makeUint8Array(wkb.constData(), wkb.size());
  }

  const QgsPolygon &nativePolygon() const {
    return _poly;
  }

private:
  QgsPolygon _poly;
};

EMSCRIPTEN_BINDINGS(QgsPolygon) {
  emscripten::class_<Polygon>("QgsPolygon")
    .constructor<>()
    .class_function("fromGeometry", &Polygon::fromGeometry)
    .function("setExteriorRing", &Polygon::setExteriorRing)
    .function("addInteriorRing", &Polygon::addInteriorRing)
    .function("exteriorRing", &Polygon::exteriorRing)
    .function("numInteriorRings", &Polygon::numInteriorRings)
    .function("interiorRing", &Polygon::interiorRing)
    .function("isEmpty", &Polygon::isEmpty)
    .function("wkbType", &Polygon::wkbType)
    .function("area", &Polygon::area)
    .function("perimeter", &Polygon::perimeter)
    .function("asGeometry", &Polygon::asGeometry)
    .function("asWkt", &Polygon::asWkt)
    .function("asWkb", &Polygon::asWkb);
}
