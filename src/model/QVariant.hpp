#pragma once

#include <cstdint>
#include <string>
#include <vector>

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

// Returns a JS Number when the value fits in the safe integer range, BigInt
// otherwise. Avoids precision loss for 64-bit ints (FIDs, large counts, …).
inline emscripten::val makeIntegerVal(long long value) {
  constexpr long long SAFE = 1LL << 53;
  if (value >= -SAFE && value <= SAFE) return emscripten::val(static_cast<double>(value));
  return emscripten::val::global("BigInt")(emscripten::val(std::to_string(value)));
}

inline emscripten::val makeIntegerVal(unsigned long long value) {
  constexpr unsigned long long SAFE = 1ULL << 53;
  if (value <= SAFE) return emscripten::val(static_cast<double>(value));
  return emscripten::val::global("BigInt")(emscripten::val(std::to_string(value)));
}

/**
 * Convert a JS value to a QVariant for round-trip storage as a feature
 * attribute or expression value. The mapping is:
 *  - null / undefined        -> invalid QVariant (NULL)
 *  - boolean                 -> bool
 *  - number                  -> double (QGIS coerces to the field's declared type on write)
 *  - string                  -> QString
 *  - Uint8Array              -> QByteArray
 *  - anything else           -> QString via JSON.stringify
 *
 * Numeric precision: integers up to 2^53 round-trip cleanly through double.
 * Use a string for larger integers.
 */
inline QVariant valToQVariant(const emscripten::val &v) {
  if (v.isNull() || v.isUndefined()) return QVariant();
  std::string t = v.typeOf().as<std::string>();
  if (t == "boolean") return QVariant(v.as<bool>());
  if (t == "number") return QVariant(v.as<double>());
  if (t == "bigint")
    return QVariant(QString::fromStdString(v.call<emscripten::val>("toString").as<std::string>()));
  if (t == "string") return QVariant(QString::fromStdString(v.as<std::string>()));
  if (t == "object") {
    emscripten::val u8 = emscripten::val::global("Uint8Array");
    if (!u8.isUndefined() && v.instanceof (u8)) {
      std::vector<uint8_t> bytes = emscripten::convertJSArrayToNumberVector<uint8_t>(v);
      return QVariant(
        QByteArray(reinterpret_cast<const char *>(bytes.data()), static_cast<int>(bytes.size())));
    }
    emscripten::val json = emscripten::val::global("JSON").call<emscripten::val>("stringify", v);
    return QVariant(QString::fromStdString(json.as<std::string>()));
  }
  return QVariant();
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
      return makeIntegerVal(static_cast<long long>(v.toLongLong()));
    case QMetaType::ULongLong:
      return makeIntegerVal(static_cast<unsigned long long>(v.toULongLong()));
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
