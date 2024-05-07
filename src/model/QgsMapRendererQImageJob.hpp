#pragma once

#include <qgsmaprendererjob.h>

#include <emscripten/bind.h>

#include "./QgsMapRendererJob.hpp"

static emscripten::val QgsMapRendererQImageJob_renderedImage(QgsMapRendererQImageJob &job) {
  auto image = std::move(job.renderedImage()).convertToFormat(QImage::Format_RGBA8888);
  return emscripten::val(emscripten::typed_memory_view(
    image.width() * image.height() * 4, (const unsigned char *)image.constBits()));
}

EMSCRIPTEN_BINDINGS(QgsMapRendererQImageJob) {
  emscripten::class_<QgsMapRendererQImageJob, emscripten::base<QgsMapRendererJob>>(
    "QgsMapRendererQImageJob")
    .function("renderedImage", &QgsMapRendererQImageJob_renderedImage);
}
