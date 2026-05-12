#pragma once

#include <string>

#include <qgsfield.h>

#include <emscripten/bind.h>

class Field {
public:
  Field() = default;
  Field(const QgsField &field) : _field(field) {}

  std::string name() const {
    return _field.name().toStdString();
  }

  std::string typeName() const {
    return _field.typeName().toStdString();
  }

  int type() const {
    return static_cast<int>(_field.type());
  }

  std::string alias() const {
    return _field.alias().toStdString();
  }

  int length() const {
    return _field.length();
  }

  int precision() const {
    return _field.precision();
  }

  const QgsField &nativeField() const {
    return _field;
  }

private:
  QgsField _field;
};

EMSCRIPTEN_BINDINGS(QgsField) {
  emscripten::class_<Field>("QgsField")
    .constructor<>()
    .function("name", &Field::name)
    .function("typeName", &Field::typeName)
    .function("type", &Field::type)
    .function("alias", &Field::alias)
    .function("length", &Field::length)
    .function("precision", &Field::precision);
}
