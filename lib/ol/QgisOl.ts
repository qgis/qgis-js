import { QgisApi } from "../api/public";

import { QgisXYZDataSource } from "./QgisXYZDataSource";
import type { TileCoord } from "ol/tilecoord";

/**
 * @public
 */
export type Mode = "xyz" | "canvas";

export const QgisOpenLayers = {
  qgisCanvasDataSource(api: QgisApi) {
    return new QgisXYZDataSource({
      renderFunction: (tileCoord: TileCoord, tileSize: number) => {
        return api.render(
          api.Rectangle(tileCoord[0], tileCoord[1], tileCoord[2], tileCoord[3]),
          tileSize,
          tileSize,
        );
      },
      debug: false,
    });
  },
};

export async function resolveOpenLayers(): Promise<
  typeof QgisOpenLayers | undefined
> {
  return new Promise((resolve) => {
    resolve(undefined);
  });
}
