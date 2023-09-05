import { CommonQgisApi } from "./common";
import { InternalQgisApi } from "../api/internal";

import { Rectangle, PointXY } from "./model";

/**
 * @public
 */
export interface QgisApi extends CommonQgisApi {
  loadProject(filename: string): boolean;
  fullExtent(): Rectangle;
  render(extent: Rectangle, width: number, height: number): Promise<ImageData>;
  renderImage(
    srdi: string,
    extent: Rectangle,
    width: number,
    height: number,
  ): Promise<ImageData>;
  renderXYZTile(
    x: number,
    y: number,
    z: number,
    tileSize: number,
  ): Promise<ImageData>;

  /**
   * @internal
   */
  internal(): InternalQgisApi;
}

/**
 * @public
 */
export class QgisApiAdapter implements QgisApi {
  private readonly _api: InternalQgisApi;

  constructor(api: InternalQgisApi) {
    this._api = api;
  }

  PointXY(): PointXY {
    //@ts-ignore
    return new this._api.PointXY(...arguments);
  }

  Rectangle(): Rectangle {
    //@ts-ignore
    return new this._api.Rectangle(...arguments);
  }

  loadProject(filename: string): boolean {
    return this._api.loadProject(filename);
  }
  fullExtent(): Rectangle {
    return this._api.fullExtent();
  }
  srid(): string {
    return this._api.srid();
  }

  render(extent: Rectangle, width: number, height: number): Promise<ImageData> {
    return new Promise((resolve) => {
      this._api.renderMap(extent, width, height, () => {
        const data = new Uint8ClampedArray(this._api.mapData());
        const imageData = new ImageData(data, width, height);
        resolve(imageData);
      });
    });
  }
  renderImage(
    srid: string,
    extent: Rectangle,
    width: number,
    height: number,
  ): Promise<ImageData> {
    return new Promise((resolve) => {
      this._api.renderImage(srid, extent, width, height, (tileData) => {
        const data = new Uint8ClampedArray(tileData);
        const imageData = new ImageData(data, width, height);
        resolve(imageData);
      });
    });
  }
  renderXYZTile(
    x: number,
    y: number,
    z: number,
    tileSize: number,
  ): Promise<ImageData> {
    return new Promise((resolve) => {
      this._api.renderXYZTile(x, y, z, tileSize, (tileData) => {
        const data = new Uint8ClampedArray(tileData);
        const imageData = new ImageData(data, tileSize, tileSize);
        resolve(imageData);
      });
    });
  }

  /**
   * @internal
   */
  internal() {
    return this._api;
  }
}
