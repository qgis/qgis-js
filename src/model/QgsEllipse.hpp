#pragma once

#include <string>

#include <qgsellipse.h>
#include <qgspoint.h>
#include <qgspolygon.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsGeometry.hpp"
#include "./QgsPoint.hpp"

class Ellipse {
public:
  Ellipse() = default;
  Ellipse(const QgsEllipse &e) : _e(e) {}
  Ellipse(const Point &center, double semiMajorAxis, double semiMinorAxis) :
    _e(center.nativePoint(), semiMajorAxis, semiMinorAxis) {}
  Ellipse(const Point &center, double semiMajorAxis, double semiMinorAxis, double azimuth) :
    _e(center.nativePoint(), semiMajorAxis, semiMinorAxis, azimuth) {}

  Point center() const {
    return Point(_e.center());
  }
  double semiMajorAxis() const {
    return _e.semiMajorAxis();
  }
  double semiMinorAxis() const {
    return _e.semiMinorAxis();
  }
  double azimuth() const {
    return _e.azimuth();
  }

  void setSemiMajorAxis(double v) {
    _e.setSemiMajorAxis(v);
  }
  void setSemiMinorAxis(double v) {
    _e.setSemiMinorAxis(v);
  }
  void setAzimuth(double v) {
    _e.setAzimuth(v);
  }

  double area() const {
    return _e.area();
  }
  double perimeter() const {
    return _e.perimeter();
  }
  bool isEmpty() const {
    return _e.isEmpty();
  }
  double focusDistance() const {
    return _e.focusDistance();
  }
  double eccentricity() const {
    return _e.eccentricity();
  }

  Geometry toPolygon(int segments) const {
    std::unique_ptr<QgsPolygon> p(_e.toPolygon(static_cast<unsigned int>(segments)));
    return Geometry(QgsGeometry(p.release()));
  }

  std::string asWkt(int precision) const {
    return _e.toString(precision).toStdString();
  }

private:
  QgsEllipse _e;
};

EMSCRIPTEN_BINDINGS(QgsEllipse) {
  emscripten::class_<Ellipse>("QgsEllipse")
    .constructor<>()
    .constructor<const Point &, double, double>()
    .constructor<const Point &, double, double, double>()
    .function("center", &Ellipse::center)
    .function("semiMajorAxis", &Ellipse::semiMajorAxis)
    .function("semiMinorAxis", &Ellipse::semiMinorAxis)
    .function("azimuth", &Ellipse::azimuth)
    .function("setSemiMajorAxis", &Ellipse::setSemiMajorAxis)
    .function("setSemiMinorAxis", &Ellipse::setSemiMinorAxis)
    .function("setAzimuth", &Ellipse::setAzimuth)
    .function("area", &Ellipse::area)
    .function("perimeter", &Ellipse::perimeter)
    .function("isEmpty", &Ellipse::isEmpty)
    .function("focusDistance", &Ellipse::focusDistance)
    .function("eccentricity", &Ellipse::eccentricity)
    .function("toPolygon", &Ellipse::toPolygon)
    .function("asWkt", &Ellipse::asWkt);
}
