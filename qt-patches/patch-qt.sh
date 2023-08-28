
CURRENT_DIR=$(pwd)
QT_DIR=~/Qt/6.5.2

cd $QT_DIR
patch -p0 < $CURRENT_DIR/egl.patch
patch -p0 < $CURRENT_DIR/exceptions.patch
cd $CURRENT_DIR
