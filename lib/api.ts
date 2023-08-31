export interface PointXY {
  x: number;
  y: number;
}

export interface Rectangle {
  mXmin: number;
  mYmin: number;
  mXmax: number;
  mYmax: number;

  scale(factor: number): void;
  move(dx: number, dy: number): void;
}

export interface QgisInternalApi {
  loadProject(filename: string): boolean;
  fullExtent(): Rectangle;
  renderMap(
    extent: Rectangle,
    width: number,
    height: number,
    callback: () => void,
  ): void;
  mapData(): ArrayBufferLike;
}

export interface QgisApi {
  loadProject(filename: string): boolean;
  fullExtent(): Rectangle;
  render(extent: Rectangle, width: number, height: number): Promise<ImageData>;
}

export class QgisApiAdapter implements QgisApi {
  private readonly _api: QgisInternalApi;

  constructor(api: QgisInternalApi) {
    this._api = api;
  }
  loadProject(filename: string): boolean {
    return this._api.loadProject(filename);
  }
  fullExtent(): Rectangle {
    return this._api.fullExtent();
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
}
