#pragma once

#include <string>

#include <qgsexpressioncontext.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsFeature.hpp"
#include "./QgsFields.hpp"

class ExpressionContext {
public:
  ExpressionContext() = default;
  ExpressionContext(const QgsExpressionContext &ctx) : _ctx(ctx) {}

  void setFeature(const Feature &feature) {
    _ctx.setFeature(feature.nativeFeature());
  }

  void setFields(const Fields &fields) {
    _ctx.setFields(fields.nativeFields());
  }

  emscripten::val variable(std::string name) const {
    return qvariantToVal(_ctx.variable(QString::fromStdString(name)));
  }

  const QgsExpressionContext &nativeContext() const {
    return _ctx;
  }

  QgsExpressionContext &nativeContext() {
    return _ctx;
  }

private:
  QgsExpressionContext _ctx;
};

EMSCRIPTEN_BINDINGS(QgsExpressionContext) {
  emscripten::class_<ExpressionContext>("QgsExpressionContext")
    .constructor<>()
    .function("setFeature", &ExpressionContext::setFeature)
    .function("setFields", &ExpressionContext::setFields)
    .function("variable", &ExpressionContext::variable);
}
