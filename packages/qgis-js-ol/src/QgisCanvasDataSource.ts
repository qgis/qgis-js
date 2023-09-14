import ImageSource, { Options } from "ol/source/Image";
import { getWidth, getHeight } from "ol/extent";

/**
 * @internal
 */
export type QgisCanvasRenderFunction = (
  srid: string,
  xMin: number,
  yMin: number,
  xMax: number,
  yMax: number,
  width: number,
  height: number,
) => Promise<ImageData>;

export interface QgisCanvasDataSourceOptions extends Options {}

export class QgisCanvasDataSource extends ImageSource {
  protected renderFunction: QgisCanvasRenderFunction;

  constructor(
    renderFunction: QgisCanvasRenderFunction,
    options: QgisCanvasDataSourceOptions = {},
  ) {
    super({
      loader: (extent, resolution, requestPixelRatio) => {
        return new Promise(async (resolve) => {
          const pixelRatio = requestPixelRatio || window?.devicePixelRatio || 1;
          const imageResolution = resolution / pixelRatio;
          const width = Math.round(getWidth(extent) / imageResolution);
          const height = Math.round(getHeight(extent) / imageResolution);

          const imageData = await this.renderFunction(
            this.getProjection()?.getCode() || "EPSG:3857",
            extent[0],
            extent[1],
            extent[2],
            extent[3],
            width,
            height,
          );

          resolve(createImageBitmap(imageData));
        });
      },
      ...options,
    });

    this.renderFunction = renderFunction;
  }
}
