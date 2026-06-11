#pragma once

#include <string>

#include <qgsbox3d.h>
#include <qgsvector3d.h>

#include <emscripten/bind.h>

#include "./QgsPoint.hpp"
#include "./QgsRectangle.hpp"

class Box3D {
public:
  Box3D() = default;
  Box3D(double xMin, double yMin, double zMin, double xMax, double yMax, double zMax) :
    _b(xMin, yMin, zMin, xMax, yMax, zMax) {}
  Box3D(const QgsBox3D &b) : _b(b) {}

  double xMinimum() const {
    return _b.xMinimum();
  }
  double yMinimum() const {
    return _b.yMinimum();
  }
  double zMinimum() const {
    return _b.zMinimum();
  }
  double xMaximum() const {
    return _b.xMaximum();
  }
  double yMaximum() const {
    return _b.yMaximum();
  }
  double zMaximum() const {
    return _b.zMaximum();
  }

  void setXMinimum(double v) {
    _b.setXMinimum(v);
  }
  void setYMinimum(double v) {
    _b.setYMinimum(v);
  }
  void setZMinimum(double v) {
    _b.setZMinimum(v);
  }
  void setXMaximum(double v) {
    _b.setXMaximum(v);
  }
  void setYMaximum(double v) {
    _b.setYMaximum(v);
  }
  void setZMaximum(double v) {
    _b.setZMaximum(v);
  }

  double width() const {
    return _b.width();
  }
  double height() const {
    return _b.height();
  }
  double depth() const {
    return _b.depth();
  }
  double volume() const {
    return _b.volume();
  }

  bool isNull() const {
    return _b.isNull();
  }
  bool isEmpty() const {
    return _b.isEmpty();
  }
  bool is2d() const {
    return _b.is2d();
  }

  Point center() const {
    // QgsBox3D::center() returns a QgsVector3D, not a QgsPoint.
    QgsVector3D v = _b.center();
    return Point(v.x(), v.y(), v.z());
  }
  QgsRectangle toRectangle() const {
    return _b.toRectangle();
  }

  bool contains(const Point &p) const {
    return _b.contains(p.nativePoint());
  }
  bool intersects(const Box3D &other) const {
    return _b.intersects(other._b);
  }

  std::string toString() const {
    return _b.toString().toStdString();
  }

private:
  QgsBox3D _b;
};

EMSCRIPTEN_BINDINGS(QgsBox3D) {
  emscripten::class_<Box3D>("QgsBox3D")
    .constructor<>()
    .constructor<double, double, double, double, double, double>()
    .property("xMinimum", &Box3D::xMinimum, &Box3D::setXMinimum)
    .property("yMinimum", &Box3D::yMinimum, &Box3D::setYMinimum)
    .property("zMinimum", &Box3D::zMinimum, &Box3D::setZMinimum)
    .property("xMaximum", &Box3D::xMaximum, &Box3D::setXMaximum)
    .property("yMaximum", &Box3D::yMaximum, &Box3D::setYMaximum)
    .property("zMaximum", &Box3D::zMaximum, &Box3D::setZMaximum)
    .function("width", &Box3D::width)
    .function("height", &Box3D::height)
    .function("depth", &Box3D::depth)
    .function("volume", &Box3D::volume)
    .function("isNull", &Box3D::isNull)
    .function("isEmpty", &Box3D::isEmpty)
    .function("is2d", &Box3D::is2d)
    .function("center", &Box3D::center)
    .function("toRectangle", &Box3D::toRectangle)
    .function("contains", &Box3D::contains)
    .function("intersects", &Box3D::intersects)
    .function("toString", &Box3D::toString);
}
