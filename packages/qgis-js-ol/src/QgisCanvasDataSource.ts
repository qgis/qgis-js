import type { QgisApi } from "qgis-js";

import ImageSource, { Options } from "ol/source/Image";
import { getWidth, getHeight } from "ol/extent";

export interface QgisCanvasDataSourceOptions extends Options {
  renderFunction?: QgisCanvasRenderFunction;
}

export type QgisCanvasRenderFunction = (
  api: QgisApi,
  srid: string,
  xMin: number,
  yMin: number,
  xMax: number,
  yMax: number,
  width: number,
  height: number,
  pixelRatio: number,
) => Promise<ImageData>;

export class QgisCanvasDataSource extends ImageSource {
  protected api: QgisApi;

  protected static DEFAULT_RENDERFUNCTION: QgisCanvasRenderFunction = (
    api: QgisApi,
    srid: string,
    xMin: number,
    yMin: number,
    xMax: number,
    yMax: number,
    width: number,
    height: number,
    pixelRatio: number,
  ) => {
    return api.renderImage(
      srid,
      new api.Rectangle(xMin, yMin, xMax, yMax),
      width,
      height,
      pixelRatio,
    );
  };

  protected renderFunction: QgisCanvasRenderFunction | undefined;

  protected getrenderFunction(): QgisCanvasRenderFunction {
    return this.renderFunction || QgisCanvasDataSource.DEFAULT_RENDERFUNCTION;
  }

  constructor(api: QgisApi, options: QgisCanvasDataSourceOptions = {}) {
    super({
      loader: (extent, resolution, requestPixelRatio) => {
        return new Promise(async (resolve) => {
          // note: requestPixelRatio is managed by ol and will not change on zoom
          const pixelRatio = requestPixelRatio || window?.devicePixelRatio || 1;
          const imageResolution = resolution / pixelRatio;
          const width = Math.round(getWidth(extent) / imageResolution);
          const height = Math.round(getHeight(extent) / imageResolution);

          const renderFunction = this.getrenderFunction();
          const imageData = await renderFunction(
            this.api,
            this.getProjection()?.getCode() || "EPSG:3857",
            extent[0],
            extent[1],
            extent[2],
            extent[3],
            width,
            height,
            pixelRatio,
          );

          resolve(createImageBitmap(imageData));
        });
      },
      ...options,
    });

    this.api = api;
    this.renderFunction = options.renderFunction;
  }
}
