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
  mapData(): ArrayBufferLike;
}
