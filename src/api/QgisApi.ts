import { QgisModelConstructors, Rectangle, MapLayer } from "./QgisModel";

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
  mapLayers(): readonly MapLayer[];
}

export interface QgisApi extends CommonQgisApi, QgisApiAdapter {}

export interface InternalQgisApi extends CommonQgisApi {
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
  mapLayers(): any;
}
