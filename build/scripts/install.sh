echo "- installing emsdk"
(
  cd build/emsdk;
  ./emsdk install 3.1.29;
  ./emsdk activate 3.1.29;
  cd ../..;
)

echo "installing vcpkg"
(
  ./build/vcpkg/bootstrap-vcpkg.sh \
    -disableMetrics
)

echo "running vcpkg install"
(
  ./build/vcpkg/vcpkg install \
    --x-install-root=build/wasm/vcpkg_installed \
    --only-downloads \
    --overlay-triplets=build/vcpkg-triplets \
    --overlay-ports=build/vcpkg-ports \
    --triplet wasm32-emscripten-qt-threads
)
