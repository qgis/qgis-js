#pragma once

#include <string>

#include <qgspoint.h>
#include <qgstriangle.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsGeometry.hpp"
#include "./QgsPoint.hpp"

class Triangle {
public:
  Triangle() = default;
  Triangle(const QgsTriangle &t) : _t(t) {}
  Triangle(const Point &a, const Point &b, const Point &c) :
    _t(a.nativePoint(), b.nativePoint(), c.nativePoint()) {}

  static emscripten::val fromGeometry(const Geometry &geom) {
    const QgsAbstractGeometry *g = geom.nativeGeometry().constGet();
    if (const QgsTriangle *t = dynamic_cast<const QgsTriangle *>(g)) {
      return emscripten::val(Triangle(*t));
    }
    return emscripten::val::null();
  }

  bool isEmpty() const {
    return _t.isEmpty();
  }
  int wkbType() const {
    return static_cast<int>(_t.wkbType());
  }
  double area() const {
    return _t.area();
  }
  double perimeter() const {
    return _t.perimeter();
  }

  emscripten::val lengths() const {
    QVector<double> ls = _t.lengths();
    emscripten::val result = emscripten::val::array();
    for (double l : ls)
      result.call<void>("push", emscripten::val(l));
    return result;
  }

  emscripten::val angles() const {
    QVector<double> as = _t.angles();
    emscripten::val result = emscripten::val::array();
    for (double a : as)
      result.call<void>("push", emscripten::val(a));
    return result;
  }

  bool isDegenerate() const {
    return _t.isDegenerate();
  }
  bool isEquilateral() const {
    return _t.isEquilateral();
  }
  bool isIsocele() const {
    return _t.isIsocele();
  }
  bool isRight() const {
    return _t.isRight();
  }
  bool isScalene() const {
    return _t.isScalene();
  }

  Geometry asGeometry() const {
    return Geometry(QgsGeometry(_t.clone()));
  }

  std::string asWkt(int precision) const {
    return _t.asWkt(precision).toStdString();
  }

  emscripten::val asWkb() const {
    QByteArray wkb = QgsGeometry(_t.clone()).asWkb();
    return makeUint8Array(wkb.constData(), wkb.size());
  }

private:
  QgsTriangle _t;
};

EMSCRIPTEN_BINDINGS(QgsTriangle) {
  emscripten::class_<Triangle>("QgsTriangle")
    .constructor<>()
    .constructor<const Point &, const Point &, const Point &>()
    .class_function("fromGeometry", &Triangle::fromGeometry)
    .function("isEmpty", &Triangle::isEmpty)
    .function("wkbType", &Triangle::wkbType)
    .function("area", &Triangle::area)
    .function("perimeter", &Triangle::perimeter)
    .function("lengths", &Triangle::lengths)
    .function("angles", &Triangle::angles)
    .function("isDegenerate", &Triangle::isDegenerate)
    .function("isEquilateral", &Triangle::isEquilateral)
    .function("isIsocele", &Triangle::isIsocele)
    .function("isRight", &Triangle::isRight)
    .function("isScalene", &Triangle::isScalene)
    .function("asGeometry", &Triangle::asGeometry)
    .function("asWkt", &Triangle::asWkt)
    .function("asWkb", &Triangle::asWkb);
}
