#pragma once

#include <QByteArray>
#include <QDate>
#include <QDateTime>
#include <QMetaType>
#include <QString>
#include <QTime>
#include <QVariant>

#include <emscripten/bind.h>
#include <emscripten/val.h>

inline emscripten::val makeUint8Array(const char *data, int size) {
  emscripten::val u8 = emscripten::val::global("Uint8Array").new_(size);
  if (size > 0) {
    emscripten::val view = emscripten::val(emscripten::typed_memory_view(
      static_cast<size_t>(size), reinterpret_cast<const uint8_t *>(data)));
    u8.call<void>("set", view);
  }
  return u8;
}

inline emscripten::val qvariantToVal(const QVariant &v) {
  if (!v.isValid() || v.isNull()) return emscripten::val::null();

  switch (v.userType()) {
    case QMetaType::Bool:
      return emscripten::val(v.toBool());
    case QMetaType::Int:
    case QMetaType::Short:
      return emscripten::val(v.toInt());
    case QMetaType::UInt:
    case QMetaType::UShort:
      return emscripten::val(v.toUInt());
    case QMetaType::LongLong:
    case QMetaType::ULongLong:
      // JS numbers lose precision above 2^53; sufficient for typical FIDs and counts.
      return emscripten::val(static_cast<double>(v.toLongLong()));
    case QMetaType::Double:
    case QMetaType::Float:
      return emscripten::val(v.toDouble());
    case QMetaType::QString:
      return emscripten::val(v.toString().toStdString());
    case QMetaType::QByteArray: {
      QByteArray ba = v.toByteArray();
      return makeUint8Array(ba.constData(), ba.size());
    }
    case QMetaType::QDateTime:
      return emscripten::val(v.toDateTime().toString(Qt::ISODateWithMs).toStdString());
    case QMetaType::QDate:
      return emscripten::val(v.toDate().toString(Qt::ISODate).toStdString());
    case QMetaType::QTime:
      return emscripten::val(v.toTime().toString(Qt::ISODateWithMs).toStdString());
    default:
      return emscripten::val(v.toString().toStdString());
  }
}
