import type { QgisApi } from "qgis-js";

import ImageSource, { Options } from "ol/source/Image";
import { getWidth, getHeight } from "ol/extent";

export interface QgisPreviewDataSourceOptions extends Options {}

export class QgisPreviewDataSource extends ImageSource {
  protected api: QgisApi;

  protected jobCancelTokens?: (() => void)[] = [];

  constructor(
    api: QgisApi,
    previewCallback: (image: ImageData | undefined) => void,
    options: QgisPreviewDataSourceOptions = {},
  ) {
    super({
      loader: (extent, resolution, requestPixelRatio) => {
        return new Promise(async (resolve) => {
          const pixelRatio = 1; //requestPixelRatio || window?.devicePixelRatio || 1;
          const imageResolution = resolution / pixelRatio;
          const width = Math.round(getWidth(extent) / imageResolution);
          const height = Math.round(getHeight(extent) / imageResolution);
          const srid = this.getProjection()?.getCode() || "EPSG:3857";

          // clear preview
          previewCallback(undefined);

          // cancle pending jobs
          while (this.jobCancelTokens && this.jobCancelTokens.length > 0) {
            const cancelToken = this.jobCancelTokens.pop();
            if (cancelToken) {
              console.log("cancel toeken", cancelToken);
              cancelToken();
            }
          }

          // render image
          let jobCancelToken: (() => void) | undefined;
          const result = await api.renderImage(
            srid,
            new api.Rectangle(extent[0], extent[1], extent[2], extent[3]),
            width,
            height,
            pixelRatio,
            async (imageData) => {
              previewCallback(imageData);
            },
            (cancelToken: any) => {
              jobCancelToken = cancelToken;
              this.jobCancelTokens!.push(cancelToken);
            },
          );
          setTimeout(() => {
            previewCallback(undefined);
          }, 50);
          // remove cancel token
          if (jobCancelToken) {
            const index = this.jobCancelTokens!.indexOf(jobCancelToken);
            if (index > -1) {
              console.log("remove token");
              this.jobCancelTokens!.splice(index, 1);
            }
          }
          resolve(createImageBitmap(result));
        });
      },
      ...options,
    });

    this.api = api;
  }
}
