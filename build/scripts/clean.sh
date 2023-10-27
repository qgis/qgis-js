echo "- cleaning build/emsdk"
(cd build/emsdk;git clean -xfd)

echo "- cleaning build/vcpkg"
(cd build/vcpkg;git clean -xfd)

echo "- cleaning build/wasm"
rm -rf build/wasm && mkdir build/wasm
