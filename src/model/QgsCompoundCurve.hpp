#pragma once

#include <string>

#include <qgscircularstring.h>
#include <qgscompoundcurve.h>
#include <qgslinestring.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsCircularString.hpp"
#include "./QgsGeometry.hpp"
#include "./QgsLineString.hpp"

class CompoundCurve {
public:
  CompoundCurve() = default;
  CompoundCurve(const QgsCompoundCurve &c) : _c(c) {}

  static emscripten::val fromGeometry(const Geometry &geom) {
    const QgsAbstractGeometry *g = geom.nativeGeometry().constGet();
    if (const QgsCompoundCurve *c = dynamic_cast<const QgsCompoundCurve *>(g)) {
      return emscripten::val(CompoundCurve(*c));
    }
    return emscripten::val::null();
  }

  void addLineString(const LineString &line) {
    _c.addCurve(static_cast<QgsLineString *>(line.nativeLine().clone()));
  }

  void addCircularString(const CircularString &c) {
    _c.addCurve(static_cast<QgsCircularString *>(c.nativeCurve().clone()));
  }

  int nCurves() const {
    return _c.nCurves();
  }
  int numPoints() const {
    return _c.numPoints();
  }
  bool isEmpty() const {
    return _c.isEmpty();
  }
  bool isClosed() const {
    return _c.isClosed();
  }
  int wkbType() const {
    return static_cast<int>(_c.wkbType());
  }
  double length() const {
    return _c.length();
  }

  Geometry curveAt(int i) const {
    if (const QgsCurve *c = _c.curveAt(i)) {
      return Geometry(QgsGeometry(c->clone()));
    }
    return Geometry();
  }

  Geometry asGeometry() const {
    return Geometry(QgsGeometry(_c.clone()));
  }

  std::string asWkt(int precision) const {
    return _c.asWkt(precision).toStdString();
  }

  emscripten::val asWkb() const {
    QByteArray wkb = QgsGeometry(_c.clone()).asWkb();
    return makeUint8Array(wkb.constData(), wkb.size());
  }

  const QgsCompoundCurve &nativeCurve() const {
    return _c;
  }

private:
  QgsCompoundCurve _c;
};

EMSCRIPTEN_BINDINGS(QgsCompoundCurve) {
  emscripten::class_<CompoundCurve>("QgsCompoundCurve")
    .constructor<>()
    .class_function("fromGeometry", &CompoundCurve::fromGeometry)
    .function("addLineString", &CompoundCurve::addLineString)
    .function("addCircularString", &CompoundCurve::addCircularString)
    .function("nCurves", &CompoundCurve::nCurves)
    .function("numPoints", &CompoundCurve::numPoints)
    .function("isEmpty", &CompoundCurve::isEmpty)
    .function("isClosed", &CompoundCurve::isClosed)
    .function("wkbType", &CompoundCurve::wkbType)
    .function("length", &CompoundCurve::length)
    .function("curveAt", &CompoundCurve::curveAt)
    .function("asGeometry", &CompoundCurve::asGeometry)
    .function("asWkt", &CompoundCurve::asWkt)
    .function("asWkb", &CompoundCurve::asWkb);
}
