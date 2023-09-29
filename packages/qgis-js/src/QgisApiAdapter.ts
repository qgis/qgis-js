import {
  InternalQgisApi,
  QgisApi,
  QgisApiAdapter,
} from "../../../src/api/QgisApi";
import { MapLayer, Rectangle } from "../../../src/api/QgisModel";

import { threadPoolSize } from "./runtime";

import pLimit from "p-limit";
import type { LimitFunction } from "p-limit";

export class QgisApiAdapterImplementation implements QgisApiAdapter {
  private readonly _api: InternalQgisApi;
  private readonly _threadPoolSize: number;
  private readonly _limit: LimitFunction;

  constructor(api: InternalQgisApi) {
    this._api = api;
    this._threadPoolSize = threadPoolSize();
    this._limit = pLimit(this._threadPoolSize);
  }

  protected runLimited<T>(fn: () => Promise<T>): Promise<T> {
    return this._limit(fn);
  }

  renderImage(
    srid: string,
    extent: Rectangle,
    width: number,
    height: number,
  ): Promise<ImageData> {
    return this.runLimited(() => {
      return new Promise((resolve) => {
        this._api.renderImage(srid, extent, width, height, (tileData) => {
          const data = new Uint8ClampedArray(tileData);
          const imageData = new ImageData(data, width, height);
          resolve(imageData);
        });
      });
    });
  }
  renderXYZTile(
    x: number,
    y: number,
    z: number,
    tileSize: number,
  ): Promise<ImageData> {
    return this.runLimited(() => {
      return new Promise((resolve) => {
        this._api.renderXYZTile(x, y, z, tileSize, (tileData) => {
          const data = new Uint8ClampedArray(tileData);
          const imageData = new ImageData(data, tileSize, tileSize);
          resolve(imageData);
        });
      });
    });
  }

  mapLayers(): readonly MapLayer[] {
    const mapLayersRaw = this._api.mapLayers();
    const result = new Array<MapLayer>(mapLayersRaw.size());
    for (let i = 0; i < mapLayersRaw.size(); i++) {
      result[i] = mapLayersRaw.get(i);
    }
    return result;
  }
}

export function getQgisApiProxy(api: InternalQgisApi): QgisApi {
  const adapter = new QgisApiAdapterImplementation(api);

  return new Proxy<QgisApi>(
    // @ts-ignore
    {},
    {
      has(_target, property) {
        return property in adapter || property in api;
      },
      get(_target, property) {
        if (property in adapter) {
          // @ts-ignore
          return adapter[property];
        } else if (property in api) {
          // @ts-ignore
          return api[property];
        }
      },
    },
  );
}
