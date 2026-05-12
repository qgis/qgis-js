#pragma once

#include <string>

#include <qgis.h>
#include <qgscoordinatereferencesystem.h>
#include <qgsfeaturerequest.h>
#include <qgsfields.h>
#include <qgsproject.h>
#include <qgsrectangle.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QgsFields.hpp"

class FeatureRequest {
public:
  FeatureRequest() = default;
  FeatureRequest(const QgsFeatureRequest &request) : _request(request) {}

  void setFilterRect(const QgsRectangle &rectangle) {
    _request.setFilterRect(rectangle);
  }

  void setFilterExpression(std::string expression) {
    _request.setFilterExpression(QString::fromStdString(expression));
  }

  void setFilterFid(double fid) {
    _request.setFilterFid(static_cast<QgsFeatureId>(fid));
  }

  void setFilterFids(emscripten::val fids) {
    QgsFeatureIds ids;
    int length = fids["length"].as<int>();
    for (int i = 0; i < length; ++i) {
      ids.insert(static_cast<QgsFeatureId>(fids[i].as<double>()));
    }
    _request.setFilterFids(ids);
  }

  void setLimit(double limit) {
    _request.setLimit(static_cast<long long>(limit));
  }

  void setFlags(int flags) {
    _request.setFlags(static_cast<Qgis::FeatureRequestFlags>(flags));
  }

  int flags() const {
    return static_cast<int>(_request.flags());
  }

  void setSubsetOfAttributes(emscripten::val names, const Fields &fields) {
    QStringList list;
    int length = names["length"].as<int>();
    for (int i = 0; i < length; ++i) {
      list << QString::fromStdString(names[i].as<std::string>());
    }
    _request.setSubsetOfAttributes(list, fields.nativeFields());
  }

  void setDestinationCrs(std::string authid) {
    _request.setDestinationCrs(
      QgsCoordinateReferenceSystem(QString::fromStdString(authid)),
      QgsProject::instance()->transformContext());
  }

  const QgsFeatureRequest &nativeRequest() const {
    return _request;
  }

private:
  QgsFeatureRequest _request;
};

EMSCRIPTEN_BINDINGS(QgsFeatureRequest) {
  emscripten::class_<FeatureRequest>("QgsFeatureRequest")
    .constructor<>()
    .function("setFilterRect", &FeatureRequest::setFilterRect)
    .function("setFilterExpression", &FeatureRequest::setFilterExpression)
    .function("setFilterFid", &FeatureRequest::setFilterFid)
    .function("setFilterFids", &FeatureRequest::setFilterFids)
    .function("setLimit", &FeatureRequest::setLimit)
    .function("setFlags", &FeatureRequest::setFlags)
    .function("flags", &FeatureRequest::flags)
    .function("setSubsetOfAttributes", &FeatureRequest::setSubsetOfAttributes)
    .function("setDestinationCrs", &FeatureRequest::setDestinationCrs);

  emscripten::register_optional<FeatureRequest>();
}
