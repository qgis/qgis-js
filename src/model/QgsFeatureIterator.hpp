#pragma once

#include <qgsfeatureiterator.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QgsFeature.hpp"

class FeatureIterator {
public:
  FeatureIterator() = default;
  FeatureIterator(const QgsFeatureIterator &it) : _it(it) {}

  emscripten::val nextFeature() {
    QgsFeature f;
    if (_it.nextFeature(f)) {
      return emscripten::val(Feature(f));
    }
    return emscripten::val::null();
  }

  bool rewind() {
    return _it.rewind();
  }

  bool close() {
    return _it.close();
  }

  bool isClosed() const {
    return _it.isClosed();
  }

  bool isValid() const {
    return _it.isValid();
  }

private:
  QgsFeatureIterator _it;
};

EMSCRIPTEN_BINDINGS(QgsFeatureIterator) {
  emscripten::class_<FeatureIterator>("QgsFeatureIterator")
    .constructor<>()
    .function("nextFeature", &FeatureIterator::nextFeature)
    .function("rewind", &FeatureIterator::rewind)
    .function("close", &FeatureIterator::close)
    .function("isClosed", &FeatureIterator::isClosed)
    .function("isValid", &FeatureIterator::isValid);
}
