import { CommonQgisApi } from "./common";

import { Rectangle } from "./model";

/**
 * @internal
 */
export interface InternalQgisApi extends CommonQgisApi {
  loadProject(filename: string): boolean;
  renderMap(
    extent: Rectangle,
    width: number,
    height: number,
    callback: () => void,
  ): void;
  renderImage(
    srid: string,
    extent: Rectangle,
    width: number,
    height: number,
    callback: (tileData: ArrayBufferLike) => void,
  ): void;
  renderXYZTile(
    x: number,
    y: number,
    z: number,
    tileSize: number,
    callback: (tileData: ArrayBufferLike) => void,
  ): number;
  mapData(): ArrayBufferLike;
}
