#pragma once

#include <string>

#include <qgsfields.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QgsField.hpp"

class Fields {
public:
  Fields() = default;
  Fields(const QgsFields &fields) : _fields(fields) {}

  int count() const {
    return _fields.count();
  }

  Field at(int index) const {
    if (index < 0 || index >= _fields.count()) return Field();
    return Field(_fields.at(index));
  }

  emscripten::val field(std::string name) const {
    int idx = _fields.lookupField(QString::fromStdString(name));
    if (idx < 0) return emscripten::val::null();
    return emscripten::val(Field(_fields.at(idx)));
  }

  /**
   * Append a copy of `f`. Returns true if the field was added (its name is
   * not already in use), false otherwise — matches the underlying
   * QgsFields::append return semantics.
   */
  bool append(const Field &f) {
    return _fields.append(f.nativeField());
  }

  const QgsFields &nativeFields() const {
    return _fields;
  }

private:
  QgsFields _fields;
};

EMSCRIPTEN_BINDINGS(QgsFields) {
  emscripten::class_<Fields>("QgsFields")
    .constructor<>()
    .function("count", &Fields::count)
    .function("at", &Fields::at)
    .function("field", &Fields::field)
    .function("append", &Fields::append);
}
