#pragma once

#include <string>

#include <qgsfeature.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsFields.hpp"
#include "./QgsGeometry.hpp"

class Feature {
public:
  Feature() = default;
  Feature(const QgsFeature &feature) : _feature(feature) {}
  Feature(const Fields &fields) : _feature(fields.nativeFields()) {
    _feature.initAttributes(fields.nativeFields().count());
  }

  void setGeometry(const Geometry &geom) {
    _feature.setGeometry(geom.nativeGeometry());
  }

  /**
   * Set an attribute by field name or zero-based index. JS values are
   * marshalled to QVariant via valToQVariant (see QVariant.hpp). Returns
   * false if the field name/index is unknown.
   */
  bool setAttribute(emscripten::val nameOrIndex, emscripten::val value) {
    QVariant v = valToQVariant(value);
    if (nameOrIndex.isNumber()) {
      return _feature.setAttribute(nameOrIndex.as<int>(), v);
    }
    if (nameOrIndex.isString()) {
      return _feature.setAttribute(QString::fromStdString(nameOrIndex.as<std::string>()), v);
    }
    return false;
  }

  double id() const {
    return static_cast<double>(_feature.id());
  }

  bool isValid() const {
    return _feature.isValid();
  }

  bool hasGeometry() const {
    return _feature.hasGeometry();
  }

  Geometry geometry() const {
    return Geometry(_feature.geometry());
  }

  Fields fields() const {
    return Fields(_feature.fields());
  }

  int attributeCount() const {
    return _feature.attributeCount();
  }

  emscripten::val attributes() const {
    emscripten::val result = emscripten::val::array();
    const QgsAttributes attrs = _feature.attributes();
    for (const QVariant &v : attrs) {
      result.call<void>("push", qvariantToVal(v));
    }
    return result;
  }

  const QgsFeature &nativeFeature() const {
    return _feature;
  }

  emscripten::val attribute(emscripten::val nameOrIndex) const {
    if (nameOrIndex.isNumber()) {
      int idx = nameOrIndex.as<int>();
      if (idx < 0 || idx >= _feature.attributeCount()) return emscripten::val::null();
      return qvariantToVal(_feature.attribute(idx));
    }
    if (nameOrIndex.isString()) {
      std::string name = nameOrIndex.as<std::string>();
      QVariant v = _feature.attribute(QString::fromStdString(name));
      return qvariantToVal(v);
    }
    return emscripten::val::null();
  }

private:
  QgsFeature _feature;
};

EMSCRIPTEN_BINDINGS(QgsFeature) {
  emscripten::class_<Feature>("QgsFeature")
    .constructor<>()
    .constructor<const Fields &>()
    .function("id", &Feature::id)
    .function("isValid", &Feature::isValid)
    .function("hasGeometry", &Feature::hasGeometry)
    .function("geometry", &Feature::geometry)
    .function("fields", &Feature::fields)
    .function("attributeCount", &Feature::attributeCount)
    .function("attributes", &Feature::attributes)
    .function("attribute", &Feature::attribute)
    .function("setGeometry", &Feature::setGeometry)
    .function("setAttribute", &Feature::setAttribute);
}
