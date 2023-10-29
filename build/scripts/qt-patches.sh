#!/bin/bash
set -eo pipefail

QGIS_JS_DIR=$(pwd)
QGIS_JS_QT="${QGIS_JS_QT:-${HOME}/Qt/6.5.2}"

if [ ! -d "$QGIS_JS_QT/" ]; then
  echo "Directory $QGIS_JS_QT does not exist."
  exit 1
fi

(
  cd $QGIS_JS_QT
  
  for patchfile in $QGIS_JS_DIR/build/qt-patches/*.patch; do
    echo "- Applying patch $patchfile in $QGIS_JS_QT"

    if ! patch -R -p0 -s -f --dry-run <$patchfile 2>&1 >/dev/null; then
      patch -p0 <$patchfile | sed 's/^/-- / '
    else
      echo "-- patch already applied, skipping"
    fi
  done
)
