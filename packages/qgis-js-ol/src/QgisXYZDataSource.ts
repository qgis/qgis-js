import XYZ, { Options } from "ol/source/XYZ";

import { createCanvasContext2D } from "ol/dom";
import { toSize } from "ol/size";

import type { TileCoord } from "ol/tilecoord";
import ImageTile from "ol/ImageTile";

export type QgisXYZRenderFunction = (
  tileCoord: TileCoord,
  tileSize: number,
  pixelRatio: number,
) => Promise<ImageData>;

export interface QgisXYZDataSourceOptions extends Options {
  debug?: boolean;
}

export class QgisXYZDataSource extends XYZ {
  /**
   * @internal
   */
  protected renderFunction: QgisXYZRenderFunction;

  constructor(
    renderFunction: QgisXYZRenderFunction,
    options: QgisXYZDataSourceOptions = {},
  ) {
    super({
      tileUrlFunction: (tileCoord, pixelRatio) => {
        const tileSize = (
          toSize(this.tileGrid!.getTileSize(tileCoord[0])) as [number, number]
        )[0];
        return `${tileSize * (pixelRatio || 1)}`;
      },
      tileLoadFunction: async (tile, text) => {
        if (this.tileGrid && this.renderFunction) {
          console.assert(tile instanceof ImageTile);
          const imageTile = tile as ImageTile;

          const tileSize = parseInt(text);
          const pixelRatio = Math.round(tileSize / 256);

          const context = createCanvasContext2D(tileSize, tileSize);
          const imageData = await this.renderFunction(
            tile.getTileCoord(),
            tileSize,
            pixelRatio,
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

    this.renderFunction = renderFunction;
  }
}
