#pragma once

#include <string>

#include <qgis.h>
#include <qgswkbtypes.h>

#include <emscripten/bind.h>

class WkbTypes {
public:
  static std::string displayString(int type) {
    return QgsWkbTypes::displayString(static_cast<Qgis::WkbType>(type)).toStdString();
  }

  static int geometryType(int type) {
    return static_cast<int>(QgsWkbTypes::geometryType(static_cast<Qgis::WkbType>(type)));
  }

  static int flatType(int type) {
    return static_cast<int>(QgsWkbTypes::flatType(static_cast<Qgis::WkbType>(type)));
  }

  static int singleType(int type) {
    return static_cast<int>(QgsWkbTypes::singleType(static_cast<Qgis::WkbType>(type)));
  }

  static int multiType(int type) {
    return static_cast<int>(QgsWkbTypes::multiType(static_cast<Qgis::WkbType>(type)));
  }

  static bool hasZ(int type) {
    return QgsWkbTypes::hasZ(static_cast<Qgis::WkbType>(type));
  }

  static bool hasM(int type) {
    return QgsWkbTypes::hasM(static_cast<Qgis::WkbType>(type));
  }

  static bool isSingleType(int type) {
    return QgsWkbTypes::isSingleType(static_cast<Qgis::WkbType>(type));
  }

  static bool isMultiType(int type) {
    return QgsWkbTypes::isMultiType(static_cast<Qgis::WkbType>(type));
  }
};

EMSCRIPTEN_BINDINGS(QgsWkbTypes) {
  emscripten::class_<WkbTypes>("QgsWkbTypes")
    .class_function("displayString", &WkbTypes::displayString)
    .class_function("geometryType", &WkbTypes::geometryType)
    .class_function("flatType", &WkbTypes::flatType)
    .class_function("singleType", &WkbTypes::singleType)
    .class_function("multiType", &WkbTypes::multiType)
    .class_function("hasZ", &WkbTypes::hasZ)
    .class_function("hasM", &WkbTypes::hasM)
    .class_function("isSingleType", &WkbTypes::isSingleType)
    .class_function("isMultiType", &WkbTypes::isMultiType);
}
