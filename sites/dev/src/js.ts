import { QgisApi } from "../../src/api/QgisApi";
import { Rectangle } from "../../src/api/QgisModel";

const mapScaleFactor = 1.5;
const mapMoveFactor = 0.1;

export function jsDemo(canvas: HTMLCanvasElement, api: QgisApi): () => void {
  let lastExtent: Rectangle | null = null;

  function onStart() {
    lastExtent = api.fullExtent();
    renderMap();
  }

  async function renderMap() {
    var devicePixelRatio = window.devicePixelRatio || 1;
    var cssRect = canvas.getBoundingClientRect();
    const imageWidth = cssRect.width * devicePixelRatio;
    const imageHeight = cssRect.height * devicePixelRatio;

    const image = await api.render(lastExtent!, imageWidth, imageHeight);

    const context = canvas.getContext("2d");
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    context!.scale(devicePixelRatio, devicePixelRatio);
    context!.putImageData(image, 0, 0);
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

  onStart();

  const update = () => {
    onStart();
  };

  return update;
}
