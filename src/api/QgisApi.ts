import { QgisModelConstructors, Rectangle } from "./QgisModel";

export interface CommonQgisApi extends QgisModelConstructors {
  loadProject(filename: string): boolean;
  fullExtent(): Rectangle;
  srid(): string;
  transformRectangle(
    rect: Rectangle,
    inputSrid: string,
    outputSrid: string,
  ): Rectangle;
}

export interface QgisApiAdapter {
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

export interface QgisApi extends CommonQgisApi, QgisApiAdapter {}

export interface InternalQgisApi extends CommonQgisApi {
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