#pragma once

#include <string>

#include <qgsexpression.h>

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./QVariant.hpp"
#include "./QgsExpressionContext.hpp"

class Expression {
public:
  Expression() = default;
  Expression(std::string expression) : _expr(QString::fromStdString(expression)) {}

  static std::string replaceExpressionText(std::string text, const ExpressionContext &context) {
    return QgsExpression::replaceExpressionText(
             QString::fromStdString(text), &context.nativeContext())
      .toStdString();
  }

  std::string expression() const {
    return _expr.expression().toStdString();
  }

  bool isValid() const {
    return _expr.isValid();
  }

  bool hasParserError() const {
    return _expr.hasParserError();
  }

  std::string parserErrorString() const {
    return _expr.parserErrorString().toStdString();
  }

  bool hasEvalError() const {
    return _expr.hasEvalError();
  }

  std::string evalErrorString() const {
    return _expr.evalErrorString().toStdString();
  }

  bool prepare(const ExpressionContext &context) {
    return _expr.prepare(&context.nativeContext());
  }

  emscripten::val evaluate(const ExpressionContext &context) {
    return qvariantToVal(_expr.evaluate(&context.nativeContext()));
  }

private:
  QgsExpression _expr;
};

EMSCRIPTEN_BINDINGS(QgsExpression) {
  emscripten::class_<Expression>("QgsExpression")
    .constructor<std::string>()
    .function("expression", &Expression::expression)
    .function("isValid", &Expression::isValid)
    .function("hasParserError", &Expression::hasParserError)
    .function("parserErrorString", &Expression::parserErrorString)
    .function("hasEvalError", &Expression::hasEvalError)
    .function("evalErrorString", &Expression::evalErrorString)
    .function("prepare", &Expression::prepare)
    .function("evaluate", &Expression::evaluate)
    .class_function("replaceExpressionText", &Expression::replaceExpressionText);
}
