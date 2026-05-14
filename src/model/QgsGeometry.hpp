#pragma once

#include <string>

#include <qgsgeometry.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"

class Geometry {
public:
  Geometry() = default;
  Geometry(const QgsGeometry &geometry) : _geometry(geometry) {}

  bool isNull() const {
    return _geometry.isNull();
  }

  bool isEmpty() const {
    return _geometry.isEmpty();
  }

  int wkbType() const {
    return static_cast<int>(_geometry.wkbType());
  }

  emscripten::val asWkb() const {
    QByteArray wkb = _geometry.asWkb();
    return makeUint8Array(wkb.constData(), wkb.size());
  }

  std::string asWkt(int precision) const {
    return _geometry.asWkt(precision).toStdString();
  }

  std::string asJson(int precision) const {
    return _geometry.asJson(precision).toStdString();
  }

private:
  QgsGeometry _geometry;
};

EMSCRIPTEN_BINDINGS(QgsGeometry) {
  emscripten::class_<Geometry>("QgsGeometry")
    .constructor<>()
    .function("isNull", &Geometry::isNull)
    .function("isEmpty", &Geometry::isEmpty)
    .function("wkbType", &Geometry::wkbType)
    .function("asWkb", &Geometry::asWkb)
    .function("asWkt", &Geometry::asWkt)
    .function("asJson", &Geometry::asJson);
}
