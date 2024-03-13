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
    pixelRatio: number = 1, // window?.devicePixelRatio || 1,
    previewCallback?: (preview: ImageData) => void,
    cancelTokenFactory?: (cancelToken: () => void) => void,
  ): Promise<ImageData> {
    return this.runLimited(() => {
      return new Promise((resolve) => {
        console.time(`render`);
        let cancelTokenFunction: (() => void) | undefined;
        const cancelToken = this._api.renderImage(
          srid,
          extent,
          width,
          height,
          pixelRatio,
          (tileData) => {
            cancelTokenFunction = undefined;
            console.timeEnd(`render`);
            console.time(`copy`);
            const data = new Uint8ClampedArray(tileData);
            const imageData = new ImageData(data, width, height);
            console.timeEnd(`copy`);
            resolve(imageData);
          },
          previewCallback
            ? (tileData) => {
                const data = new Uint8ClampedArray(tileData);
                const imageData = new ImageData(data, width, height);
                previewCallback(imageData);
              }
            : undefined,
        );
        cancelTokenFunction = cancelToken.cancle;
        if (cancelTokenFactory) {
          cancelTokenFactory(() => {
            if (cancelTokenFunction) {
              cancelTokenFunction();
            }
          });
        }
      });
    });
  }
  renderXYZTile(
    x: number,
    y: number,
    z: number,
    tileSize: number = 256,
    pixelRatio: number = window?.devicePixelRatio || 1,
    extentBuffer: number = 0,
  ): Promise<ImageData> {
    return this.runLimited(() => {
      return new Promise((resolve) => {
        this._api.renderXYZTile(
          x,
          y,
          z,
          tileSize,
          pixelRatio,
          extentBuffer,
          (tileData) => {
            const data = new Uint8ClampedArray(tileData);
            const imageData = new ImageData(data, tileSize, tileSize);
            resolve(imageData);
          },
        );
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

  mapThemes(): readonly string[] {
    const mapLayersRaw = this._api.mapThemes();
    const result = new Array<string>(mapLayersRaw.size());
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
