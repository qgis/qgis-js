#pragma once

#include <string>

#include <qgspoint.h>
#include <qgspolygon.h>
#include <qgsregularpolygon.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsGeometry.hpp"
#include "./QgsPoint.hpp"

class RegularPolygon {
public:
  RegularPolygon() = default;
  RegularPolygon(const QgsRegularPolygon &r) : _r(r) {}

  /**
   * Build a regular polygon defined by its center, a point on the
   * circumscribed circle, and the side count.
   */
  RegularPolygon(const Point &center, const Point &pt1, int numberSides) :
    _r(center.nativePoint(), pt1.nativePoint(), numberSides, QgsRegularPolygon::InscribedCircle) {}

  RegularPolygon(const Point &center, double radius, double azimuth, int numberSides) :
    _r(center.nativePoint(), radius, azimuth, numberSides, QgsRegularPolygon::InscribedCircle) {}

  Point center() const {
    return Point(_r.center());
  }
  double radius() const {
    return _r.radius();
  }
  double apothem() const {
    return _r.apothem();
  }
  int numberSides() const {
    return _r.numberSides();
  }

  void setNumberSides(int n) {
    _r.setNumberSides(n);
  }
  void setRadius(double r) {
    _r.setRadius(r);
  }

  double area() const {
    return _r.area();
  }
  double perimeter() const {
    return _r.perimeter();
  }
  double length() const {
    return _r.length();
  }
  double interiorAngle() const {
    return _r.interiorAngle();
  }
  double centralAngle() const {
    return _r.centralAngle();
  }
  bool isEmpty() const {
    return _r.isEmpty();
  }

  Geometry toPolygon() const {
    std::unique_ptr<QgsPolygon> p(_r.toPolygon());
    return Geometry(QgsGeometry(p.release()));
  }

  std::string asWkt(int precision) const {
    return _r.toString(precision).toStdString();
  }

private:
  QgsRegularPolygon _r;
};

EMSCRIPTEN_BINDINGS(QgsRegularPolygon) {
  emscripten::class_<RegularPolygon>("QgsRegularPolygon")
    .constructor<>()
    .constructor<const Point &, const Point &, int>()
    .constructor<const Point &, double, double, int>()
    .function("center", &RegularPolygon::center)
    .function("radius", &RegularPolygon::radius)
    .function("apothem", &RegularPolygon::apothem)
    .function("numberSides", &RegularPolygon::numberSides)
    .function("setNumberSides", &RegularPolygon::setNumberSides)
    .function("setRadius", &RegularPolygon::setRadius)
    .function("area", &RegularPolygon::area)
    .function("perimeter", &RegularPolygon::perimeter)
    .function("length", &RegularPolygon::length)
    .function("interiorAngle", &RegularPolygon::interiorAngle)
    .function("centralAngle", &RegularPolygon::centralAngle)
    .function("isEmpty", &RegularPolygon::isEmpty)
    .function("toPolygon", &RegularPolygon::toPolygon)
    .function("asWkt", &RegularPolygon::asWkt);
}
