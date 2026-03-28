#pragma once

#include <string>

#include <qgslayertreemodel.h>
#include <qgslayertreemodellegendnode.h>
#include <qgslegendrenderer.h>
#include <qgslegendsettings.h>
#include <qgsmaplayerlegend.h>
#include <qgsrendercontext.h>
#include <qgssymbol.h>

#include <QBuffer>
#include <QImage>
#include <QPainter>

#include <emscripten/bind.h>
#include <emscripten/val.h>

inline QList<QgsLayerTreeModelLegendNode *> &legendNodesCache() {
  static QList<QgsLayerTreeModelLegendNode *> cache;
  return cache;
}

inline std::string imageToDataUrl(const QImage &image) {
  if (image.isNull()) return "";
  QByteArray ba;
  QBuffer buffer(&ba);
  buffer.open(QIODevice::WriteOnly);
  image.save(&buffer, "PNG");
  return "data:image/png;base64," + ba.toBase64().toStdString();
}

inline std::string renderLegendForTree(QgsLayerTree *tree, float dpi) {
  QgsLayerTreeModel model(tree);

  QgsLegendSettings settings;
  settings.setTitle("");

  QgsRenderContext context;
  context.setScaleFactor(dpi / 25.4);

  QgsLegendRenderer renderer(&model, settings);
  QSizeF minSize = renderer.minimumSize(&context);

  int width = static_cast<int>(std::ceil(minSize.width() * dpi / 25.4));
  int height = static_cast<int>(std::ceil(minSize.height() * dpi / 25.4));
  if (width <= 0 || height <= 0) return "";

  QImage image(width, height, QImage::Format_ARGB32);
  image.fill(Qt::transparent);
  image.setDotsPerMeterX(static_cast<int>(dpi / 25.4 * 1000));
  image.setDotsPerMeterY(static_cast<int>(dpi / 25.4 * 1000));

  QPainter painter(&image);
  painter.setRenderHint(QPainter::Antialiasing, true);
  painter.scale(dpi / 25.4, dpi / 25.4);
  QgsRenderContext renderContext = QgsRenderContext::fromQPainter(&painter);
  renderContext.setScaleFactor(dpi / 25.4);

  renderer.setLegendSize(minSize);
  renderer.drawLegend(renderContext);
  painter.end();

  return imageToDataUrl(image);
}

class LegendNode {
public:
  LegendNode() : _node(nullptr) {}
  LegendNode(QgsLayerTreeModelLegendNode *node) : _node(node) {}

  bool isValid() const {
    return _node != nullptr;
  }

  std::string label() const {
    if (!_node) return "";
    return _node->data(Qt::DisplayRole).toString().toStdString();
  }

  std::string symbolImage(int size) const {
    if (!_node) return "";
    if (auto *symNode = dynamic_cast<QgsSymbolLegendNode *>(_node)) {
      if (const QgsSymbol *symbol = symNode->symbol()) {
        QImage img = const_cast<QgsSymbol *>(symbol)->asImage(QSize(size, size));
        return imageToDataUrl(img);
      }
    }
    QVariant iconData = _node->data(Qt::DecorationRole);
    if (iconData.canConvert<QIcon>()) {
      QIcon icon = iconData.value<QIcon>();
      QPixmap pix = icon.pixmap(QSize(size, size));
      if (!pix.isNull()) return imageToDataUrl(pix.toImage());
    }
    return "";
  }

private:
  QgsLayerTreeModelLegendNode *_node;
};

EMSCRIPTEN_BINDINGS(QgsLayerTreeModelLegendNode) {
  emscripten::class_<LegendNode>("QgsLayerTreeModelLegendNode")
    .constructor<>()
    .function("isValid", &LegendNode::isValid)
    .function("label", &LegendNode::label)
    .function("symbolImage", &LegendNode::symbolImage);
}
