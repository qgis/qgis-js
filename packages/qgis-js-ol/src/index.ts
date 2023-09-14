import type { QgisApi } from "qgis-js";

import {
  QgisXYZDataSource,
  QgisXYZDataSourceOptions,
} from "./QgisXYZDataSource";
import {
  QgisCanvasDataSource,
  QgisCanvasDataSourceOptions,
} from "./QgisCanvasDataSource";
import type { TileCoord } from "ol/tilecoord";

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
          new api.Rectangle(xMin, yMin, xMax, yMax),
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
