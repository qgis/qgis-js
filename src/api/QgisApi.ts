import { QgisModelConstructors, Rectangle, MapLayer } from "./QgisModel";

/**
 * Common QGIS API which exposes the {@link QgisModelConstructors} and methods that can be accessed from both the public {@link QgisApi} and the {@link InternalQgisApi}.
 */
export interface CommonQgisApi extends QgisModelConstructors {
  /**
   * Loads a QGIS project file.
   *
   * @param filename - The path to the QGIS project file.
   * @returns true if the project was loaded successfully, false otherwise.
   */
  loadProject(filename: string): boolean;

  /**
   * Returns the full extent of the loaded project.
   *
   * @returns The full extent of the loaded project.
   */
  fullExtent(): Rectangle;

  /**
   * Returns the SRID of the loaded project.
   *
   * @returns The SRID of the loaded project.
   */
  srid(): string;

  /**
   * Transforms a rectangle from one SRID to another.
   *
   * @param rect - The rectangle to transform.
   * @param inputSrid - The SRID of the input rectangle.
   * @param outputSrid - The SRID of the output rectangle.
   * @returns The transformed rectangle.
   */
  transformRectangle(
    rect: Rectangle,
    inputSrid: string,
    outputSrid: string,
  ): Rectangle;

  /**
   * Gets the current map theme of the current project.
   *
   * @returns The name of the current map theme. An empty string if no map theme is set.
   */
  getMapTheme(): string;

  /**
   * Sets a map theme of the current project.
   *
   * @param
   * @returns true if the map theme was loaded successfully, false otherwise.
   */
  setMapTheme(mapTheme: string): boolean;
}

/**
 * The QgisApiAdapter provides convenience methods in addition to the CommonQgisApi.
 */
export interface QgisApiAdapter {
  /**
   * Renders an image of the loaded project.
   *
   * @param srid - The SRID of the image.
   * @param extent - The extent of the image.
   * @param width - The width of the image.
   * @param height - The height of the image.
   * @param pixelRatio - The optional pixel ratio of the image which defaults to 1.
   * @returns The rendered tile as an ImageData object.
   */
  renderImage(
    srid: string,
    extent: Rectangle,
    width: number,
    height: number,
    pixelRatio?: number,
  ): Promise<ImageData>;

  /**
   * Renders a tile of the loaded project in the XYZ scheme (EPSG:3857).
   *
   * @param x - The x coordinate of the tile.
   * @param y - The y coordinate of the tile.
   * @param z - The z coordinate of the tile.
   * @param tileSize - The optional size of the tile which defaults to 256.
   * @param pixelRatio - The optional pixel ratio of the tile which defaults to 1.
   * @param extentBufferFactor - The optional extent buffer factor of the tile which defaults to 0.
   * @returns The rendered tile as an ImageData object.
   */
  renderXYZTile(
    x: number,
    y: number,
    z: number,
    tileSize?: number,
    pixelRatio?: number,
    extentBufferFactor?: number,
  ): Promise<ImageData>;

  /**
   * Returns the map layers of the loaded project.
   *
   * @returns The map layers of the loaded project.
   */
  mapLayers(): readonly MapLayer[];

  /**
   * Returns the map themes of the loaded project.
   *
   * @returns The map themes of the loaded project.
   */
  mapThemes(): readonly string[];
}

/**
 * Interface representing the public QgisApi.
 */
export interface QgisApi extends CommonQgisApi, QgisApiAdapter {}

/**
 * The internal Qgis API which can be accessed from the QgisRuntimeModule
 *
 * This interface is not a stable API and may change at any time. Use the public {@link QgisApi} instead.
 */
export interface InternalQgisApi extends CommonQgisApi {
  renderImage(
    srid: string,
    extent: Rectangle,
    width: number,
    height: number,
    pixelRatio: number,
    callback: (tileData: ArrayBufferLike) => void,
  ): void;
  renderXYZTile(
    x: number,
    y: number,
    z: number,
    tileSize: number,
    pixelRatio: number,
    extentBuffer: number,
    callback: (tileData: ArrayBufferLike) => void,
  ): number;
  mapLayers(): any;
  mapThemes(): any;
}
