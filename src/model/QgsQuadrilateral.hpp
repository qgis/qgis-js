#pragma once

#include <string>

#include <qgspoint.h>
#include <qgspolygon.h>
#include <qgsquadrilateral.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsGeometry.hpp"
#include "./QgsPoint.hpp"

class Quadrilateral {
public:
  Quadrilateral() = default;
  Quadrilateral(const QgsQuadrilateral &q) : _q(q) {}
  Quadrilateral(const Point &p1, const Point &p2, const Point &p3, const Point &p4) :
    _q(p1.nativePoint(), p2.nativePoint(), p3.nativePoint(), p4.nativePoint()) {}

  bool isValid() const {
    return _q.isValid();
  }

  Geometry toPolygon() const {
    std::unique_ptr<QgsPolygon> p(_q.toPolygon());
    return Geometry(QgsGeometry(p.release()));
  }

  emscripten::val points() const {
    emscripten::val result = emscripten::val::array();
    QVector<QgsPoint> pts = _q.points();
    for (const QgsPoint &p : pts) {
      result.call<void>("push", emscripten::val(Point(p)));
    }
    return result;
  }

  std::string asWkt(int precision) const {
    return _q.toString(precision).toStdString();
  }

private:
  QgsQuadrilateral _q;
};

EMSCRIPTEN_BINDINGS(QgsQuadrilateral) {
  emscripten::class_<Quadrilateral>("QgsQuadrilateral")
    .constructor<>()
    .constructor<const Point &, const Point &, const Point &, const Point &>()
    .function("isValid", &Quadrilateral::isValid)
    .function("toPolygon", &Quadrilateral::toPolygon)
    .function("points", &Quadrilateral::points)
    .function("asWkt", &Quadrilateral::asWkt);
}
