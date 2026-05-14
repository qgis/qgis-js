import type { QgsExpressionContext } from "./QgsExpressionContext";

/**
 * Parses and evaluates a QGIS expression. Build a context (e.g. via
 * `QgsVectorLayer.createExpressionContext()`, then `ctx.setFeature(f)`) and
 * pass it to {@link evaluate} or {@link prepare}.
 *
 * {@link https://api.qgis.org/api/classQgsExpression.html}
 */
export interface QgsExpression {
  expression(): string;
  isValid(): boolean;
  hasParserError(): boolean;
  parserErrorString(): string;
  hasEvalError(): boolean;
  evalErrorString(): string;
  /**
   * Pre-compiles the expression for repeated evaluation. Returns false if
   * the parser failed.
   */
  prepare(context: QgsExpressionContext): boolean;
  /**
   * Evaluates the expression in the given context. Check {@link hasEvalError}
   * afterwards if needed.
   */
  evaluate(context: QgsExpressionContext): unknown;
}

export interface QgsExpressionConstructors {
  QgsExpression: {
    new (expression: string): QgsExpression;
    /**
     * Walks `text` and substitutes every `[% expr %]` placeholder with the
     * result of evaluating that expression in `context`. The natural way to
     * render a `QgsVectorLayer.mapTipTemplate()` for a feature.
     */
    replaceExpressionText(text: string, context: QgsExpressionContext): string;
  };
}
