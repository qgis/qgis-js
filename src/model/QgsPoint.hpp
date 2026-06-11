#pragma once

#include <limits>
#include <string>

#include <qgspoint.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsGeometry.hpp"

class Point {
public:
  Point() = default;
  Point(double x, double y) : _point(x, y) {}
  Point(double x, double y, double z) :
    _point(x, y, z, std::numeric_limits<double>::quiet_NaN(), Qgis::WkbType::PointZ) {}
  Point(double x, double y, double z, double m) : _point(x, y, z, m, Qgis::WkbType::PointZM) {}
  Point(const QgsPoint &p) : _point(p) {}

  static emscripten::val fromGeometry(const Geometry &geom) {
    const QgsAbstractGeometry *g = geom.nativeGeometry().constGet();
    if (const QgsPoint *p = dynamic_cast<const QgsPoint *>(g)) {
      return emscripten::val(Point(*p));
    }
    return emscripten::val::null();
  }

  double x() const {
    return _point.x();
  }
  double y() const {
    return _point.y();
  }
  double z() const {
    return _point.z();
  }
  double m() const {
    return _point.m();
  }

  void setX(double v) {
    _point.setX(v);
  }
  void setY(double v) {
    _point.setY(v);
  }
  void setZ(double v) {
    _point.setZ(v);
  }
  void setM(double v) {
    _point.setM(v);
  }

  bool is3D() const {
    return _point.is3D();
  }
  bool isMeasure() const {
    return _point.isMeasure();
  }
  bool isEmpty() const {
    return _point.isEmpty();
  }
  int wkbType() const {
    return static_cast<int>(_point.wkbType());
  }

  double distance(const Point &other) const {
    return _point.distance(other._point);
  }

  double distance3D(const Point &other) const {
    return _point.distance3D(other._point);
  }

  Geometry asGeometry() const {
    return Geometry(QgsGeometry(_point.clone()));
  }

  std::string asWkt(int precision) const {
    return _point.asWkt(precision).toStdString();
  }

  emscripten::val asWkb() const {
    QByteArray wkb = QgsGeometry(_point.clone()).asWkb();
    return makeUint8Array(wkb.constData(), wkb.size());
  }

  const QgsPoint &nativePoint() const {
    return _point;
  }

private:
  QgsPoint _point;
};

EMSCRIPTEN_BINDINGS(QgsPoint) {
  emscripten::class_<Point>("QgsPoint")
    .constructor<>()
    .constructor<double, double>()
    .constructor<double, double, double>()
    .constructor<double, double, double, double>()
    .class_function("fromGeometry", &Point::fromGeometry)
    .property("x", &Point::x, &Point::setX)
    .property("y", &Point::y, &Point::setY)
    .property("z", &Point::z, &Point::setZ)
    .property("m", &Point::m, &Point::setM)
    .function("is3D", &Point::is3D)
    .function("isMeasure", &Point::isMeasure)
    .function("isEmpty", &Point::isEmpty)
    .function("wkbType", &Point::wkbType)
    .function("distance", &Point::distance)
    .function("distance3D", &Point::distance3D)
    .function("asGeometry", &Point::asGeometry)
    .function("asWkt", &Point::asWkt)
    .function("asWkb", &Point::asWkb);
}
