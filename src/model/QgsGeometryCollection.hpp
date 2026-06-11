#pragma once

#include <string>

#include <qgsgeometrycollection.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsGeometry.hpp"

class GeometryCollection {
public:
  GeometryCollection() = default;
  GeometryCollection(const QgsGeometryCollection &c) : _coll(c) {}

  static emscripten::val fromGeometry(const Geometry &geom) {
    const QgsAbstractGeometry *g = geom.nativeGeometry().constGet();
    if (const QgsGeometryCollection *c = dynamic_cast<const QgsGeometryCollection *>(g)) {
      return emscripten::val(GeometryCollection(*c));
    }
    return emscripten::val::null();
  }

  int numGeometries() const {
    return _coll.numGeometries();
  }
  bool isEmpty() const {
    return _coll.isEmpty();
  }
  int wkbType() const {
    return static_cast<int>(_coll.wkbType());
  }

  Geometry geometryN(int i) const {
    const QgsAbstractGeometry *g = _coll.geometryN(i);
    if (!g) return Geometry();
    return Geometry(QgsGeometry(g->clone()));
  }

  /**
   * Append a copy of the given geometry. The collection's WKB type is
   * promoted as needed (e.g. Point added to empty collection becomes
   * a homogeneous MultiPoint where QGIS allows it).
   */
  void addGeometry(const Geometry &geom) {
    const QgsAbstractGeometry *g = geom.nativeGeometry().constGet();
    if (g) _coll.addGeometry(g->clone());
  }

  Geometry asGeometry() const {
    return Geometry(QgsGeometry(_coll.clone()));
  }

  std::string asWkt(int precision) const {
    return _coll.asWkt(precision).toStdString();
  }

  emscripten::val asWkb() const {
    QByteArray wkb = QgsGeometry(_coll.clone()).asWkb();
    return makeUint8Array(wkb.constData(), wkb.size());
  }

private:
  QgsGeometryCollection _coll;
};

EMSCRIPTEN_BINDINGS(QgsGeometryCollection) {
  emscripten::class_<GeometryCollection>("QgsGeometryCollection")
    .constructor<>()
    .class_function("fromGeometry", &GeometryCollection::fromGeometry)
    .function("numGeometries", &GeometryCollection::numGeometries)
    .function("isEmpty", &GeometryCollection::isEmpty)
    .function("wkbType", &GeometryCollection::wkbType)
    .function("geometryN", &GeometryCollection::geometryN)
    .function("addGeometry", &GeometryCollection::addGeometry)
    .function("asGeometry", &GeometryCollection::asGeometry)
    .function("asWkt", &GeometryCollection::asWkt)
    .function("asWkb", &GeometryCollection::asWkb);
}
