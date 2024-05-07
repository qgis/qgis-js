#pragma once

#include <qgsmaprendererparalleljob.h>

#include <emscripten/bind.h>

#include "./QgsMapRendererQImageJob.hpp"

EMSCRIPTEN_BINDINGS(QgsMapRendererParallelJob) {
  emscripten::class_<QgsMapRendererParallelJob, emscripten::base<QgsMapRendererQImageJob>>(
    "QgsMapRendererParallelJob")
    .function("cancel", &QgsMapRendererParallelJob::cancel)
    .function("cancelWithoutBlocking", &QgsMapRendererParallelJob::cancelWithoutBlocking)
    .function("isActive", &QgsMapRendererParallelJob::isActive)
    .function("renderingTime", &QgsMapRendererParallelJob::renderingTime);
}
