#pragma once

#include <string>

#include <qgsmultipoint.h>
#include <qgspoint.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsGeometry.hpp"
#include "./QgsPoint.hpp"

class MultiPoint {
public:
  MultiPoint() = default;
  MultiPoint(const QgsMultiPoint &mp) : _mp(mp) {}

  static emscripten::val fromGeometry(const Geometry &geom) {
    const QgsAbstractGeometry *g = geom.nativeGeometry().constGet();
    if (const QgsMultiPoint *mp = dynamic_cast<const QgsMultiPoint *>(g)) {
      return emscripten::val(MultiPoint(*mp));
    }
    return emscripten::val::null();
  }

  int numGeometries() const {
    return _mp.numGeometries();
  }
  bool isEmpty() const {
    return _mp.isEmpty();
  }
  int wkbType() const {
    return static_cast<int>(_mp.wkbType());
  }

  Point pointN(int i) const {
    if (const QgsPoint *p = dynamic_cast<const QgsPoint *>(_mp.geometryN(i))) {
      return Point(*p);
    }
    return Point();
  }

  void addPoint(const Point &p) {
    _mp.addGeometry(p.nativePoint().clone());
  }

  Geometry asGeometry() const {
    return Geometry(QgsGeometry(_mp.clone()));
  }

  std::string asWkt(int precision) const {
    return _mp.asWkt(precision).toStdString();
  }

  emscripten::val asWkb() const {
    QByteArray wkb = QgsGeometry(_mp.clone()).asWkb();
    return makeUint8Array(wkb.constData(), wkb.size());
  }

private:
  QgsMultiPoint _mp;
};

EMSCRIPTEN_BINDINGS(QgsMultiPoint) {
  emscripten::class_<MultiPoint>("QgsMultiPoint")
    .constructor<>()
    .class_function("fromGeometry", &MultiPoint::fromGeometry)
    .function("numGeometries", &MultiPoint::numGeometries)
    .function("isEmpty", &MultiPoint::isEmpty)
    .function("wkbType", &MultiPoint::wkbType)
    .function("pointN", &MultiPoint::pointN)
    .function("addPoint", &MultiPoint::addPoint)
    .function("asGeometry", &MultiPoint::asGeometry)
    .function("asWkt", &MultiPoint::asWkt)
    .function("asWkb", &MultiPoint::asWkb);
}
