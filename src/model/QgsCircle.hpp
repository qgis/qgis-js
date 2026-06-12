#pragma once

#include <memory>
#include <qgscircle.h>
#include <qgscircularstring.h>
#include <qgspoint.h>
#include <qgspolygon.h>
#include <string>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsCircularString.hpp"
#include "./QgsGeometry.hpp"
#include "./QgsPoint.hpp"

class Circle {
public:
  Circle() = default;
  Circle(const QgsCircle &c) : _c(c) {}
  Circle(const Point &center, double radius) : _c(center.nativePoint(), radius) {}
  Circle(const Point &center, double radius, double azimuth) :
    _c(center.nativePoint(), radius, azimuth) {}

  Point center() const {
    return Point(_c.center());
  }
  double radius() const {
    return _c.radius();
  }
  double azimuth() const {
    return _c.azimuth();
  }

  void setRadius(double r) {
    _c.setRadius(r);
  }
  void setAzimuth(double a) {
    _c.setAzimuth(a);
  }

  double area() const {
    return _c.area();
  }
  double perimeter() const {
    return _c.perimeter();
  }

  bool isEmpty() const {
    return _c.isEmpty();
  }

  /**
   * Approximate the circle as a regular polygon with `segments` straight
   * edges. Returns the resulting polygon as a generic {@link Geometry}.
   */
  Geometry toPolygon(int segments) const {
    std::unique_ptr<QgsPolygon> p(_c.toPolygon(static_cast<unsigned int>(segments)));
    return Geometry(QgsGeometry(p.release()));
  }

  /** Exact representation as a closed circular-arc curve. */
  Geometry toCircularString() const {
    std::unique_ptr<QgsCircularString> c(_c.toCircularString());
    return Geometry(QgsGeometry(c.release()));
  }

  std::string asWkt(int precision) const {
    return _c.toString(precision).toStdString();
  }

private:
  QgsCircle _c;
};

EMSCRIPTEN_BINDINGS(QgsCircle) {
  emscripten::class_<Circle>("QgsCircle")
    .constructor<>()
    .constructor<const Point &, double>()
    .constructor<const Point &, double, double>()
    .function("center", &Circle::center)
    .function("radius", &Circle::radius)
    .function("azimuth", &Circle::azimuth)
    .function("setRadius", &Circle::setRadius)
    .function("setAzimuth", &Circle::setAzimuth)
    .function("area", &Circle::area)
    .function("perimeter", &Circle::perimeter)
    .function("isEmpty", &Circle::isEmpty)
    .function("toPolygon", &Circle::toPolygon)
    .function("toCircularString", &Circle::toCircularString)
    .function("asWkt", &Circle::asWkt);
}
