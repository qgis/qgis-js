#pragma once

#include <string>

#include <qgscurve.h>
#include <qgscurvepolygon.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsGeometry.hpp"

class CurvePolygon {
public:
  CurvePolygon() = default;
  CurvePolygon(const QgsCurvePolygon &p) : _p(p) {}

  static emscripten::val fromGeometry(const Geometry &geom) {
    const QgsAbstractGeometry *g = geom.nativeGeometry().constGet();
    if (const QgsCurvePolygon *p = dynamic_cast<const QgsCurvePolygon *>(g)) {
      return emscripten::val(CurvePolygon(*p));
    }
    return emscripten::val::null();
  }

  /**
   * Set the exterior ring from any curve geometry (LineString,
   * CircularString, or CompoundCurve). Clones the underlying curve.
   */
  bool setExteriorRing(const Geometry &curveGeom) {
    const QgsAbstractGeometry *g = curveGeom.nativeGeometry().constGet();
    if (const QgsCurve *c = dynamic_cast<const QgsCurve *>(g)) {
      _p.setExteriorRing(static_cast<QgsCurve *>(c->clone()));
      return true;
    }
    return false;
  }

  bool addInteriorRing(const Geometry &curveGeom) {
    const QgsAbstractGeometry *g = curveGeom.nativeGeometry().constGet();
    if (const QgsCurve *c = dynamic_cast<const QgsCurve *>(g)) {
      _p.addInteriorRing(static_cast<QgsCurve *>(c->clone()));
      return true;
    }
    return false;
  }

  Geometry exteriorRing() const {
    if (const QgsCurve *c = _p.exteriorRing()) {
      return Geometry(QgsGeometry(c->clone()));
    }
    return Geometry();
  }

  int numInteriorRings() const {
    return _p.numInteriorRings();
  }

  Geometry interiorRing(int i) const {
    if (const QgsCurve *c = _p.interiorRing(i)) {
      return Geometry(QgsGeometry(c->clone()));
    }
    return Geometry();
  }

  bool isEmpty() const {
    return _p.isEmpty();
  }
  int wkbType() const {
    return static_cast<int>(_p.wkbType());
  }
  double area() const {
    return _p.area();
  }
  double perimeter() const {
    return _p.perimeter();
  }

  Geometry asGeometry() const {
    return Geometry(QgsGeometry(_p.clone()));
  }

  std::string asWkt(int precision) const {
    return _p.asWkt(precision).toStdString();
  }

  emscripten::val asWkb() const {
    QByteArray wkb = QgsGeometry(_p.clone()).asWkb();
    return makeUint8Array(wkb.constData(), wkb.size());
  }

  const QgsCurvePolygon &nativeCurvePolygon() const {
    return _p;
  }

private:
  QgsCurvePolygon _p;
};

EMSCRIPTEN_BINDINGS(QgsCurvePolygon) {
  emscripten::class_<CurvePolygon>("QgsCurvePolygon")
    .constructor<>()
    .class_function("fromGeometry", &CurvePolygon::fromGeometry)
    .function("setExteriorRing", &CurvePolygon::setExteriorRing)
    .function("addInteriorRing", &CurvePolygon::addInteriorRing)
    .function("exteriorRing", &CurvePolygon::exteriorRing)
    .function("numInteriorRings", &CurvePolygon::numInteriorRings)
    .function("interiorRing", &CurvePolygon::interiorRing)
    .function("isEmpty", &CurvePolygon::isEmpty)
    .function("wkbType", &CurvePolygon::wkbType)
    .function("area", &CurvePolygon::area)
    .function("perimeter", &CurvePolygon::perimeter)
    .function("asGeometry", &CurvePolygon::asGeometry)
    .function("asWkt", &CurvePolygon::asWkt)
    .function("asWkb", &CurvePolygon::asWkb);
}
