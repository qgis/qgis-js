#pragma once

#include <string>

#include <qgslinestring.h>
#include <qgsmultilinestring.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsGeometry.hpp"
#include "./QgsLineString.hpp"

class MultiLineString {
public:
  MultiLineString() = default;
  MultiLineString(const QgsMultiLineString &m) : _m(m) {}

  static emscripten::val fromGeometry(const Geometry &geom) {
    const QgsAbstractGeometry *g = geom.nativeGeometry().constGet();
    if (const QgsMultiLineString *m = dynamic_cast<const QgsMultiLineString *>(g)) {
      return emscripten::val(MultiLineString(*m));
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

  LineString lineStringN(int i) const {
    if (const QgsLineString *l = dynamic_cast<const QgsLineString *>(_m.geometryN(i))) {
      return LineString(*l);
    }
    return LineString();
  }

  void addLineString(const LineString &l) {
    _m.addGeometry(l.nativeLine().clone());
  }

  double length() const {
    double sum = 0;
    for (int i = 0; i < _m.numGeometries(); ++i) {
      if (const QgsLineString *l = dynamic_cast<const QgsLineString *>(_m.geometryN(i))) {
        sum += l->length();
      }
    }
    return sum;
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
  QgsMultiLineString _m;
};

EMSCRIPTEN_BINDINGS(QgsMultiLineString) {
  emscripten::class_<MultiLineString>("QgsMultiLineString")
    .constructor<>()
    .class_function("fromGeometry", &MultiLineString::fromGeometry)
    .function("numGeometries", &MultiLineString::numGeometries)
    .function("isEmpty", &MultiLineString::isEmpty)
    .function("wkbType", &MultiLineString::wkbType)
    .function("lineStringN", &MultiLineString::lineStringN)
    .function("addLineString", &MultiLineString::addLineString)
    .function("length", &MultiLineString::length)
    .function("asGeometry", &MultiLineString::asGeometry)
    .function("asWkt", &MultiLineString::asWkt)
    .function("asWkb", &MultiLineString::asWkb);
}
