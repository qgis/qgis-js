#pragma once

#include <limits>
#include <string>

#include <qgscircularstring.h>
#include <qgspoint.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsGeometry.hpp"
#include "./QgsPoint.hpp"

class CircularString {
public:
  CircularString() = default;
  CircularString(const QgsCircularString &c) : _c(c) {}

  /**
   * Build a CircularString from a JS array of coordinates with the same
   * shape as {@link LineString::fromArray}: each element is `[x,y]`,
   * `[x,y,z]`, or `[x,y,z,m]`. Must contain an odd number of points >= 3
   * (start, curve, end, curve, end, …).
   */
  static CircularString fromArray(emscripten::val coords) {
    QgsCircularString c;
    int length = coords["length"].as<int>();
    QVector<QgsPoint> points;
    points.reserve(length);
    const double nan = std::numeric_limits<double>::quiet_NaN();
    for (int i = 0; i < length; ++i) {
      emscripten::val co = coords[i];
      int clen = co["length"].as<int>();
      double x = co[0].as<double>();
      double y = co[1].as<double>();
      if (clen >= 4) {
        points.append(
          QgsPoint(x, y, co[2].as<double>(), co[3].as<double>(), Qgis::WkbType::PointZM));
      } else if (clen == 3) {
        points.append(QgsPoint(x, y, co[2].as<double>(), nan, Qgis::WkbType::PointZ));
      } else {
        points.append(QgsPoint(x, y));
      }
    }
    c.setPoints(points);
    return CircularString(c);
  }

  static emscripten::val fromGeometry(const Geometry &geom) {
    const QgsAbstractGeometry *g = geom.nativeGeometry().constGet();
    if (const QgsCircularString *c = dynamic_cast<const QgsCircularString *>(g)) {
      return emscripten::val(CircularString(*c));
    }
    return emscripten::val::null();
  }

  int numPoints() const {
    return _c.numPoints();
  }
  bool isEmpty() const {
    return _c.isEmpty();
  }
  bool isClosed() const {
    return _c.isClosed();
  }
  int wkbType() const {
    return static_cast<int>(_c.wkbType());
  }
  double length() const {
    return _c.length();
  }

  Point pointN(int i) const {
    return Point(_c.pointN(i));
  }
  Point startPoint() const {
    return Point(_c.startPoint());
  }
  Point endPoint() const {
    return Point(_c.endPoint());
  }

  Geometry asGeometry() const {
    return Geometry(QgsGeometry(_c.clone()));
  }

  std::string asWkt(int precision) const {
    return _c.asWkt(precision).toStdString();
  }

  emscripten::val asWkb() const {
    QByteArray wkb = QgsGeometry(_c.clone()).asWkb();
    return makeUint8Array(wkb.constData(), wkb.size());
  }

  const QgsCircularString &nativeCurve() const {
    return _c;
  }

private:
  QgsCircularString _c;
};

EMSCRIPTEN_BINDINGS(QgsCircularString) {
  emscripten::class_<CircularString>("QgsCircularString")
    .constructor<>()
    .class_function("fromArray", &CircularString::fromArray)
    .class_function("fromGeometry", &CircularString::fromGeometry)
    .function("numPoints", &CircularString::numPoints)
    .function("isEmpty", &CircularString::isEmpty)
    .function("isClosed", &CircularString::isClosed)
    .function("wkbType", &CircularString::wkbType)
    .function("length", &CircularString::length)
    .function("pointN", &CircularString::pointN)
    .function("startPoint", &CircularString::startPoint)
    .function("endPoint", &CircularString::endPoint)
    .function("asGeometry", &CircularString::asGeometry)
    .function("asWkt", &CircularString::asWkt)
    .function("asWkb", &CircularString::asWkb);
}
