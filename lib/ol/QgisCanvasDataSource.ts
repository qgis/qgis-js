// @ts-ignore -- optional dependency
import ImageSource, { Options } from "ol/source/Image";
// @ts-ignore -- optional dependency
import { getWidth, getHeight } from "ol/extent";

// FIXME: switch to async implementation
// export type QgisCanvasRenderFunction = () => Promise<ImageData>;
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
) => ImageData;

/**
 * @public
 */
export interface QgisCanvasDataSourceOptions extends Options {
  renderFunction: QgisCanvasRenderFunction;
  debug?: boolean;
}

/**
 * @public
 */
export class QgisCanvasDataSource extends ImageSource {
  protected renderFunction: QgisCanvasRenderFunction;

  constructor(options: QgisCanvasDataSourceOptions) {
    super({
      loader: (extent, resolution, requestPixelRatio) => {
        return new Promise((resolve) => {
          const pixelRatio = requestPixelRatio || window?.devicePixelRatio || 1;
          const imageResolution = resolution / pixelRatio;
          const width = Math.round(getWidth(extent) / imageResolution);
          const height = Math.round(getHeight(extent) / imageResolution);

          const imageData = this.renderFunction(
            this.getProjection()!.getCode().replace("EPSG:", ""),
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

    this.renderFunction = options.renderFunction;
  }
}
