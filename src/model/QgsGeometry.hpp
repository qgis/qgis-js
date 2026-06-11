#pragma once

#include <string>
#include <vector>

#include <qgsgeometry.h>
#include <qgsrectangle.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"

class Geometry {
public:
  Geometry() = default;
  Geometry(const QgsGeometry &geometry) : _geometry(geometry) {}

  static Geometry fromWkt(std::string wkt) {
    return Geometry(QgsGeometry::fromWkt(QString::fromStdString(wkt)));
  }

  static Geometry fromWkb(emscripten::val data) {
    std::vector<uint8_t> bytes = emscripten::convertJSArrayToNumberVector<uint8_t>(data);
    QgsGeometry g;
    g.fromWkb(
      QByteArray(reinterpret_cast<const char *>(bytes.data()), static_cast<int>(bytes.size())));
    return Geometry(g);
  }

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

  double area() const {
    return _geometry.area();
  }

  double length() const {
    return _geometry.length();
  }

  Geometry centroid() const {
    return Geometry(_geometry.centroid());
  }

  QgsRectangle boundingBox() const {
    return _geometry.boundingBox();
  }

  bool isGeosValid() const {
    return _geometry.isGeosValid();
  }

  emscripten::val validationErrors() const {
    QVector<QgsGeometry::Error> errors;
    _geometry.validateGeometry(errors);
    emscripten::val result = emscripten::val::array();
    for (const QgsGeometry::Error &e : errors) {
      result.call<void>("push", emscripten::val(e.what().toStdString()));
    }
    return result;
  }

  const QgsGeometry &nativeGeometry() const {
    return _geometry;
  }

private:
  QgsGeometry _geometry;
};

EMSCRIPTEN_BINDINGS(QgsGeometry) {
  emscripten::class_<Geometry>("QgsGeometry")
    .constructor<>()
    .class_function("fromWkt", &Geometry::fromWkt)
    .class_function("fromWkb", &Geometry::fromWkb)
    .function("isNull", &Geometry::isNull)
    .function("isEmpty", &Geometry::isEmpty)
    .function("wkbType", &Geometry::wkbType)
    .function("asWkb", &Geometry::asWkb)
    .function("asWkt", &Geometry::asWkt)
    .function("asJson", &Geometry::asJson)
    .function("area", &Geometry::area)
    .function("length", &Geometry::length)
    .function("centroid", &Geometry::centroid)
    .function("boundingBox", &Geometry::boundingBox)
    .function("isGeosValid", &Geometry::isGeosValid)
    .function("validationErrors", &Geometry::validationErrors);
}
