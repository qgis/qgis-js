import { Layer } from "ol/layer.js";
import { QgisApi } from "qgis-js";

export class QgisPreviewLayer extends Layer {
  protected api: QgisApi;
  protected lastImage: ImageData | undefined;

  constructor(options: any, api: QgisApi) {
    super(options);
    this.api = api;
  }

  //@ts-ignore
  getSourceState() {
    return "ready";
  }

  getPreviewCallback(): (image: ImageData | undefined) => void {
    return (image: ImageData | undefined) => {
      this.lastImage = image;
      this.changed();
    };
  }

  render(frameState: any) {
    console.log("render");

    const width = frameState.size[0];
    const height = frameState.size[1];
    const ratio = 1; //frameState.pixelRatio || window.devicePixelRatio || 1;

    const element = document.createElement("canvas");
    element.width = width;
    element.height = height;
    // draw context 2d yellow
    const ctx = element.getContext("2d");
    element.width = width * ratio;
    element.height = height * ratio;
    element.style.width = width + "px";
    element.style.height = height + "px";
    ctx!.scale(ratio, ratio);

    if (this.lastImage) {
      ctx!.putImageData(this.lastImage, 0, 0);
    } else {
      return null;
    }

    return element;
  }
}
