#pragma once

#include <string>

#include <qgscurve.h>
#include <qgsmulticurve.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsGeometry.hpp"

class MultiCurve {
public:
  MultiCurve() = default;
  MultiCurve(const QgsMultiCurve &m) : _m(m) {}

  static emscripten::val fromGeometry(const Geometry &geom) {
    const QgsAbstractGeometry *g = geom.nativeGeometry().constGet();
    if (const QgsMultiCurve *m = dynamic_cast<const QgsMultiCurve *>(g)) {
      return emscripten::val(MultiCurve(*m));
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
  double length() const {
    return _m.length();
  }

  Geometry curveN(int i) const {
    if (const QgsAbstractGeometry *g = _m.geometryN(i)) {
      return Geometry(QgsGeometry(g->clone()));
    }
    return Geometry();
  }

  bool addCurve(const Geometry &curveGeom) {
    const QgsAbstractGeometry *g = curveGeom.nativeGeometry().constGet();
    if (const QgsCurve *c = dynamic_cast<const QgsCurve *>(g)) {
      _m.addGeometry(c->clone());
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
  QgsMultiCurve _m;
};

EMSCRIPTEN_BINDINGS(QgsMultiCurve) {
  emscripten::class_<MultiCurve>("QgsMultiCurve")
    .constructor<>()
    .class_function("fromGeometry", &MultiCurve::fromGeometry)
    .function("numGeometries", &MultiCurve::numGeometries)
    .function("isEmpty", &MultiCurve::isEmpty)
    .function("wkbType", &MultiCurve::wkbType)
    .function("length", &MultiCurve::length)
    .function("curveN", &MultiCurve::curveN)
    .function("addCurve", &MultiCurve::addCurve)
    .function("asGeometry", &MultiCurve::asGeometry)
    .function("asWkt", &MultiCurve::asWkt)
    .function("asWkb", &MultiCurve::asWkb);
}
