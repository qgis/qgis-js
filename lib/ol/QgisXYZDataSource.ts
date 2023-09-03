import XYZ, { Options } from "ol/source/XYZ";

import { createCanvasContext2D } from "ol/dom";
import { toSize } from "ol/size";

import type { TileCoord } from "ol/tilecoord";
import ImageTile from "ol/ImageTile";

export const QGIS_TILE_SIZE = 512;

/**
 * @internal
 */
export type QgisXYZRenderFunction = (
  tileCoord: TileCoord,
  tileSize: number,
) => Promise<ImageData>;

/**
 * @public
 */
export interface QgisXYZDataSourceOptions extends Options {
  /**
   * @internal
   */
  renderFunction: QgisXYZRenderFunction;
  debug?: boolean;
}

/**
 * @public
 */
export class QgisXYZDataSource extends XYZ {
  protected static readonly QGIS_TILE_URL = "z:{z} x:{x} y:{y}";

  /**
   * @internal
   */
  protected renderFunction: QgisXYZRenderFunction;

  constructor(options: QgisXYZDataSourceOptions) {
    const pixelRatio = 1; // FIXME: not working in FF (where dpr is > 1): window.devicePixelRatio || 1;

    super({
      tileLoadFunction: async (tile, text) => {
        if (this.tileGrid && this.renderFunction) {
          console.assert(tile instanceof ImageTile);
          const imageTile = tile as ImageTile;

          tile.getTileCoord();

          const z = tile.getTileCoord()[0];
          const tileSize = toSize(this.tileGrid.getTileSize(z));
          const context = createCanvasContext2D(tileSize[0], tileSize[1]);

          const imageData = await this.renderFunction(
            tile.getTileCoord(),
            Math.round(pixelRatio * QGIS_TILE_SIZE),
          );
          context.putImageData(imageData, 0, 0);

          if (options.debug) {
            context.strokeStyle = "grey";
            context.strokeRect(0.5, 0.5, tileSize[0] + 0.5, tileSize[1] + 0.5);

            context.fillStyle = "darkgrey";
            context.strokeStyle = "black";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = "20px sans-serif";
            context.lineWidth = 2;
            context.strokeText(
              text,
              tileSize[0] / 2,
              tileSize[1] / 2,
              tileSize[0],
            );
            context.fillText(
              text,
              tileSize[0] / 2,
              tileSize[1] / 2,
              tileSize[0],
            );
          }

          imageTile.setImage(context.canvas);
        }
      },
      ...options,
      ...{
        tileSize: QGIS_TILE_SIZE,
        tilePixelRatio: pixelRatio,
        url: QgisXYZDataSource.QGIS_TILE_URL,
      },
    });

    this.renderFunction = options.renderFunction;
  }
}
