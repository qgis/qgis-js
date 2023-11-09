import type { QgisApi } from "qgis-js";

import XYZ, { Options } from "ol/source/XYZ";

import { createCanvasContext2D } from "ol/dom";
import { toSize } from "ol/size";

import type { TileCoord } from "ol/tilecoord";
import ImageTile from "ol/ImageTile";

export interface QgisXYZDataSourceOptions extends Options {
  extentBufferFactor?: number | (() => number);
  renderFunction?: QgisXYZRenderFunction;
  debug?: boolean;
}

export type QgisXYZRenderFunction = (
  api: QgisApi,
  tileCoord: TileCoord,
  tileSize: number,
  pixelRatio: number,
  extentBufferFactor: number,
) => Promise<ImageData>;

export class QgisXYZDataSource extends XYZ {
  protected api: QgisApi;

  protected static DEFAULT_RENDERFUNCTION: QgisXYZRenderFunction = (
    api: QgisApi,
    tileCoord: TileCoord,
    tileSize: number,
    devicePixelRatio: number,
    extentBufferFactor: number,
  ) => {
    return api.renderXYZTile(
      tileCoord[1],
      tileCoord[2],
      tileCoord[0],
      tileSize,
      devicePixelRatio,
      extentBufferFactor,
    );
  };

  protected renderFunction: QgisXYZRenderFunction | undefined;

  protected getrenderFunction(): QgisXYZRenderFunction {
    return this.renderFunction || QgisXYZDataSource.DEFAULT_RENDERFUNCTION;
  }

  protected static DEFAULT_EXTENTBUFFERFACTOR = 0;

  protected extentBufferFactor: number | number | (() => number) | undefined;

  protected getextentBufferFactor(): number {
    return typeof this.extentBufferFactor === "function"
      ? this.extentBufferFactor()
      : this.extentBufferFactor || QgisXYZDataSource.DEFAULT_EXTENTBUFFERFACTOR;
  }

  constructor(api: QgisApi, options: QgisXYZDataSourceOptions = {}) {
    super({
      tileUrlFunction: (tileCoord, pixelRatio) => {
        const tileSize = (
          toSize(this.tileGrid!.getTileSize(tileCoord[0])) as [number, number]
        )[0];
        return `${tileSize * (pixelRatio || 1)}`;
      },
      tileLoadFunction: async (tile, text) => {
        const renderFunction = this.getrenderFunction();
        if (this.tileGrid && renderFunction) {
          console.assert(tile instanceof ImageTile);
          const imageTile = tile as ImageTile;

          const tileSize = parseInt(text);
          const pixelRatio = Math.round(tileSize / 256);

          const context = createCanvasContext2D(tileSize, tileSize);

          const imageData = await renderFunction(
            this.api,
            tile.getTileCoord(),
            tileSize,
            pixelRatio,
            this.getextentBufferFactor(),
          );
          context.putImageData(imageData, 0, 0);

          if (options.debug) {
            context.strokeStyle = "grey";
            context.strokeRect(0.5, 0.5, tileSize + 0.5, tileSize + 0.5);

            context.fillStyle = "darkgrey";
            context.strokeStyle = "black";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = "20px sans-serif";
            context.lineWidth = 2;
            context.strokeText(text, tileSize / 2, tileSize / 2, tileSize);
            context.fillText(text, tileSize / 2, tileSize / 2, tileSize);
          }

          imageTile.setImage(context.canvas);
        }
      },
      ...options,
    });

    this.api = api;
    this.renderFunction = options.renderFunction;
    this.extentBufferFactor = options.extentBufferFactor;
  }
}
