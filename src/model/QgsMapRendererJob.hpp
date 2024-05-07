#pragma once

#include <qgsmaprendererjob.h>

#include <emscripten/bind.h>

static void QgsMapRendererJob_finished(QgsMapRendererJob &job, emscripten::val callback) {
  QObject::connect(&job, &QgsMapRendererJob::finished, [callback] { callback(); });
}

EMSCRIPTEN_BINDINGS(QgsMapRendererJob) {
  emscripten::class_<QgsMapRendererJob>("QgsMapRendererJob")
    .function("cancel", &QgsMapRendererJob::cancel)
    .function("cancelWithoutBlocking", &QgsMapRendererJob::cancelWithoutBlocking)
    .function("isActive", &QgsMapRendererJob::isActive)
    .function("renderingTime", &QgsMapRendererJob::renderingTime)
    // signals
    .function("finished", &QgsMapRendererJob_finished);
}
