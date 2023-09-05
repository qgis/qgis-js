import { QgisApi } from "../api/public";

import {
  QgisXYZDataSource,
  QgisXYZDataSourceOptions,
} from "./QgisXYZDataSource";
import {
  QgisCanvasDataSource,
  QgisCanvasDataSourceOptions,
} from "./QgisCanvasDataSource";
import type { TileCoord } from "ol/tilecoord";

/**
 * @public
 */
export type Mode = "xyz" | "canvas";

export class QgisOpenLayers {
  QgisXYZDataSource(api: QgisApi, options?: QgisXYZDataSourceOptions) {
    return new QgisXYZDataSource(
      (tileCoord: TileCoord, tileSize: number) => {
        return api.renderXYZTile(
          tileCoord[1],
          tileCoord[2],
          tileCoord[0],
          tileSize,
        );
      },
      {
        ...(options ? options : {}),
      },
    );
  }
  QgisCanvasDataSource(api: QgisApi, options?: QgisCanvasDataSourceOptions) {
    return new QgisCanvasDataSource(
      (
        srid: string,
        xMin: number,
        yMin: number,
        xMax: number,
        yMax: number,
        width: number,
        height: number,
      ) => {
        return api.renderImage(
          srid,
          api.Rectangle(xMin, yMin, xMax, yMax),
          width,
          height,
        );
      },
      {
        ...options,
        ...{
          //TODO: make this work with the projection of the QGIS project
          //projection: "EPSG:3857",
          //projection: api.srid()
        },
      },
    );
  }
}

export async function resolveOpenLayers(): Promise<QgisOpenLayers | undefined> {
  return new Promise(async (resolve) => {
    try {
      // ensure "ol" is available
      const ol = await import(/* @vite-ignore */ "ol");
      if (ol) {
        resolve(new QgisOpenLayers());
        return;
      }
    } catch (error) {}
    resolve(undefined);
  });
}
