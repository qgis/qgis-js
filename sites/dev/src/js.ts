import { QgisApi } from "qgis-js";

import type { Rectangle } from "qgis-js";

const mapScaleFactor = 1.5;
const mapMoveFactor = 0.1;

export function jsDemo(
  canvas: HTMLCanvasElement,
  api: QgisApi,
): { update: () => void; render: () => void } {
  let lastExtent: Rectangle | null = null;

  // ensure pixel perfect rendering
  // see https://web.dev/articles/device-pixel-content-box
  const observer = new ResizeObserver((entries) => {
    const entry = entries.find((entry) => entry.target === canvas);
    if (entry) {
      canvas.width = entry.devicePixelContentBoxSize[0].inlineSize;
      canvas.height = entry.devicePixelContentBoxSize[0].blockSize;
    }
    renderMap();
  });
  observer.observe(canvas, { box: "device-pixel-content-box" });

  async function renderMap() {
    var devicePixelRatio = window.devicePixelRatio || 1;
    var cssRect = canvas.getBoundingClientRect();
    const imageWidth = cssRect.width * devicePixelRatio;
    const imageHeight = cssRect.height * devicePixelRatio;

    if (imageWidth && imageHeight) {
      const image = await api.renderImage(
        api.srid(),
        lastExtent!,
        imageWidth,
        imageHeight,
        window.devicePixelRatio,
      );

      const context = canvas.getContext("2d");
      canvas.width = imageWidth;
      canvas.height = imageHeight;
      context!.scale(devicePixelRatio, devicePixelRatio);
      context!.putImageData(image, 0, 0);
    }
  }

  document.getElementById("zoomin")!.onclick = function () {
    lastExtent!.scale(1 / mapScaleFactor);
    renderMap();
  };
  document.getElementById("zoomout")!.onclick = function () {
    lastExtent!.scale(mapScaleFactor);
    renderMap();
  };
  document.getElementById("panleft")!.onclick = function () {
    lastExtent!.move(
      (lastExtent!.xMaximum - lastExtent!.xMinimum) * mapMoveFactor,
      0,
    );
    renderMap();
  };
  document.getElementById("panright")!.onclick = function () {
    lastExtent!.move(
      -(lastExtent!.xMaximum - lastExtent!.xMinimum) * mapMoveFactor,
      0,
    );
    renderMap();
  };
  document.getElementById("panup")!.onclick = function () {
    lastExtent!.move(
      0,
      -(lastExtent!.yMaximum - lastExtent!.yMinimum) * mapMoveFactor,
    );
    renderMap();
  };
  document.getElementById("pandown")!.onclick = function () {
    lastExtent!.move(
      0,
      (lastExtent!.yMaximum - lastExtent!.yMinimum) * mapMoveFactor,
    );
    renderMap();
  };

  function onStart() {
    lastExtent = api.fullExtent();
    renderMap();
  }

  onStart();

  return {
    update: () => {
      onStart();
    },
    render: () => {
      renderMap();
    },
  };
}
