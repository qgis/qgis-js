import { InternalQgisApi, QgisApi, QgisApiAdapter } from "../src/api/QgisApi";
import { Rectangle } from "../src/api/QgisModel";

export class QgisApiAdapterImplementation implements QgisApiAdapter {
  private readonly _api: InternalQgisApi;

  constructor(api: InternalQgisApi) {
    this._api = api;
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
