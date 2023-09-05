import { CommonQgisApi } from "./common";
import { InternalQgisApi } from "../api/internal";

import { Rectangle, PointXY } from "./model";

export interface QgisApiAdapter {
  loadProject(filename: string): boolean;
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
}

/**
 * @public
 */
export interface QgisApi extends CommonQgisApi, QgisApiAdapter {
  /**
   * @internal
   */
  internal(): InternalQgisApi;
}

/**
 * @public
 */
export class QgisApiAdapterImplementation implements QgisApiAdapter {
  private readonly _api: InternalQgisApi;

  constructor(api: InternalQgisApi) {
    this._api = api;
  }

  // TODO make this async
  loadProject(filename: string): boolean {
    return this._api.loadProject(filename);
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

export function getQgisApiProxy(api: InternalQgisApi): QgisApi {
  const adapter = new QgisApiAdapterImplementation(api);
  // @ts-ignore

  const registeredClasses: Array<{
    name: string;
    constructor: Function;
  }> = [
    ...new Set(
      // @ts-ignore
      Object.values(api.registeredTypes)
        .filter((type: any) => type.registeredClass)
        .map((type: any) => type.registeredClass),
    ),
  ];

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
          // check if the property is a registered class
          const registeredClass = registeredClasses.find(
            (registeredClass) => registeredClass.name === property,
          );
          if (registeredClass) {
            // we have to invoke "new" and forward all arguments to the constructor
            return (...args: any[]) => {
              // @ts-ignore
              return new api[property](...args);
            };
          }
          // otherwise we just return the property of the InternalQgisApi
          else {
            // TODO this exposes also the internal API?
            // @ts-ignore
            return api[property];
          }
        }
      },
    },
  );
}
