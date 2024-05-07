import type { QgisApi, QgsMapRendererJob } from "qgis-js";

import ImageSource, { Options } from "ol/source/Image";
import ImageWrapper from "ol/Image";
import { getWidth, getHeight, getCenter, containsExtent } from "ol/extent";
import {
  create as createTransform,
  compose as composeTransform,
} from "ol/transform";

export interface QgisJobDataSrouceOptions extends Options {
  /**
   * Specifies whether to enable preview mode.
   * (default: true)
   */
  preview?: boolean;

  /**
   * Specifies the timeout to wait before rendering the next preview (in milliseconds).
   * (default: 200)
   */
  previewTimeout?: number;

  /**
   * Specifies whether to enable overlay of the last fully rendered image on top of the previews.
   * (default: true)
   */
  previewOverlay?: boolean;
}

export class QgisJobDataSrouce extends ImageSource {
  protected api: QgisApi;

  protected preview: boolean;
  protected previewTimeout: number;
  protected previewOverlay: boolean;

  private lastImage: ImageWrapper | null = null;

  private jobs: QgsMapRendererJob[] = [];

  constructor(api: QgisApi, options: QgisJobDataSrouceOptions = {}) {
    super({
      loader: (extent, resolution, requestPixelRatio) => {
        return new Promise(async (resolve) => {
          this.killPendingJobs();

          const pixelRatio = requestPixelRatio || window?.devicePixelRatio || 1;
          const imageResolution = resolution / pixelRatio;
          const width = Math.round(getWidth(extent) / imageResolution);
          const height = Math.round(getHeight(extent) / imageResolution);

          const canvas = document.createElement("canvas");

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          const job = api.renderJob(
            this.getProjection()?.getCode() || "EPSG:3857",
            new api.Rectangle(extent[0], extent[1], extent[2], extent[3]),
            width,
            height,
            pixelRatio,
          );
          this.jobs.push(job);

          const putRenderedImage = () => {
            const data = new Uint8ClampedArray(job.renderedImage());
            const imageData = new ImageData(data, width, height);
            ctx!.putImageData(imageData, 0, 0);
          };

          if (this.preview) {
            const schedulePreivew = () => {
              requestAnimationFrame(() => {
                if (job.isActive()) {
                  // if the preview will be entirely overlaid (e.g. on zooming in), we can skip preview rendering
                  const skipPreviewRendering =
                    this.previewOverlay &&
                    this.lastImage &&
                    containsExtent(this.lastImage.getExtent(), extent);

                  if (!skipPreviewRendering) {
                    putRenderedImage();
                  }

                  if (this.previewOverlay && this.lastImage) {
                    const lastImageToDraw = this.lastImage.getImage();
                    if (lastImageToDraw) {
                      const imageExtent = this.lastImage.getExtent();
                      const imageResolution = this.lastImage.getResolution();
                      const [imageResolutionX, imageResolutionY] =
                        Array.isArray(imageResolution)
                          ? imageResolution
                          : [imageResolution, imageResolution];
                      const imagePixelRatio = this.lastImage.getPixelRatio();

                      const viewCenter = getCenter(extent);

                      const scaleX =
                        (pixelRatio * imageResolutionX) /
                        (resolution * imagePixelRatio);
                      const scaleY =
                        (pixelRatio * imageResolutionY) /
                        (resolution * imagePixelRatio);

                      const tempTransform = createTransform();
                      const transform = composeTransform(
                        tempTransform,
                        width / 2,
                        height / 2,
                        scaleX,
                        scaleY,
                        0,
                        (imagePixelRatio * (imageExtent[0] - viewCenter[0])) /
                          imageResolutionX,
                        (imagePixelRatio * (viewCenter[1] - imageExtent[3])) /
                          imageResolutionY,
                      );

                      const dw = lastImageToDraw.width * transform[0];
                      const dh = lastImageToDraw.height * transform[3];

                      const dx = transform[4];
                      const dy = transform[5];

                      ctx!.drawImage(
                        lastImageToDraw,
                        0,
                        0,
                        +lastImageToDraw.width,
                        +lastImageToDraw.height,
                        dx,
                        dy,
                        dw,
                        dh,
                      );
                    }
                  }

                  this.changed();

                  resolve(canvas); // will have no effect if the canvas is already resolved

                  // schedule the next preview if necessary and the job is still active
                  if (!skipPreviewRendering && job.isActive()) {
                    setTimeout(schedulePreivew, this.previewTimeout);
                  }
                }
              });
            };
            schedulePreivew();
          }

          job.finished(() => {
            putRenderedImage();

            // store the current canvas to reuse it in upcoming previews
            if (this.preview && this.previewOverlay) {
              this.lastImage = this.image;
            }

            this.changed();

            resolve(canvas); // will have no effect if the canvas is already resolved

            // remove the job from the list of pending jobs
            this.jobs = this.jobs.filter((j) => j !== job);
          });
        });
      },
      ...options,
    });

    this.api = api;
    this.preview =
      typeof options.preview !== "undefined" ? options.preview : true;
    this.previewTimeout =
      typeof options.previewTimeout !== "undefined"
        ? options.previewTimeout
        : 200;
    this.previewOverlay =
      typeof options.previewOverlay !== "undefined"
        ? options.previewOverlay
        : true;
  }

  public killPendingJobs() {
    while (this.jobs.length > 0) {
      const job = this.jobs.pop();
      if (job && job.isActive()) {
        new Promise((resolve) => {
          job.cancelWithoutBlocking();
          resolve(null);
        });
      }
    }
  }
}
