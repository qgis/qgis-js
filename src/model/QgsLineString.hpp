#pragma once

#include <limits>
#include <string>

#include <qgslinestring.h>
#include <qgspoint.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsGeometry.hpp"
#include "./QgsPoint.hpp"

class LineString {
public:
  LineString() = default;
  LineString(const QgsLineString &line) : _line(line) {}

  /**
   * Build a LineString from a JS array of coordinates. Each element may be:
   *  - `[x, y]`
   *  - `[x, y, z]`
   *  - `[x, y, z, m]`
   */
  static LineString fromArray(emscripten::val coords) {
    QgsLineString line;
    int length = coords["length"].as<int>();
    QVector<QgsPoint> points;
    points.reserve(length);
    const double nan = std::numeric_limits<double>::quiet_NaN();
    for (int i = 0; i < length; ++i) {
      emscripten::val c = coords[i];
      int clen = c["length"].as<int>();
      double x = c[0].as<double>();
      double y = c[1].as<double>();
      if (clen >= 4) {
        points.append(QgsPoint(x, y, c[2].as<double>(), c[3].as<double>(), Qgis::WkbType::PointZM));
      } else if (clen == 3) {
        points.append(QgsPoint(x, y, c[2].as<double>(), nan, Qgis::WkbType::PointZ));
      } else {
        points.append(QgsPoint(x, y));
      }
    }
    line.setPoints(points);
    return LineString(line);
  }

  static emscripten::val fromGeometry(const Geometry &geom) {
    const QgsAbstractGeometry *g = geom.nativeGeometry().constGet();
    if (const QgsLineString *l = dynamic_cast<const QgsLineString *>(g)) {
      return emscripten::val(LineString(*l));
    }
    return emscripten::val::null();
  }

  int numPoints() const {
    return _line.numPoints();
  }
  bool isEmpty() const {
    return _line.isEmpty();
  }
  bool isClosed() const {
    return _line.isClosed();
  }
  int wkbType() const {
    return static_cast<int>(_line.wkbType());
  }
  double length() const {
    return _line.length();
  }

  Point pointN(int i) const {
    return Point(_line.pointN(i));
  }

  Point startPoint() const {
    return Point(_line.startPoint());
  }

  Point endPoint() const {
    return Point(_line.endPoint());
  }

  emscripten::val points() const {
    emscripten::val result = emscripten::val::array();
    const int n = _line.numPoints();
    const bool has3d = _line.is3D();
    const bool hasM = _line.isMeasure();
    for (int i = 0; i < n; ++i) {
      emscripten::val coord = emscripten::val::array();
      coord.call<void>("push", emscripten::val(_line.xAt(i)));
      coord.call<void>("push", emscripten::val(_line.yAt(i)));
      if (has3d) coord.call<void>("push", emscripten::val(_line.zAt(i)));
      if (hasM) coord.call<void>("push", emscripten::val(_line.mAt(i)));
      result.call<void>("push", coord);
    }
    return result;
  }

  void addPoint(const Point &p) {
    _line.addVertex(p.nativePoint());
  }

  void close() {
    _line.close();
  }

  Geometry asGeometry() const {
    return Geometry(QgsGeometry(_line.clone()));
  }

  std::string asWkt(int precision) const {
    return _line.asWkt(precision).toStdString();
  }

  emscripten::val asWkb() const {
    QByteArray wkb = QgsGeometry(_line.clone()).asWkb();
    return makeUint8Array(wkb.constData(), wkb.size());
  }

  const QgsLineString &nativeLine() const {
    return _line;
  }

private:
  QgsLineString _line;
};

EMSCRIPTEN_BINDINGS(QgsLineString) {
  emscripten::class_<LineString>("QgsLineString")
    .constructor<>()
    .class_function("fromArray", &LineString::fromArray)
    .class_function("fromGeometry", &LineString::fromGeometry)
    .function("numPoints", &LineString::numPoints)
    .function("isEmpty", &LineString::isEmpty)
    .function("isClosed", &LineString::isClosed)
    .function("wkbType", &LineString::wkbType)
    .function("length", &LineString::length)
    .function("pointN", &LineString::pointN)
    .function("startPoint", &LineString::startPoint)
    .function("endPoint", &LineString::endPoint)
    .function("points", &LineString::points)
    .function("addPoint", &LineString::addPoint)
    .function("close", &LineString::close)
    .function("asGeometry", &LineString::asGeometry)
    .function("asWkt", &LineString::asWkt)
    .function("asWkb", &LineString::asWkb);
}
